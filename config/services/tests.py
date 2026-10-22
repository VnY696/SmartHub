from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from services.models import Category, Service


class ServicesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider1",
            password="Password123!",
            role="provider",
            city="Ernakulam",
        )
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            username="admin1",
            password="Password123!",
        )

        self.category = Category.objects.create(
            name="Plumbing",
            description="Plumbing services",
        )

        self.service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Expert Pipe Leak Repair",
            description="Fixing pipe leaks quickly and efficiently.",
            price=150.00,
            city="Ernakulam",
            experience=5,
            is_available=True,
            status="active",
        )

    def test_category_list_public(self):
        url = reverse("category-list-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_category_create_admin_only(self):
        url = reverse("category-list-create")
        data = {"name": "Electrical", "description": "Electrical repair"}
        
        # Provider attempted - forbidden
        self.client.force_authenticate(user=self.provider)
        res_provider = self.client.post(url, data, format="json")
        self.assertEqual(res_provider.status_code, status.HTTP_403_FORBIDDEN)

        # Admin attempted - success
        self.client.force_authenticate(user=self.admin)
        res_admin = self.client.post(url, data, format="json")
        self.assertEqual(res_admin.status_code, status.HTTP_201_CREATED)

    def test_service_list_filter_search(self):
        url = reverse("service-list")
        response = self.client.get(f"{url}?search=Pipe&city=Ernakulam")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_service_compare(self):
        url = f"{reverse('service-compare')}?ids={self.service.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
