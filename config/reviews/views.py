import logging

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Review
from .serializers import (
    ReviewCreateSerializer,
    ReviewSerializer,
    ReviewUpdateSerializer,
    ProviderResponseSerializer,
)
from common.permissions import IsAdmin, IsCustomer, IsProvider

logger = logging.getLogger(__name__)


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/reviews/ — customer creates a review."""
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        logger.info(
            "Review created by %s for service '%s' (rating=%d)",
            request.user.email,
            review.service.title,
            review.rating,
        )

        # Notify provider
        try:
            from notifications.services import create_notification
            create_notification(
                user=review.provider,
                notification_type="review_received",
                title="New Review Received",
                message=f"{review.customer.username} gave your service '{review.service.title}' a {review.rating}/5 rating.",
                related_booking=review.booking,
            )
        except Exception:
            pass

        return Response(
            {
                "success": True,
                "message": "Review submitted successfully.",
                "data": ReviewSerializer(review).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ServiceReviewsView(generics.ListAPIView):
    """GET /api/reviews/service/{id}/ — all reviews for a service."""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or "id" not in self.kwargs:
            return Review.objects.none()
        return (
            Review.objects
            .select_related("customer", "service")
            .filter(service_id=self.kwargs["id"])
        )


class ProviderReviewsView(generics.ListAPIView):
    """GET /api/reviews/provider/{id}/ — all reviews for a provider."""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or "id" not in self.kwargs:
            return Review.objects.none()
        return (
            Review.objects
            .select_related("customer", "service")
            .filter(provider_id=self.kwargs["id"])
        )


class ReviewUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/reviews/{id}/ — customer updates their review."""
    serializer_class = ReviewUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Review.objects.none()
        return Review.objects.filter(customer=self.request.user)


class ReviewDeleteView(generics.DestroyAPIView):
    """DELETE /api/reviews/{id}/ — customer or admin deletes a review."""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Review.objects.none()
        user = self.request.user
        if getattr(user, "role", None) == "admin":
            return Review.objects.all()
        return Review.objects.filter(customer=user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Review deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ProviderResponseView(generics.GenericAPIView):
    """POST /api/reviews/{id}/response/ — provider responds to a review."""
    serializer_class = ProviderResponseSerializer
    permission_classes = [IsAuthenticated, IsProvider]
    lookup_field = "id"

    def get_queryset(self):
        return Review.objects.filter(provider=self.request.user)

    def post(self, request, *args, **kwargs):
        review = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review.provider_response = serializer.validated_data["provider_response"]
        review.save(update_fields=["provider_response", "updated_at"])

        logger.info(
            "Provider %s responded to review #%d",
            request.user.email,
            review.id,
        )

        return Response(
            {
                "success": True,
                "message": "Response added.",
                "data": ReviewSerializer(review).data,
            },
        )
