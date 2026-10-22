from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    In-app notification for users.
    Designed to be extensible for email/push notifications later.
    """

    TYPE_CHOICES = (
        ("booking_created", "Booking Created"),
        ("booking_accepted", "Booking Accepted"),
        ("booking_rejected", "Booking Rejected"),
        ("booking_completed", "Booking Completed"),
        ("booking_cancelled", "Booking Cancelled"),
        ("booking_started", "Service Started"),
        ("provider_approved", "Provider Approved"),
        ("provider_rejected", "Provider Rejected"),
        ("review_received", "Review Received"),
        ("general", "General"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        default="general",
    )
    title = models.CharField(
        max_length=200,
    )
    message = models.TextField()
    is_read = models.BooleanField(
        default=False,
    )
    related_booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
