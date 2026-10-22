from rest_framework import serializers
from .models import Review
from bookings.models import Booking


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Customer creates a review for a completed booking.
    Validates: booking exists, is completed, belongs to customer, no duplicate.
    """

    class Meta:
        model = Review
        fields = [
            "booking",
            "rating",
            "review",
        ]

    def validate_booking(self, booking):
        user = self.context["request"].user

        if booking.customer != user:
            raise serializers.ValidationError(
                "You can only review your own bookings."
            )

        if booking.status != "completed":
            raise serializers.ValidationError(
                "You can only review completed bookings."
            )

        if hasattr(booking, "review"):
            raise serializers.ValidationError(
                "You have already reviewed this booking."
            )

        return booking

    def create(self, validated_data):
        booking = validated_data["booking"]
        validated_data["customer"] = booking.customer
        validated_data["provider"] = booking.provider
        validated_data["service"] = booking.service
        return Review.objects.create(**validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    """Full review display serializer."""

    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True,
    )
    service_title = serializers.CharField(
        source="service.title",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "booking",
            "customer",
            "customer_name",
            "provider",
            "service",
            "service_title",
            "rating",
            "review",
            "provider_response",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking",
            "customer",
            "provider",
            "service",
            "created_at",
            "updated_at",
        ]


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Customer can update their review text and rating."""

    class Meta:
        model = Review
        fields = ["rating", "review"]


class ProviderResponseSerializer(serializers.Serializer):
    """Provider responds to a review."""
    provider_response = serializers.CharField()
