from django.db import models
from django.conf import settings


class SearchHistory(models.Model):
    """
    Tracks user search queries for personalized recommendations.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="search_history",
    )
    query = models.CharField(
        max_length=255,
    )
    category = models.ForeignKey(
        "services.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.email}: '{self.query}'"
