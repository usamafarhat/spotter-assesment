from rest_framework import serializers

from ..models import DutySegment


class DutySegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutySegment
        fields = [
            "id",
            "sequence",
            "duty_status",
            "stop_type",
            "started_at",
            "ended_at",
            "miles_at_start",
            "miles_at_end",
            "latitude",
            "longitude",
        ]
