from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Booking(models.Model):
    """
    Represents a service booking between a customer and provider.
    Follows a lifecycle: pending → accepted → confirmed → in_progress → completed.
    """

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("confirmed", "Confirmed"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_bookings",
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_bookings",
    )
    service = models.ForeignKey(
        "services.Service",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    booking_date = models.DateField()
    preferred_time = models.TimeField(
        blank=True,
        null=True,
    )
    address = models.TextField(
        help_text="Service delivery address",
    )
    customer_notes = models.TextField(
        blank=True,
    )
    provider_notes = models.TextField(
        blank=True,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
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
            models.Index(fields=["customer"]),
            models.Index(fields=["provider"]),
            models.Index(fields=["service"]),
            models.Index(fields=["status"]),
            models.Index(fields=["booking_date"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"Booking #{self.id} — {self.service.title} ({self.status})"

    # ── Status transition helpers ──

    ALLOWED_TRANSITIONS = {
        "pending": ("accepted", "rejected", "cancelled"),
        "accepted": ("confirmed", "cancelled"),
        "confirmed": ("in_progress", "cancelled"),
        "in_progress": ("completed",),
        # completed and cancelled are terminal states
    }

    def can_transition_to(self, new_status):
        allowed = self.ALLOWED_TRANSITIONS.get(self.status, ())
        return new_status in allowed
