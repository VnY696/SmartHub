import logging

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models, transaction

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingStatusSerializer,
)
from .permissions import IsBookingCustomer, IsBookingProvider
from common.permissions import IsAdmin, IsCustomer, IsProvider

logger = logging.getLogger(__name__)


# ═══════════════════ Customer Booking Views ═════════════════════


class BookingCreateView(generics.CreateAPIView):
    """POST /api/bookings/ — customer creates a booking."""
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        logger.info(
            "Booking #%d created by %s for service '%s'",
            booking.id,
            request.user.email,
            booking.service.title,
        )

        # Create notification for provider
        try:
            from notifications.services import create_notification
            create_notification(
                user=booking.provider,
                notification_type="booking_created",
                title="New Booking Request",
                message=f"{booking.customer.username} booked your service '{booking.service.title}' for {booking.booking_date}.",
                related_booking=booking,
            )
        except Exception:
            logger.warning("Could not create notification for booking #%d", booking.id)

        return Response(
            {
                "success": True,
                "message": "Booking created successfully.",
                "data": BookingSerializer(booking).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CustomerBookingListView(generics.ListAPIView):
    """GET /api/bookings/my/ — customer's own bookings."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        return (
            Booking.objects
            .select_related("customer", "provider", "service")
            .filter(customer=self.request.user)
        )


class BookingDetailView(generics.RetrieveAPIView):
    """GET /api/bookings/{id}/ — booking detail (customer or provider)."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        user = self.request.user
        if getattr(user, "role", None) == "admin":
            return Booking.objects.select_related("customer", "provider", "service").all()
        return (
            Booking.objects
            .select_related("customer", "provider", "service")
            .filter(
                models.Q(customer=user) | models.Q(provider=user)
            )
        )


class BookingCancelView(generics.GenericAPIView):
    """PATCH /api/bookings/{id}/cancel/ — customer cancels booking."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsBookingCustomer]
    lookup_field = "id"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        return Booking.objects.filter(customer=self.request.user)

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()

        if not booking.can_transition_to("cancelled"):
            return Response(
                {
                    "success": False,
                    "message": f"Cannot cancel a booking with status '{booking.status}'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = "cancelled"
        booking.save(update_fields=["status", "updated_at"])
        logger.info("Booking #%d cancelled by customer %s", booking.id, request.user.email)

        # Notify provider
        try:
            from notifications.services import create_notification
            create_notification(
                user=booking.provider,
                notification_type="booking_cancelled",
                title="Booking Cancelled",
                message=f"{booking.customer.username} cancelled the booking for '{booking.service.title}'.",
                related_booking=booking,
            )
        except Exception:
            pass

        return Response(
            {
                "success": True,
                "message": "Booking cancelled.",
                "data": BookingSerializer(booking).data,
            },
        )


# ═══════════════════ Provider Booking Views ═════════════════════


class ProviderBookingListView(generics.ListAPIView):
    """GET /api/bookings/provider/ — provider's bookings."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        return (
            Booking.objects
            .select_related("customer", "provider", "service")
            .filter(provider=self.request.user)
        )


class _ProviderStatusChangeView(generics.GenericAPIView):
    """Base class for provider status transitions."""
    permission_classes = [IsAuthenticated, IsProvider, IsBookingProvider]
    serializer_class = BookingStatusSerializer
    lookup_field = "id"
    target_status = None
    notification_type = None
    notification_title = None

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        return Booking.objects.filter(provider=self.request.user)

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        booking = self.get_object()

        if not booking.can_transition_to(self.target_status):
            return Response(
                {
                    "success": False,
                    "message": f"Cannot change status from '{booking.status}' to '{self.target_status}'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notes = serializer.validated_data.get("provider_notes", "")
        if notes:
            booking.provider_notes = notes

        booking.status = self.target_status
        booking.save(update_fields=["status", "provider_notes", "updated_at"])
        logger.info(
            "Booking #%d status changed to '%s' by provider %s",
            booking.id,
            self.target_status,
            request.user.email,
        )

        # Notify customer
        if self.notification_type:
            try:
                from notifications.services import create_notification
                create_notification(
                    user=booking.customer,
                    notification_type=self.notification_type,
                    title=self.notification_title or f"Booking {self.target_status.title()}",
                    message=f"Your booking for '{booking.service.title}' has been {self.target_status}.",
                    related_booking=booking,
                )
            except Exception:
                pass

        return Response(
            {
                "success": True,
                "message": f"Booking {self.target_status}.",
                "data": BookingSerializer(booking).data,
            },
        )


class BookingAcceptView(_ProviderStatusChangeView):
    """PATCH /api/bookings/{id}/accept/"""
    target_status = "accepted"
    notification_type = "booking_accepted"
    notification_title = "Booking Accepted"


class BookingRejectView(_ProviderStatusChangeView):
    """PATCH /api/bookings/{id}/reject/"""
    target_status = "rejected"
    notification_type = "booking_rejected"
    notification_title = "Booking Rejected"


class BookingStartView(_ProviderStatusChangeView):
    """PATCH /api/bookings/{id}/start/"""
    target_status = "in_progress"
    notification_type = "booking_started"
    notification_title = "Service Started"


class BookingCompleteView(_ProviderStatusChangeView):
    """PATCH /api/bookings/{id}/complete/"""
    target_status = "completed"
    notification_type = "booking_completed"
    notification_title = "Service Completed"


# ═══════════════════ Admin Booking Views ════════════════════════


class AdminBookingListView(generics.ListAPIView):
    """GET /api/bookings/admin/ — admin sees all bookings."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = (
            Booking.objects
            .select_related("customer", "provider", "service")
            .all()
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class AdminBookingUpdateView(generics.UpdateAPIView):
    """PATCH /api/bookings/admin/{id}/ — admin can update any booking."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Booking.objects.all()
    lookup_field = "id"


# ── Fix: import models for Q lookups ──

