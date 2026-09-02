from rest_framework import serializers

from .common import LocationSerializer


class TripCreateSerializer(serializers.Serializer):
    """Validates create-trip input. Persistence lives in trip_planner."""

    current_location = LocationSerializer()
    pickup_location = LocationSerializer()
    delivery_location = LocationSerializer()
    pickup_same_as_current = serializers.BooleanField(required=False, default=False)
    current_cycle_used_hrs = serializers.DecimalField(
        max_digits=4,
        decimal_places=1,
        min_value=0,
        max_value=70,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
