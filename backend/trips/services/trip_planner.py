"""
Trip planning orchestration (backend-only).

Flow:
  1. Fetch up to two ORS legs (current→pickup, pickup→delivery)
  2. Build HOS schedule from exact leg miles/hours
  3. Save Trip + DutySegment rows
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from django.db import transaction
from django.utils import timezone

from ..models import DutySegment, Trip
from .hos import build_hos_plan
from .openrouteservice import RouteResult, get_driving_route

COORD_EPSILON = 0.0001


def _as_float(value: Any) -> float:
    return float(value)


def _optional_decimal(value: float | None, *, places: int = 1) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(round(value, places)))


def _coords_match(
    lat_a: float,
    lng_a: float,
    lat_b: float,
    lng_b: float,
) -> bool:
    return abs(lat_a - lat_b) < COORD_EPSILON and abs(lng_a - lng_b) < COORD_EPSILON


def _empty_route() -> RouteResult:
    return RouteResult(
        distance_miles=Decimal("0.0"),
        duration_hours=Decimal("0.0"),
        polyline=[],
    )


def _fetch_leg(
    origin: tuple[float, float],
    destination: tuple[float, float],
    *,
    origin_label: str,
    destination_label: str,
) -> RouteResult:
    if _coords_match(origin[0], origin[1], destination[0], destination[1]):
        return _empty_route()

    return get_driving_route(
        [origin, destination],
        waypoint_labels=(origin_label, destination_label),
    )


@transaction.atomic
def create_planned_trip(validated_data: dict[str, Any]) -> Trip:
    """
    Create a planned trip with ORS routes + HOS duty schedule.

    When pickup equals current, leg 1 skips ORS (0 mi / 0 hr).
    Raises OpenRouteServiceError when routing fails.
    """
    current = validated_data["current_location"]
    pickup = validated_data["pickup_location"]
    delivery = validated_data["delivery_location"]
    pickup_same_as_current = validated_data.get("pickup_same_as_current", False)
    trip_start = timezone.now()

    current_coords = (
        _as_float(current["latitude"]),
        _as_float(current["longitude"]),
    )
    pickup_coords = (
        _as_float(pickup["latitude"]),
        _as_float(pickup["longitude"]),
    )
    delivery_coords = (
        _as_float(delivery["latitude"]),
        _as_float(delivery["longitude"]),
    )

    if pickup_same_as_current or _coords_match(
        current_coords[0],
        current_coords[1],
        pickup_coords[0],
        pickup_coords[1],
    ):
        leg_to_pickup = _empty_route()
    else:
        leg_to_pickup = _fetch_leg(
            current_coords,
            pickup_coords,
            origin_label="current location",
            destination_label="pickup location",
        )

    leg_to_delivery = _fetch_leg(
        pickup_coords,
        delivery_coords,
        origin_label="pickup location",
        destination_label="delivery location",
    )

    total_distance_miles = leg_to_pickup.distance_miles + leg_to_delivery.distance_miles
    total_duration_hours = leg_to_pickup.duration_hours + leg_to_delivery.duration_hours

    hos_plan = build_hos_plan(
        leg_to_pickup_miles=float(leg_to_pickup.distance_miles),
        leg_to_pickup_hours=float(leg_to_pickup.duration_hours),
        leg_to_delivery_miles=float(leg_to_delivery.distance_miles),
        leg_to_delivery_hours=float(leg_to_delivery.duration_hours),
        route_to_pickup_polyline=leg_to_pickup.polyline,
        route_to_delivery_polyline=leg_to_delivery.polyline,
        current_cycle_used_hrs=float(validated_data["current_cycle_used_hrs"]),
        trip_start=trip_start,
    )

    trip = Trip.objects.create(
        current_address=current["address"],
        current_latitude=current["latitude"],
        current_longitude=current["longitude"],
        pickup_address=pickup["address"],
        pickup_latitude=pickup["latitude"],
        pickup_longitude=pickup["longitude"],
        delivery_address=delivery["address"],
        delivery_latitude=delivery["latitude"],
        delivery_longitude=delivery["longitude"],
        current_cycle_used_hrs=validated_data["current_cycle_used_hrs"],
        notes=validated_data.get("notes", ""),
        status=Trip.Status.PLANNED,
        total_distance_miles=total_distance_miles,
        total_duration_hours=total_duration_hours,
        total_trip_hours=hos_plan.total_trip_hours,
        route_to_pickup_polyline=leg_to_pickup.polyline,
        route_to_delivery_polyline=leg_to_delivery.polyline,
        started_at=hos_plan.trip_start,
    )

    DutySegment.objects.bulk_create(
        [
            DutySegment(
                trip=trip,
                sequence=index,
                duty_status=segment.duty_status,
                stop_type=segment.stop_type,
                started_at=segment.started_at,
                ended_at=segment.ended_at,
                miles_at_start=_optional_decimal(segment.miles_at_start),
                miles_at_end=_optional_decimal(segment.miles_at_end),
                latitude=_optional_decimal(segment.latitude, places=6),
                longitude=_optional_decimal(segment.longitude, places=6),
            )
            for index, segment in enumerate(hos_plan.segments)
        ]
    )

    return trip
