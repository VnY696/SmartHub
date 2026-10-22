import logging

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .services import get_chatbot_response

logger = logging.getLogger(__name__)


class ChatView(APIView):
    """
    POST /api/chatbot/chat/

    Request: {"message": "I need a plumber near me"}
    Response: {
        "reply": "...",
        "recommended_services": [...],
        "recommended_categories": [...]
    }
    """
    permission_classes = [AllowAny]

    from drf_spectacular.utils import extend_schema
    from .serializers import ChatMessageInputSerializer, ChatResponseSerializer

    @extend_schema(
        request=ChatMessageInputSerializer,
        responses={200: ChatResponseSerializer},
    )
    def post(self, request):
        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {
                    "success": False,
                    "message": "Message is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(message) > 1000:
            return Response(
                {
                    "success": False,
                    "message": "Message is too long (max 1000 characters).",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user if request.user.is_authenticated else None

        try:
            result = get_chatbot_response(message, user=user)

            # Track search in history for authenticated users
            if user:
                try:
                    from recommendations.models import SearchHistory
                    SearchHistory.objects.create(
                        user=user,
                        query=message[:255],
                    )
                except Exception:
                    pass

            return Response(
                {
                    "success": True,
                    "reply": result["reply"],
                    "recommended_services": result["recommended_services"],
                    "recommended_categories": result["recommended_categories"],
                },
            )

        except Exception as e:
            logger.exception("Chatbot error: %s", e)
            return Response(
                {
                    "success": False,
                    "message": "Chatbot is temporarily unavailable. Please try again later.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
