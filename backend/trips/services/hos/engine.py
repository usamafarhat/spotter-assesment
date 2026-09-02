"""
HOS trip scheduler.

Uses exact per-leg miles/hours from two OpenRouteService requests:
  leg 1: current → pickup
  leg 2: pickup → delivery
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal

from ..polyline_utils import merge_polylines, point_at_trip_miles
from .rules import (
    BREAK_AFTER_DRIVE_HOURS,
    BREAK_DURATION_HOURS,
    CYCLE_MAX_HOURS,
    CYCLE_RECOVERY_REST_HOURS,
    DROPOFF_ON_DUTY_HOURS,
    FUEL_INTERVAL_MILES,
    FUEL_STOP_HOURS,
    HOUR_EPSILON,
    MAX_DRIVE_HOURS_PER_DAY,
    MIN_OFF_DUTY_RESET_HOURS,
    PICKUP_ON_DUTY_HOURS,
)


@dataclass(frozen=True)
class PlannedSegment:
    duty_status: str
    started_at: datetime
    ended_at: datetime
    stop_type: str = ""
    miles_at_start: float | None = None
    miles_at_end: float | None = None
    latitude: float | None = None
    longitude: float | None = None


@dataclass(frozen=True)
class HosPlan:
    segments: tuple[PlannedSegment, ...]
    total_trip_hours: Decimal
    trip_start: datetime
    trip_end: datetime


@dataclass
class DriverSession:
    """Tracks HOS clocks while building the duty timeline."""

    clock: datetime
    cycle_hours_used: float
    driving_since_reset: float = 0.0
    driving_since_break: float = 0.0
    odometer_miles: float = 0.0
    next_fuel_at_miles: float = FUEL_INTERVAL_MILES
    combined_polyline: list[list[float]] = field(default_factory=list)
    segments: list[PlannedSegment] = field(default_factory=list)

    def _append(
        self,
        duty_status: str,
        hours: float,
        *,
        stop_type: str = "",
        miles_at_start: float | None = None,
        miles_at_end: float | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
    ) -> None:
        if hours <= HOUR_EPSILON:
            return

        started_at = self.clock
        ended_at = started_at + timedelta(hours=hours)
        self.segments.append(
            PlannedSegment(
                duty_status=duty_status,
                started_at=started_at,
                ended_at=ended_at,
                stop_type=stop_type,
                miles_at_start=miles_at_start,
                miles_at_end=miles_at_end,
                latitude=latitude,
                longitude=longitude,
            )
        )
        self.clock = ended_at

        if duty_status in {"driving", "on_duty"}:
            self.cycle_hours_used += hours

    def take_break(self) -> None:
        self._append("off_duty", BREAK_DURATION_HOURS, stop_type="rest")
        self.driving_since_break = 0.0

    def take_daily_reset(self) -> None:
        self._append("sleeper", MIN_OFF_DUTY_RESET_HOURS, stop_type="rest")
        self.driving_since_reset = 0.0
        self.driving_since_break = 0.0

    def take_cycle_recovery(self) -> None:
        self._append("sleeper", CYCLE_RECOVERY_REST_HOURS, stop_type="rest")
        self.driving_since_reset = 0.0
        self.driving_since_break = 0.0
        self.cycle_hours_used = 0.0

    def take_fuel_stop(self, latitude: float | None, longitude: float | None) -> None:
        self._append(
            "on_duty",
            FUEL_STOP_HOURS,
            stop_type="fuel",
            latitude=latitude,
            longitude=longitude,
        )
        self.next_fuel_at_miles += FUEL_INTERVAL_MILES

    def take_on_duty_stop(self, hours: float, stop_type: str) -> None:
        self._append("on_duty", hours, stop_type=stop_type)

    def _miles_until_next_fuel(self) -> float | None:
        if self.odometer_miles >= self.next_fuel_at_miles:
            return 0.0
        return self.next_fuel_at_miles - self.odometer_miles

    def _max_drive_hours_before_limits(self) -> float:
        return max(
            0.0,
            min(
                MAX_DRIVE_HOURS_PER_DAY - self.driving_since_reset,
                BREAK_AFTER_DRIVE_HOURS - self.driving_since_break,
                CYCLE_MAX_HOURS - self.cycle_hours_used,
            ),
        )

    def drive_hours(self, hours: float, miles: float) -> None:
        remaining_hours = hours
        remaining_miles = miles

        while remaining_hours > HOUR_EPSILON:
            if self.cycle_hours_used >= CYCLE_MAX_HOURS - HOUR_EPSILON:
                self.take_cycle_recovery()
                continue

            if self.driving_since_reset >= MAX_DRIVE_HOURS_PER_DAY - HOUR_EPSILON:
                self.take_daily_reset()
                continue

            if self.driving_since_break >= BREAK_AFTER_DRIVE_HOURS - HOUR_EPSILON:
                self.take_break()
                continue

            max_chunk_hours = min(
                remaining_hours,
                self._max_drive_hours_before_limits(),
            )

            if max_chunk_hours <= HOUR_EPSILON:
                if self.cycle_hours_used >= CYCLE_MAX_HOURS - HOUR_EPSILON:
                    self.take_cycle_recovery()
                elif self.driving_since_reset >= MAX_DRIVE_HOURS_PER_DAY - HOUR_EPSILON:
                    self.take_daily_reset()
                else:
                    self.take_break()
                continue

            chunk_miles = remaining_miles * (max_chunk_hours / remaining_hours)
            miles_until_fuel = self._miles_until_next_fuel()

            if (
                miles_until_fuel is not None
                and chunk_miles > miles_until_fuel + HOUR_EPSILON
                and remaining_miles > HOUR_EPSILON
            ):
                fuel_hours = remaining_hours * (miles_until_fuel / remaining_miles)
                self._drive_chunk(fuel_hours, miles_until_fuel)
                remaining_hours -= fuel_hours
                remaining_miles -= miles_until_fuel

                fuel_point = point_at_trip_miles(
                    self.combined_polyline,
                    self.odometer_miles,
                )
                lat, lng = fuel_point if fuel_point else (None, None)
                self.take_fuel_stop(lat, lng)
                continue

            self._drive_chunk(max_chunk_hours, chunk_miles)
            remaining_hours -= max_chunk_hours
            remaining_miles -= chunk_miles

    def _drive_chunk(self, hours: float, miles: float) -> None:
        miles_start = self.odometer_miles
        miles_end = self.odometer_miles + miles

        self._append(
            "driving",
            hours,
            miles_at_start=miles_start,
            miles_at_end=miles_end,
        )

        self.driving_since_reset += hours
        self.driving_since_break += hours
        self.odometer_miles = miles_end


def build_hos_plan(
    *,
    leg_to_pickup_miles: float,
    leg_to_pickup_hours: float,
    leg_to_delivery_miles: float,
    leg_to_delivery_hours: float,
    route_to_pickup_polyline: Sequence[Sequence[float]],
    route_to_delivery_polyline: Sequence[Sequence[float]],
    current_cycle_used_hrs: float,
    trip_start: datetime,
) -> HosPlan:
    """
    Build duty timeline:
      1. Drive current → pickup (may be 0 if same location)
      2. 1h on duty at pickup
      3. Drive pickup → delivery
      4. 1h on duty at delivery
    """
    combined_polyline = merge_polylines(
        route_to_pickup_polyline,
        route_to_delivery_polyline,
    )

    session = DriverSession(
        clock=trip_start,
        cycle_hours_used=float(current_cycle_used_hrs),
        combined_polyline=combined_polyline,
    )

    session.drive_hours(leg_to_pickup_hours, leg_to_pickup_miles)
    session.take_on_duty_stop(PICKUP_ON_DUTY_HOURS, stop_type="pickup")
    session.drive_hours(leg_to_delivery_hours, leg_to_delivery_miles)
    session.take_on_duty_stop(DROPOFF_ON_DUTY_HOURS, stop_type="delivery")

    segments = tuple(session.segments)
    trip_end = segments[-1].ended_at if segments else trip_start
    total_trip_hours = Decimal(
        str(round((trip_end - trip_start).total_seconds() / 3600, 2))
    )

    return HosPlan(
        segments=segments,
        total_trip_hours=total_trip_hours,
        trip_start=trip_start,
        trip_end=trip_end,
    )
