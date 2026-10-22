from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from services.models import Category, Service


class RecommendationsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user@example.com",
            username="user1",
            password="Password123!",
            city="Chicago",
        )
        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider1",
            password="Password123!",
            role="provider",
        )
        self.category = Category.objects.create(name="Landscaping")
        Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Lawn Mowing Pro",
            description="Professional lawn mowing and edging.",
            price=80.00,
            city="Chicago",
            is_available=True,
            status="active",
        )

    def test_anonymous_recommendations(self):
        url = reverse("recommendations")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)

    def test_authenticated_recommendations(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("recommendations")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Personalized recommendations.")
