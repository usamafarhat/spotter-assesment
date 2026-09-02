from rest_framework import serializers

from ..models import Trip
from .common import serialize_location
from .duty_segment import DutySegmentSerializer


class TripSerializer(serializers.ModelSerializer):
    current_location = serializers.SerializerMethodField()
    pickup_location = serializers.SerializerMethodField()
    delivery_location = serializers.SerializerMethodField()
    duty_segments = DutySegmentSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "current_location",
            "pickup_location",
            "delivery_location",
            "current_cycle_used_hrs",
            "total_distance_miles",
            "total_duration_hours",
            "total_trip_hours",
            "route_to_pickup_polyline",
            "route_to_delivery_polyline",
            "duty_segments",
            "status",
            "started_at",
            "completed_at",
            "notes",
            "created_at",
            "updated_at",
        ]

    def get_current_location(self, obj):
        return serialize_location(
            obj.current_address,
            obj.current_latitude,
            obj.current_longitude,
        )

    def get_pickup_location(self, obj):
        return serialize_location(
            obj.pickup_address,
            obj.pickup_latitude,
            obj.pickup_longitude,
        )

    def get_delivery_location(self, obj):
        return serialize_location(
            obj.delivery_address,
            obj.delivery_latitude,
            obj.delivery_longitude,
        )
