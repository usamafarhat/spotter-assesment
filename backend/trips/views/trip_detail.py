from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Trip
from ..serializers import TripSerializer


class TripDetailView(APIView):
    """GET /api/trips/<id>/ — retrieve a single trip."""

    def get(self, request: Request, trip_id: int) -> Response:
        try:
            trip = Trip.objects.prefetch_related("duty_segments").get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=404)

        return Response(TripSerializer(trip).data)
