from django.urls import path

from .views import (
    BookingCreateView,
    CustomerBookingListView,
    BookingDetailView,
    BookingCancelView,
    ProviderBookingListView,
    BookingAcceptView,
    BookingRejectView,
    BookingStartView,
    BookingCompleteView,
    AdminBookingListView,
    AdminBookingUpdateView,
)

urlpatterns = [
    # ── Customer ──
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("my/", CustomerBookingListView.as_view(), name="booking-my"),
    path("<int:id>/", BookingDetailView.as_view(), name="booking-detail"),
    path("<int:id>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # ── Provider ──
    path("provider/", ProviderBookingListView.as_view(), name="booking-provider"),
    path("<int:id>/accept/", BookingAcceptView.as_view(), name="booking-accept"),
    path("<int:id>/reject/", BookingRejectView.as_view(), name="booking-reject"),
    path("<int:id>/start/", BookingStartView.as_view(), name="booking-start"),
    path("<int:id>/complete/", BookingCompleteView.as_view(), name="booking-complete"),

    # ── Admin ──
    path("admin/", AdminBookingListView.as_view(), name="booking-admin-list"),
    path("admin/<int:id>/", AdminBookingUpdateView.as_view(), name="booking-admin-update"),
]