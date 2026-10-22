"""
Admin dashboard API views.
Provides platform-wide statistics and management endpoints.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q

from common.permissions import IsAdmin
from accounts.models import User, ProviderProfile
from services.models import Service, Category
from bookings.models import Booking
from reviews.models import Review


class AdminDashboardView(APIView):
    """
    GET /api/admin/dashboard/

    Returns platform-wide statistics:
    - User counts (total, by role)
    - Provider stats (pending, approved)
    - Service stats (total, by status)
    - Booking stats (total, by status)
    - Review stats (total, average rating)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    from drf_spectacular.utils import extend_schema, inline_serializer
    from rest_framework import serializers

    @extend_schema(
        responses={
            200: inline_serializer(
                name="AdminDashboardResponse",
                fields={
                    "success": serializers.BooleanField(),
                    "data": serializers.DictField(),
                },
            )
        }
    )
    def get(self, request):
        # User stats
        user_stats = User.objects.aggregate(
            total=Count("id"),
            customers=Count("id", filter=Q(role="customer")),
            providers=Count("id", filter=Q(role="provider")),
            admins=Count("id", filter=Q(role="admin")),
        )

        # Provider stats
        provider_stats = ProviderProfile.objects.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(verification_status="pending")),
            approved=Count("id", filter=Q(verification_status="approved")),
            rejected=Count("id", filter=Q(verification_status="rejected")),
        )

        # Service stats
        service_stats = Service.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(status="active")),
            pending=Count("id", filter=Q(status="pending")),
            inactive=Count("id", filter=Q(status="inactive")),
            rejected=Count("id", filter=Q(status="rejected")),
        )

        # Booking stats
        booking_stats = Booking.objects.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status="pending")),
            accepted=Count("id", filter=Q(status="accepted")),
            in_progress=Count("id", filter=Q(status="in_progress")),
            completed=Count("id", filter=Q(status="completed")),
            cancelled=Count("id", filter=Q(status="cancelled")),
            rejected=Count("id", filter=Q(status="rejected")),
        )

        # Review stats
        review_stats = Review.objects.aggregate(
            total=Count("id"),
            average_rating=Avg("rating"),
        )
        review_stats["average_rating"] = round(
            review_stats["average_rating"] or 0, 2
        )

        # Category count
        category_count = Category.objects.count()

        return Response(
            {
                "success": True,
                "data": {
                    "users": user_stats,
                    "providers": provider_stats,
                    "services": service_stats,
                    "bookings": booking_stats,
                    "reviews": review_stats,
                    "categories": {"total": category_count},
                },
            },
        )
