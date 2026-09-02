from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import BaseModel


class Trip(BaseModel):
    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    # Input 1 — current location
    current_address = models.CharField(max_length=255)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Input 2 — pickup
    pickup_address = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Input 3 — delivery
    delivery_address = models.CharField(max_length=255)
    delivery_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    delivery_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Input 4 — cycle hours already used (70 hr / 8-day)
    current_cycle_used_hrs = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
    )

    # Plan results (nullable until planned)
    total_distance_miles = models.DecimalField(
        max_digits=8, decimal_places=1, null=True, blank=True
    )
    total_duration_hours = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    total_trip_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Calendar hours from trip start to end (includes rests and stops).",
    )
    route_to_pickup_polyline = models.JSONField(
        null=True,
        blank=True,
        help_text="Route from current location to pickup as [[lat, lng], ...].",
    )
    route_to_delivery_polyline = models.JSONField(
        null=True,
        blank=True,
        help_text="Route from pickup to delivery as [[lat, lng], ...].",
    )

    # Lifecycle
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Trip {self.pk}: {self.pickup_address} → {self.delivery_address}"


class DutySegment(BaseModel):
    """One continuous block of a single duty status on a trip timeline."""

    class DutyStatus(models.TextChoices):
        OFF_DUTY = "off_duty", "Off duty"
        SLEEPER = "sleeper", "Sleeper berth"
        DRIVING = "driving", "Driving"
        ON_DUTY = "on_duty", "On duty (not driving)"

    class StopType(models.TextChoices):
        NONE = "", "—"
        PICKUP = "pickup", "Pickup"
        DELIVERY = "delivery", "Delivery"
        FUEL = "fuel", "Fuel"
        REST = "rest", "Rest"

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="duty_segments",
    )
    sequence = models.PositiveIntegerField(
        help_text="Order of this segment in the trip timeline (0-based).",
    )
    duty_status = models.CharField(max_length=20, choices=DutyStatus.choices)
    stop_type = models.CharField(
        max_length=20,
        choices=StopType.choices,
        blank=True,
        default="",
    )
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField()
    miles_at_start = models.DecimalField(
        max_digits=8, decimal_places=1, null=True, blank=True
    )
    miles_at_end = models.DecimalField(
        max_digits=8, decimal_places=1, null=True, blank=True
    )
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    class Meta:
        ordering = ["trip_id", "sequence"]
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "sequence"],
                name="unique_trip_segment_sequence",
            ),
        ]

    def __str__(self) -> str:
        label = self.stop_type or self.duty_status
        return f"Trip {self.trip_id} #{self.sequence}: {label}"
