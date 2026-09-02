"""
Trip planning orchestration (backend-only).

Two route legs from OpenRouteService:
  current → pickup, then pickup → delivery.

Skips an ORS call when a leg has no distance (same location).
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from ..models import Trip
from .openrouteservice import RouteResult, get_driving_route

COORD_EPSILON = 0.0001


def _as_float(value: Any) -> float:
    return float(value)


def _coords_match(
    lat_a: float,
    lng_a: float,
    lat_b: float,
    lng_b: float,
) -> bool:
    return (
        abs(lat_a - lat_b) < COORD_EPSILON and abs(lng_a - lng_b) < COORD_EPSILON
    )


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


def create_planned_trip(validated_data: dict[str, Any]) -> Trip:
    """
    Create a planned trip with up to two ORS route legs.

    When pickup is the same as current, leg 1 is skipped (no ORS call).
    Raises OpenRouteServiceError when routing fails.
    """
    current = validated_data["current_location"]
    pickup = validated_data["pickup_location"]
    delivery = validated_data["delivery_location"]
    pickup_same_as_current = validated_data.get("pickup_same_as_current", False)

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

    return Trip.objects.create(
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
        route_to_pickup_polyline=leg_to_pickup.polyline,
        route_to_delivery_polyline=leg_to_delivery.polyline,
    )
