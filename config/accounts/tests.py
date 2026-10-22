from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, ProviderProfile


class AccountsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.profile_url = reverse("profile")

        self.customer_user = User.objects.create_user(
            email="customer@example.com",
            username="customer1",
            password="Password123!",
            role="customer",
            phone="1234567890",
            city="New York",
        )

        self.provider_user = User.objects.create_user(
            email="provider@example.com",
            username="provider1",
            password="Password123!",
            role="provider",
            phone="0987654321",
            city="New York",
        )

        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            username="admin1",
            password="Password123!",
        )

    def test_user_registration_customer(self):
        data = {
            "email": "newcustomer@example.com",
            "username": "newcustomer",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "customer",
            "phone": "5551234567",
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newcustomer@example.com").exists())

    def test_user_registration_admin_forbidden(self):
        data = {
            "email": "hackadmin@example.com",
            "username": "hackadmin",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin",
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        data = {
            "email": "customer@example.com",
            "password": "Password123!",
        }
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_profile_access(self):
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "customer@example.com")
