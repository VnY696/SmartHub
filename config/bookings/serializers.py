from datetime import date

from rest_framework import serializers
from .models import Booking
from services.models import Service


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Customer creates a booking.
    Auto-sets customer, provider, and price from the service.
    """

    class Meta:
        model = Booking
        fields = [
            "service",
            "booking_date",
            "preferred_time",
            "address",
            "customer_notes",
        ]

    def validate_service(self, service):
        if not service.is_available:
            raise serializers.ValidationError("This service is not currently available.")
        if service.status != "active":
            raise serializers.ValidationError("This service is not active.")
        # Ensure the provider is approved
        provider = service.provider
        if hasattr(provider, "provider_profile"):
            if provider.provider_profile.verification_status != "approved":
                raise serializers.ValidationError("This provider is not yet approved.")
        return service

    def validate_booking_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value

    def validate(self, data):
        user = self.context["request"].user
        service = data["service"]

        # Customers cannot book their own services
        if service.provider == user:
            raise serializers.ValidationError(
                {"service": "You cannot book your own service."}
            )

        # Check for duplicate pending/active bookings
        existing = Booking.objects.filter(
            customer=user,
            service=service,
            booking_date=data["booking_date"],
            status__in=("pending", "accepted", "confirmed", "in_progress"),
        ).exists()

        if existing:
            raise serializers.ValidationError(
                {"booking_date": "You already have an active booking for this service on this date."}
            )

        return data

    def create(self, validated_data):
        service = validated_data["service"]
        validated_data["customer"] = self.context["request"].user
        validated_data["provider"] = service.provider
        validated_data["price"] = service.price
        return Booking.objects.create(**validated_data)


class BookingSerializer(serializers.ModelSerializer):
    """Full booking detail serializer."""

    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True,
    )
    customer_email = serializers.CharField(
        source="customer.email",
        read_only=True,
    )
    provider_name = serializers.CharField(
        source="provider.username",
        read_only=True,
    )
    service_title = serializers.CharField(
        source="service.title",
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "customer_name",
            "customer_email",
            "provider",
            "provider_name",
            "service",
            "service_title",
            "booking_date",
            "preferred_time",
            "address",
            "customer_notes",
            "provider_notes",
            "price",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "provider",
            "price",
            "status",
            "created_at",
            "updated_at",
        ]


class BookingStatusSerializer(serializers.Serializer):
    """Used by provider to add notes when changing status."""
    provider_notes = serializers.CharField(
        required=False,
        allow_blank=True,
    )
