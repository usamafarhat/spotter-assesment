from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=255)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)


def serialize_location(address, latitude, longitude):
    return {
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
    }
