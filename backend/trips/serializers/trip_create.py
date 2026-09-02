from rest_framework import serializers

from ..models import Trip
from .common import LocationSerializer


class TripCreateSerializer(serializers.Serializer):
    current_location = LocationSerializer()
    pickup_location = LocationSerializer()
    delivery_location = LocationSerializer()
    current_cycle_used_hrs = serializers.DecimalField(
        max_digits=4,
        decimal_places=1,
        min_value=0,
        max_value=70,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def create(self, validated_data):
        current = validated_data["current_location"]
        pickup = validated_data["pickup_location"]
        delivery = validated_data["delivery_location"]

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
        )
