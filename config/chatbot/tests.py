from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


class ChatbotTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.chat_url = reverse("chatbot-chat")

    def test_chat_valid_message(self):
        data = {"message": "I need a plumber"}
        response = self.client.post(self.chat_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("reply", response.data)

    def test_chat_empty_message(self):
        data = {"message": ""}
        response = self.client.post(self.chat_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
