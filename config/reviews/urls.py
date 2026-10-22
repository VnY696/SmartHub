from django.urls import path

from .views import (
    ReviewCreateView,
    ServiceReviewsView,
    ProviderReviewsView,
    ReviewUpdateView,
    ReviewDeleteView,
    ProviderResponseView,
)

urlpatterns = [
    path("", ReviewCreateView.as_view(), name="review-create"),
    path("service/<int:id>/", ServiceReviewsView.as_view(), name="service-reviews"),
    path("provider/<int:id>/", ProviderReviewsView.as_view(), name="provider-reviews"),
    path("<int:id>/", ReviewUpdateView.as_view(), name="review-update"),
    path("<int:id>/delete/", ReviewDeleteView.as_view(), name="review-delete"),
    path("<int:id>/response/", ProviderResponseView.as_view(), name="review-response"),
]