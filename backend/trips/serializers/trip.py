from rest_framework import serializers

from ..models import Trip
from .common import serialize_location


class TripSerializer(serializers.ModelSerializer):
    current_location = serializers.SerializerMethodField()
    pickup_location = serializers.SerializerMethodField()
    delivery_location = serializers.SerializerMethodField()

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
            "route_polyline",
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
