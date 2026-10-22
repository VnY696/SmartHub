from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """
    Customer review for a completed booking.
    One review per completed booking. Rating 1-5.
    """

    booking = models.OneToOneField(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="review",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    service = models.ForeignKey(
        "services.Service",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
    )
    review = models.TextField(
        blank=True,
    )
    provider_response = models.TextField(
        blank=True,
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
            models.Index(fields=["service"]),
            models.Index(fields=["provider"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["rating"]),
        ]

    def __str__(self):
        return f"Review by {self.customer.username} — {self.rating}/5"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the service's average rating and total reviews
        self._update_service_rating()

    def delete(self, *args, **kwargs):
        service = self.service
        super().delete(*args, **kwargs)
        # Recalculate after deletion
        self._update_service_rating_for(service)

    def _update_service_rating(self):
        self._update_service_rating_for(self.service)

    @staticmethod
    def _update_service_rating_for(service):
        from django.db.models import Avg, Count

        stats = Review.objects.filter(service=service).aggregate(
            avg=Avg("rating"),
            count=Count("id"),
        )
        service.average_rating = round(stats["avg"] or 0, 2)
        service.total_reviews = stats["count"] or 0
        service.save(update_fields=["average_rating", "total_reviews"])
