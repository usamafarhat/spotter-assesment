"""
OpenRouteService HTTP client (backend-only).

Used by trip planning — not exposed as a public API endpoint.
"""

from __future__ import annotations

import re
from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal

import httpx
from django.conf import settings

METERS_PER_MILE = 1609.344
DEFAULT_PROFILE = "driving-hgv"
DEFAULT_SNAP_RADIUS_M = 350
EXTENDED_SNAP_RADIUS_M = 2000

_COORDINATE_INDEX_RE = re.compile(r"(?:coordinate|point)\s+(\d+)", re.IGNORECASE)


class OpenRouteServiceError(Exception):
    """Raised when ORS is misconfigured or a directions request fails."""

    def __init__(
        self,
        message: str,
        *,
        http_status: int = 502,
        user_message: str | None = None,
        ors_detail: str | None = None,
    ) -> None:
        super().__init__(message)
        self.http_status = http_status
        self.user_message = user_message or message
        self.ors_detail = ors_detail or message


@dataclass(frozen=True)
class RouteResult:
    """Normalized driving route for trip planning."""

    distance_miles: Decimal
    duration_hours: Decimal
    # [[lat, lng], ...] — matches Trip.route_polyline storage
    polyline: list[list[float]]


def _require_api_key() -> str:
    api_key = (settings.OPENROUTESERVICE_API_KEY or "").strip()
    if not api_key:
        raise OpenRouteServiceError(
            "OPENROUTESERVICE_API_KEY is not configured.",
            http_status=503,
            user_message=(
                "Trip planning is temporarily unavailable. "
                "Please try again later."
            ),
        )
    return api_key


def get_driving_route(
    waypoints: Sequence[tuple[float, float]],
    *,
    waypoint_labels: Sequence[str] | None = None,
    profile: str = DEFAULT_PROFILE,
    timeout_seconds: float = 30.0,
) -> RouteResult:
    """
    Request a driving route between waypoints.

    Attempt 1 uses ORS default snap radius (~350 m).
    Attempt 2 widens snap to EXTENDED_SNAP_RADIUS_M for off-road pins.

    Args:
        waypoints: Sequence of (latitude, longitude) points in travel order.
        waypoint_labels: Optional labels for user-facing errors (same order).
        profile: ORS routing profile (default: driving-hgv).
        timeout_seconds: HTTP timeout.
    """
    if len(waypoints) < 2:
        raise OpenRouteServiceError(
            "At least two waypoints are required.",
            http_status=400,
            user_message="At least two locations are required to plan a route.",
        )

    labels = _normalize_labels(waypoints, waypoint_labels)
    last_error: OpenRouteServiceError | None = None

    for attempt, radius_m in (
        (1, DEFAULT_SNAP_RADIUS_M),
        (2, EXTENDED_SNAP_RADIUS_M),
    ):
        try:
            return _request_driving_route(
                waypoints,
                profile=profile,
                radius_m=radius_m,
                timeout_seconds=timeout_seconds,
            )
        except OpenRouteServiceError as exc:
            if attempt == 1 and _is_snap_retryable(exc):
                last_error = exc
                continue

            if _is_snap_error(exc.ors_detail):
                raise _snap_failure_error(
                    exc,
                    labels=labels,
                    radius_m=radius_m,
                ) from exc

            raise

    if last_error is not None:
        raise _snap_failure_error(
            last_error,
            labels=labels,
            radius_m=EXTENDED_SNAP_RADIUS_M,
        )

    raise OpenRouteServiceError(
        "OpenRouteService routing failed.",
        http_status=502,
        user_message=(
            "The route provider could not plan this trip. "
            "Please try again later. This is not an app error."
        ),
    )


def _normalize_labels(
    waypoints: Sequence[tuple[float, float]],
    waypoint_labels: Sequence[str] | None,
) -> list[str]:
    if waypoint_labels and len(waypoint_labels) == len(waypoints):
        return list(waypoint_labels)
    return [f"stop {index + 1}" for index in range(len(waypoints))]


def _request_driving_route(
    waypoints: Sequence[tuple[float, float]],
    *,
    profile: str,
    radius_m: int,
    timeout_seconds: float,
) -> RouteResult:
    api_key = _require_api_key()
    base_url = settings.OPENROUTESERVICE_BASE_URL.rstrip("/")
    url = f"{base_url}/v2/directions/{profile}/geojson"

    coordinates = [[float(lng), float(lat)] for lat, lng in waypoints]
    radiuses = [radius_m] * len(coordinates)

    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.post(
                url,
                headers={
                    "Authorization": api_key,
                    "Content-Type": "application/json",
                    "Accept": "application/json, application/geo+json",
                },
                json={"coordinates": coordinates, "radiuses": radiuses},
            )
    except httpx.TimeoutException as exc:
        raise OpenRouteServiceError(
            f"OpenRouteService timed out: {exc}",
            http_status=504,
            user_message=(
                "The route provider took too long to respond. "
                "Please try again in a moment. This is not an app error."
            ),
        ) from exc
    except httpx.HTTPError as exc:
        raise OpenRouteServiceError(
            f"OpenRouteService request failed: {exc}",
            http_status=502,
            user_message=(
                "Could not reach the route provider. "
                "Please try again later. This is not an app error."
            ),
        ) from exc

    if response.status_code >= 400:
        detail = _extract_error_detail(response)
        raise _error_for_status(response.status_code, detail)

    return _parse_geojson_route(response.json())


