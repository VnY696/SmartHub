from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from notifications.models import Notification


class NotificationsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user@example.com",
            username="user1",
            password="Password123!",
        )
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type="general",
            title="Test Notification",
            message="This is a test notification.",
        )

    def test_list_notifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notification-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_mark_notification_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notification-read", kwargs={"id": self.notification.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
