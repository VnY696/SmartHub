import logging

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Service
from .serializers import (
    CategorySerializer,
    ServiceSerializer,
    ServiceCreateSerializer,
    ServiceUpdateSerializer,
    ServiceCompareSerializer,
)
from .filters import ServiceFilter
from common.permissions import IsAdmin, IsProvider, IsOwnerOrReadOnly

logger = logging.getLogger(__name__)


# ═══════════════════════ Categories ═════════════════════════════


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET /api/services/categories/ — public, list active categories
    POST /api/services/categories/ — admin only, create category
    """
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == "admin":
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/services/categories/{id}/ — public
    PUT/PATCH /api/services/categories/{id}/ — admin only
    DELETE /api/services/categories/{id}/ — admin only
    """
    serializer_class = CategorySerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == "admin":
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


# ═══════════════════════ Services ═══════════════════════════════


class ServiceListView(generics.ListAPIView):
    """
    GET /api/services/ — public, list active services with filtering.
    Supports: ?search=, ?category=, ?city=, ?min_price=, ?max_price=,
              ?ordering=, ?page=, ?page_size=
    """
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ServiceFilter

    search_fields = [
        "title",
        "description",
        "city",
        "provider__username",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "average_rating",
        "experience",
        "total_reviews",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Service.objects
            .select_related("provider", "category")
            .filter(is_available=True, status="active")
        )


class ServiceDetailView(generics.RetrieveAPIView):
    """GET /api/services/{id}/ — public, service detail."""
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        return (
            Service.objects
            .select_related("provider", "category")
        )


class ServiceCreateView(generics.CreateAPIView):
    """POST /api/services/create/ — provider only, create service."""
    serializer_class = ServiceCreateSerializer
    permission_classes = [IsAuthenticated, IsProvider]
    queryset = Service.objects.all()


class ServiceUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/services/{id}/update/ — owner only."""
    queryset = Service.objects.all()
    serializer_class = ServiceUpdateSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "id"


class ServiceDeleteView(generics.DestroyAPIView):
    """DELETE /api/services/{id}/delete/ — owner or admin."""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "id"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Service deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ServiceCompareView(APIView):
    """
    GET /api/services/compare/?ids=1,2,3
    Compare up to 5 services side by side.
    """
    permission_classes = [AllowAny]

    from drf_spectacular.utils import extend_schema

    @extend_schema(responses=ServiceCompareSerializer(many=True))
    def get(self, request):
        ids_param = request.query_params.get("ids", "")
        if not ids_param:
            return Response(
                {"success": False, "message": "Provide ?ids=1,2,3"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ids = [int(x.strip()) for x in ids_param.split(",") if x.strip()]
        except ValueError:
            return Response(
                {"success": False, "message": "Invalid ID format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(ids) > 5:
            return Response(
                {"success": False, "message": "Compare up to 5 services at a time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        services = (
            Service.objects
            .select_related("provider", "category")
            .filter(id__in=ids)
        )

        serializer = ServiceCompareSerializer(services, many=True)
        return Response(
            {
                "success": True,
                "message": f"Comparing {len(serializer.data)} services.",
                "data": serializer.data,
            },
        )


# ═══════════════════ Provider's Own Services ════════════════════


class ProviderMyServicesView(generics.ListAPIView):
    """
    GET /api/services/my/ — provider sees their own services.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsProvider]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Service.objects.none()
        return (
            Service.objects
            .select_related("provider", "category")
            .filter(provider=self.request.user)
        )


# ═══════════════════ Admin Service Moderation ═══════════════════


class AdminServiceListView(generics.ListAPIView):
    """GET /api/services/admin/ — admin sees all services."""
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return (
            Service.objects
            .select_related("provider", "category")
            .all()
        )


class AdminServiceModerateView(generics.UpdateAPIView):
    """PATCH /api/services/admin/{id}/ — admin can change service status."""
    serializer_class = ServiceUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Service.objects.all()
    lookup_field = "id"