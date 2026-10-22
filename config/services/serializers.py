from rest_framework import serializers
from .models import Category, Service


# ═══════════════════════ Category ═══════════════════════════════


class CategorySerializer(serializers.ModelSerializer):
    """Full category serializer — slug is auto-generated."""

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]


# ═══════════════════════ Service ════════════════════════════════


class ServiceSerializer(serializers.ModelSerializer):
    """Read-only service serializer with nested relations."""

    provider_name = serializers.CharField(
        source="provider.username",
        read_only=True,
    )
    provider_email = serializers.CharField(
        source="provider.email",
        read_only=True,
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )
    category_slug = serializers.CharField(
        source="category.slug",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "provider",
            "provider_name",
            "provider_email",
            "category",
            "category_name",
            "category_slug",
            "title",
            "slug",
            "description",
            "price",
            "pricing_type",
            "duration",
            "location",
            "city",
            "address",
            "experience",
            "image",
            "availability",
            "status",
            "is_available",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]


class ServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for providers to create new services."""

    class Meta:
        model = Service
        exclude = [
            "provider",
            "slug",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )
        return value

    def validate_experience(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Experience cannot be negative."
            )
        return value

    def validate_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Image size should be less than 5 MB."
            )
        return image

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters."
            )
        return value

    def validate_description(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                "Description should contain at least 20 characters."
            )
        return value

    def create(self, validated_data):
        validated_data["provider"] = self.context["request"].user
        return Service.objects.create(**validated_data)


class ServiceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for providers to update their services."""

    class Meta:
        model = Service
        exclude = [
            "provider",
            "slug",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]


class ServiceCompareSerializer(serializers.ModelSerializer):
    """
    Compact serializer for side-by-side service comparison.
    Includes provider info and key metrics.
    """

    provider_name = serializers.CharField(
        source="provider.username",
        read_only=True,
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "title",
            "provider",
            "provider_name",
            "category_name",
            "price",
            "pricing_type",
            "city",
            "experience",
            "average_rating",
            "total_reviews",
            "is_available",
            "availability",
            "duration",
        ]