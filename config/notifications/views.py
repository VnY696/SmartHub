from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — user's notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        queryset = Notification.objects.filter(user=self.request.user)
        # Optional filter: ?unread=true
        unread = self.request.query_params.get("unread")
        if unread and unread.lower() == "true":
            queryset = queryset.filter(is_read=False)
        return queryset


class NotificationReadView(generics.GenericAPIView):
    """PATCH /api/notifications/{id}/read/ — mark single notification as read."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(
            {
                "success": True,
                "message": "Notification marked as read.",
            },
        )


class NotificationReadAllView(generics.GenericAPIView):
    """PATCH /api/notifications/read-all/ — mark all notifications as read."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response(
            {
                "success": True,
                "message": f"{count} notification(s) marked as read.",
            },
        )
