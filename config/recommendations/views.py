from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from services.serializers import ServiceSerializer
from .services import get_recommendations


class RecommendationView(generics.GenericAPIView):
    """
    GET /api/recommendations/
    Returns personalized recommendations for authenticated users,
    or popular services for anonymous users.
    """
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        limit = int(request.query_params.get("limit", 10))
        limit = min(limit, 50)  # Cap at 50

        user = request.user if request.user.is_authenticated else None
        services = get_recommendations(user=user, limit=limit)

        serializer = ServiceSerializer(services, many=True)

        return Response(
            {
                "success": True,
                "message": "Personalized recommendations." if user else "Popular services.",
                "data": serializer.data,
            },
        )
