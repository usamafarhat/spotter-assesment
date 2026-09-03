from django.urls import path

from .views import TripDetailView, TripsCollectionView

urlpatterns = [
    path("trips/", TripsCollectionView.as_view(), name="trips-collection"),
    path("trips/<int:trip_id>/", TripDetailView.as_view(), name="trip-detail"),
]
