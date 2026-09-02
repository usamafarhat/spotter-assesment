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
    route_polyline = models.JSONField(
        null=True,
        blank=True,
        help_text="Route path as [[lat, lng], ...]",
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