def _is_snap_error(detail: str) -> bool:
    detail_lower = detail.lower()
    return "routable point" in detail_lower or (
        "could not find" in detail_lower and "coordinate" in detail_lower
    )


def _is_snap_retryable(exc: OpenRouteServiceError) -> bool:
    if exc.http_status not in {404, 422}:
        return False
    return _is_snap_error(exc.ors_detail)


def _parse_failed_waypoint_indices(detail: str) -> list[int]:
    indices: list[int] = []
    for match in _COORDINATE_INDEX_RE.finditer(detail):
        index = int(match.group(1))
        if index not in indices:
            indices.append(index)
    return indices


def _format_label_list(labels: Sequence[str]) -> str:
    if len(labels) == 1:
        return labels[0]
    if len(labels) == 2:
        return f"{labels[0]} and {labels[1]}"
    return f"{', '.join(labels[:-1])}, and {labels[-1]}"


def _snap_failure_error(
    exc: OpenRouteServiceError,
    *,
    labels: Sequence[str],
    radius_m: int,
) -> OpenRouteServiceError:
    indices = _parse_failed_waypoint_indices(exc.ors_detail)
    radius_km = radius_m / 1000

    if indices:
        failed_labels = [
            labels[index] if 0 <= index < len(labels) else f"stop {index + 1}"
            for index in indices
        ]
        stops = _format_label_list(failed_labels)
        user_message = (
            f"We could not match your {stops} to a nearby truck road within "
            f"{radius_km:g} km. The pin is likely off the road network our router "
            "uses (not a problem with your address in Google Maps). "
            "Open the location picker, drag the pin onto a main street or highway "
            "entrance, and try again."
        )
    else:
        user_message = (
            f"One or more locations could not be matched to a truck road within "
            f"{radius_km:g} km. Drag each pin onto a main road and try again."
        )

    return OpenRouteServiceError(
        str(exc),
        http_status=422,
        user_message=user_message,
        ors_detail=exc.ors_detail,
    )


def _error_for_status(status_code: int, detail: str) -> OpenRouteServiceError:
    detail_lower = detail.lower()

    if status_code == 429 or "rate" in detail_lower or "quota" in detail_lower:
        return OpenRouteServiceError(
            f"OpenRouteService rate limited ({status_code}): {detail}",
            http_status=429,
            user_message=(
                "The route provider's daily or per-minute usage limit was reached. "
                "Please wait a few minutes and try again. This is not an app error."
            ),
            ors_detail=detail,
        )

    if status_code in {401, 403}:
        return OpenRouteServiceError(
            f"OpenRouteService auth failed ({status_code}): {detail}",
            http_status=503,
            user_message=(
                "Trip planning is temporarily unavailable. "
                "Please try again later."
            ),
            ors_detail=detail,
        )

    if _is_snap_error(detail):
        return OpenRouteServiceError(
            f"OpenRouteService snap failed ({status_code}): {detail}",
            http_status=422,
            ors_detail=detail,
        )

    if status_code == 404 or "not found" in detail_lower:
        return OpenRouteServiceError(
            f"OpenRouteService no route ({status_code}): {detail}",
            http_status=422,
            user_message=(
                "No continuous truck route connects these stops. They may be too "
                "far apart, separated by water, or missing from the route map. "
                "Try different pickup or dropoff points closer to major roads."
            ),
            ors_detail=detail,
        )

    if status_code >= 500:
        return OpenRouteServiceError(
            f"OpenRouteService unavailable ({status_code}): {detail}",
            http_status=502,
            user_message=(
                "The route provider is temporarily unavailable. "
                "Please try again later. This is not an app error."
            ),
            ors_detail=detail,
        )

    return OpenRouteServiceError(
        f"OpenRouteService returned {status_code}: {detail}",
        http_status=502,
        user_message=(
            "The route provider could not plan this trip. "
            "Please try again later. This is not an app error."
        ),
        ors_detail=detail,
    )


def _extract_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text[:300] or response.reason_phrase

    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict) and error.get("message"):
            return str(error["message"])
        if isinstance(error, str):
            return error
        if payload.get("message"):
            return str(payload["message"])
    return response.text[:300] or "Unknown error"


def _parse_geojson_route(payload: dict) -> RouteResult:
    features = payload.get("features") or []
    if not features:
        raise OpenRouteServiceError(
            "OpenRouteService returned no route features.",
            http_status=422,
            user_message=(
                "No continuous truck route connects these stops. "
                "Try different pickup or dropoff points closer to major roads."
            ),
        )

    feature = features[0]
    properties = feature.get("properties") or {}
    summary = properties.get("summary") or {}
    geometry = feature.get("geometry") or {}

    distance_m = summary.get("distance")
    duration_s = summary.get("duration")
    if distance_m is None or duration_s is None:
        raise OpenRouteServiceError(
            "OpenRouteService response missing distance/duration summary.",
            http_status=502,
            user_message=(
                "The route provider returned an incomplete response. "
                "Please try again. This is not an app error."
            ),
        )

    coords = geometry.get("coordinates") or []
    polyline = [[float(lat), float(lon)] for lon, lat in coords]

    return RouteResult(
        distance_miles=Decimal(str(round(float(distance_m) / METERS_PER_MILE, 1))),
        duration_hours=Decimal(str(round(float(duration_s) / 3600.0, 2))),
        polyline=polyline,
    )
