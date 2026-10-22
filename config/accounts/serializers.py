import re
import logging

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, ProviderProfile

logger = logging.getLogger(__name__)


# ─────────────────────── Authentication ─────────────────────────


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration with validation.
    Auto-creates ProviderProfile for provider role.
    Prevents self-registration as admin.
    """

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )
    confirm_password = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "phone",
            "city",
            "address",
            "profile_image",
            "role",
        ]

    def validate_role(self, value):
        if value == "admin":
            raise serializers.ValidationError(
                "You cannot register as an admin."
            )
        return value

    def validate_phone(self, value):
        if value and not re.match(r"^\+?[\d\s\-]{7,15}$", value):
            raise serializers.ValidationError(
                "Enter a valid phone number (7-15 digits, optional + prefix)."
            )
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()  # Signal creates ProviderProfile if user.role == 'provider'
        return user


class LoginSerializer(TokenObtainPairSerializer):
    """
    JWT login serializer — uses email as the username field.
    Includes user role and id in the token claims.
    """
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims
        token["role"] = user.role
        token["username"] = user.username
        token["email"] = user.email
        return token


# ──────────────────────── Profile ───────────────────────────────


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing/updating user profiles.
    Password and role are read-only on update.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "city",
            "address",
            "profile_image",
            "role",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "email",
            "role",
            "date_joined",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Validates old password and sets a new one."""

    old_password = serializers.CharField()
    new_password = serializers.CharField(
        validators=[validate_password],
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


# ──────────────────── Provider Profile ──────────────────────────


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ProviderProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for provider profile — used for both display and update.
    Includes nested user info (read-only).
    """
    user = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    completed_bookings = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "user",
            "business_name",
            "description",
            "phone",
            "email",
            "city",
            "address",
            "experience_years",
            "skills",
            "profile_image",
            "verification_status",
            "is_available",
            "average_rating",
            "total_reviews",
            "completed_bookings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "verification_status",
            "created_at",
            "updated_at",
        ]

    from drf_spectacular.utils import extend_schema_field

    @extend_schema_field(serializers.FloatField)
    def get_average_rating(self, obj):
        from reviews.models import Review
        from django.db.models import Avg
        result = Review.objects.filter(
            provider=obj.user
        ).aggregate(avg=Avg("rating"))
        return round(result["avg"] or 0, 2)

    @extend_schema_field(serializers.IntegerField)
    def get_total_reviews(self, obj):
        from reviews.models import Review
        return Review.objects.filter(provider=obj.user).count()

    @extend_schema_field(serializers.IntegerField)
    def get_completed_bookings(self, obj):
        from bookings.models import Booking
        return Booking.objects.filter(
            provider=obj.user,
            status="completed",
        ).count()


class ProviderProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for providers to update their own profile."""

    class Meta:
        model = ProviderProfile
        fields = [
            "business_name",
            "description",
            "phone",
            "email",
            "city",
            "address",
            "experience_years",
            "skills",
            "profile_image",
            "is_available",
        ]


# ──────────────────── Admin Serializers ─────────────────────────


class UserAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for managing users — all fields accessible."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "city",
            "address",
            "profile_image",
            "role",
            "is_active",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "email",
            "date_joined",
        ]


class ProviderVerificationSerializer(serializers.ModelSerializer):
    """Admin serializer to approve/reject providers."""

    class Meta:
        model = ProviderProfile
        fields = ["verification_status"]

    def validate_verification_status(self, value):
        if value not in ("approved", "rejected"):
            raise serializers.ValidationError(
                "Status must be 'approved' or 'rejected'."
            )
        return value