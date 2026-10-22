from django.db import models
from django.conf import settings
from django.utils.text import slugify
import itertools


class Category(models.Model):
    """Service category (e.g. Plumbing, Electrical, Cleaning)."""

    name = models.CharField(
        max_length=100,
        unique=True,
    )
    slug = models.SlugField(
        unique=True,
        blank=True,
    )
    description = models.TextField(
        blank=True,
    )
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(
        default=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate a unique slug from name if not provided."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            for i in itertools.count(1):
                if not Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                    break
                slug = f"{base_slug}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)


class Service(models.Model):
    """A service listing created by a provider."""

    PRICING_TYPE_CHOICES = (
        ("fixed", "Fixed"),
        ("hourly", "Hourly"),
        ("negotiable", "Negotiable"),
    )

    STATUS_CHOICES = (
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("pending", "Pending"),
        ("rejected", "Rejected"),
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="services",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="services",
    )
    title = models.CharField(
        max_length=200,
    )
    slug = models.SlugField(
        unique=True,
        blank=True,
    )
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    pricing_type = models.CharField(
        max_length=20,
        choices=PRICING_TYPE_CHOICES,
        default="fixed",
    )
    duration = models.CharField(
        max_length=50,
        blank=True,
        help_text="E.g. '1 hour', '2-3 hours', 'Half day'",
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Specific service location or area",
    )
    city = models.CharField(
        max_length=100,
    )
    address = models.TextField(
        blank=True,
    )
    experience = models.PositiveIntegerField(
        help_text="Experience in years",
        default=0,
    )
    image = models.ImageField(
        upload_to="services/",
        blank=True,
        null=True,
    )
    availability = models.CharField(
        max_length=200,
        blank=True,
        help_text="E.g. 'Mon-Fri 9AM-6PM', 'Weekends only'",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )
    is_available = models.BooleanField(
        default=True,
    )
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    total_reviews = models.PositiveIntegerField(
        default=0,
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
            models.Index(fields=["category"]),
            models.Index(fields=["city"]),
            models.Index(fields=["price"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_available"]),
            models.Index(fields=["-average_rating"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Auto-generate a unique slug from title if not provided."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            for i in itertools.count(1):
                if not Service.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                    break
                slug = f"{base_slug}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)