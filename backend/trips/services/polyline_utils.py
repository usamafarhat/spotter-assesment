"""Polyline helpers for fuel-stop placement along a combined route."""

from __future__ import annotations

import math
from collections.abc import Sequence

EARTH_RADIUS_MILES = 3958.8


def haversine_miles(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float,
) -> float:
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(d_lng / 2) ** 2
    )
    return 2 * EARTH_RADIUS_MILES * math.asin(math.sqrt(a))


def merge_polylines(
    leg_to_pickup: Sequence[Sequence[float]],
    leg_to_delivery: Sequence[Sequence[float]],
) -> list[list[float]]:
    """Join pickup + delivery legs into one path (for fuel mile lookup)."""
    if not leg_to_pickup:
        return [list(point) for point in leg_to_delivery]
    if not leg_to_delivery:
        return [list(point) for point in leg_to_pickup]

    merged = [list(point) for point in leg_to_pickup]
    last = merged[-1]
    first_delivery = leg_to_delivery[0]

    start_index = 0
    if (
        abs(last[0] - first_delivery[0]) < 0.0001
        and abs(last[1] - first_delivery[1]) < 0.0001
    ):
        start_index = 1

    for point in leg_to_delivery[start_index:]:
        merged.append([float(point[0]), float(point[1])])

    return merged


def point_at_trip_miles(
    polyline: Sequence[Sequence[float]],
    target_miles: float,
) -> tuple[float, float] | None:
    if not polyline:
        return None

    if target_miles <= 0:
        lat, lng = polyline[0]
        return float(lat), float(lng)

    traveled = 0.0
    for index in range(1, len(polyline)):
        prev_lat, prev_lng = polyline[index - 1]
        lat, lng = polyline[index]
        segment_miles = haversine_miles(prev_lat, prev_lng, lat, lng)

        if traveled + segment_miles >= target_miles:
            remaining = target_miles - traveled
            ratio = remaining / segment_miles if segment_miles else 0
            return (
                prev_lat + (lat - prev_lat) * ratio,
                prev_lng + (lng - prev_lng) * ratio,
            )

        traveled += segment_miles

    lat, lng = polyline[-1]
    return float(lat), float(lng)
