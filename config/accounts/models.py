from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager


class User(AbstractUser):
    """
    Custom User model for SmartHub.
    Uses email as the primary login field.
    Supports three roles: customer, provider, admin.
    """

    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("provider", "Provider"),
        ("admin", "Admin"),
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer",
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username",
    ]

    objects = UserManager()

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["city"]),
        ]

    def __str__(self):
        return self.email


class ProviderProfile(models.Model):
    """
    Extended profile for service providers.
    Created automatically when a user registers with role='provider'.
    """

    VERIFICATION_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="provider_profile",
    )

    business_name = models.CharField(
        max_length=200,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    experience_years = models.PositiveIntegerField(
        default=0,
    )

    skills = models.TextField(
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="providers/",
        blank=True,
        null=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default="pending",
    )

    is_available = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["verification_status"]),
            models.Index(fields=["city"]),
            models.Index(fields=["is_available"]),
        ]

    def __str__(self):
        return f"{self.business_name or self.user.email}"