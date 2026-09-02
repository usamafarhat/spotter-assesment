from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Trip
from ..serializers import TripCreateSerializer, TripSerializer
from ..services import OpenRouteServiceError, create_planned_trip


class TripsCollectionView(APIView):
    """GET /api/trips/ — list trips. POST /api/trips/ — create trip."""

    def get(self, request: Request) -> Response:
        trips = Trip.objects.all()
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        serializer = TripCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            trip = create_planned_trip(serializer.validated_data)
        except OpenRouteServiceError as exc:
            return Response(
                {"detail": exc.user_message},
                status=exc.http_status,
            )

        return Response(
            TripSerializer(trip).data,
            status=status.HTTP_201_CREATED,
        )
