from django.urls import path

from .views import TripsCollectionView

urlpatterns = [
    path("trips/", TripsCollectionView.as_view(), name="trips-collection"),
]
