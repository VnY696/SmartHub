from datetime import date
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from services.models import Category, Service
from bookings.models import Booking
from reviews.models import Review


class ReviewsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer1",
            password="Password123!",
            role="customer",
        )
        self.provider_user = User.objects.create_user(
            email="provider@example.com",
            username="provider1",
            password="Password123!",
            role="provider",
        )
        self.category = Category.objects.create(name="Tutoring")
        self.service = Service.objects.create(
            provider=self.provider_user,
            category=self.category,
            title="Math Tutoring",
            description="High school math tutoring service.",
            price=50.00,
            city="Boston",
            is_available=True,
            status="active",
        )
        self.booking = Booking.objects.create(
            customer=self.customer,
            provider=self.provider_user,
            service=self.service,
            booking_date=date.today(),
            address="456 Oak St",
            price=50.00,
            status="completed",
        )

    def test_create_review(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("review-create")
        data = {
            "booking": self.booking.id,
            "rating": 5,
            "review": "Great math tutor!",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.service.refresh_from_db()
        self.assertEqual(float(self.service.average_rating), 5.0)
        self.assertEqual(self.service.total_reviews, 1)

    def test_duplicate_review_prevented(self):
        Review.objects.create(
            booking=self.booking,
            customer=self.customer,
            provider=self.provider_user,
            service=self.service,
            rating=4,
            review="Good service",
        )
        self.client.force_authenticate(user=self.customer)
        url = reverse("review-create")
        data = {
            "booking": self.booking.id,
            "rating": 5,
            "review": "Trying to review again",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
