from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, ProviderProfile
from services.models import Category, Service
from bookings.models import Booking


class BookingsTestCase(TestCase):
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
        # Approve provider profile
        profile = ProviderProfile.objects.get(user=self.provider_user)
        profile.verification_status = "approved"
        profile.save()

        self.category = Category.objects.create(name="Cleaning")
        self.service = Service.objects.create(
            provider=self.provider_user,
            category=self.category,
            title="Home Cleaning Pro",
            description="Deep cleaning service for your entire home.",
            price=200.00,
            city="New York",
            is_available=True,
            status="active",
        )

    def test_create_booking(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("booking-create")
        data = {
            "service": self.service.id,
            "booking_date": str(date.today() + timedelta(days=2)),
            "address": "123 Main St",
            "customer_notes": "Please bring supplies",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Booking.objects.filter(customer=self.customer).exists())

    def test_provider_accept_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            provider=self.provider_user,
            service=self.service,
            booking_date=date.today() + timedelta(days=3),
            address="123 Main St",
            price=200.00,
            status="pending",
        )
        self.client.force_authenticate(user=self.provider_user)
        url = reverse("booking-accept", kwargs={"id": booking.id})
        response = self.client.patch(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "accepted")
