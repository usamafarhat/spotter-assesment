"""
Trip planning orchestration (backend-only).

Validates inputs arrive already-validated from the serializer.
Fetches a driving route, then persists the Trip.
"""

from __future__ import annotations

from typing import Any

from ..models import Trip
from .openrouteservice import get_driving_route


def _as_float(value: Any) -> float:
    return float(value)


def create_planned_trip(validated_data: dict[str, Any]) -> Trip:
    """
    Create a planned trip with ORS route polyline + distance/duration.

    Waypoints: current location → pickup → delivery.
    Raises OpenRouteServiceError when routing fails.
    """
    current = validated_data["current_location"]
    pickup = validated_data["pickup_location"]
    delivery = validated_data["delivery_location"]

    route = get_driving_route(
        [
            (_as_float(current["latitude"]), _as_float(current["longitude"])),
            (_as_float(pickup["latitude"]), _as_float(pickup["longitude"])),
            (_as_float(delivery["latitude"]), _as_float(delivery["longitude"])),
        ],
        waypoint_labels=(
            "current location",
            "pickup location",
            "delivery location",
        ),
    )

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
        total_distance_miles=route.distance_miles,
        total_duration_hours=route.duration_hours,
        route_polyline=route.polyline,
    )
