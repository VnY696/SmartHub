import logging

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, ProviderProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    ProviderProfileSerializer,
    ProviderProfileUpdateSerializer,
    UserAdminSerializer,
    ProviderVerificationSerializer,
)
from common.permissions import IsAdmin, IsProvider
from common.mixins import SuccessResponseMixin

logger = logging.getLogger(__name__)


# ═══════════════════════ Authentication ═════════════════════════


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/ — public registration."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info("New user registered: %s (role=%s)", user.email, user.role)
        return Response(
            {
                "success": True,
                "message": "Registration successful.",
                "data": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/accounts/login/ — JWT login with custom claims."""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


class LogoutView(generics.GenericAPIView):
    """POST /api/accounts/logout/ — blacklist the refresh token."""
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"success": False, "message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("User logged out: %s", request.user.email)
            return Response(
                {"success": True, "message": "Logout successful."},
            )
        except Exception:
            return Response(
                {"success": False, "message": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ═══════════════════════ User Profile ═══════════════════════════


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/accounts/profile/
    Authenticated user's own profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/accounts/change-password/"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(
            serializer.validated_data["new_password"]
        )
        request.user.save()
        logger.info("Password changed for user: %s", request.user.email)
        return Response(
            {"success": True, "message": "Password changed successfully."},
        )


# ═══════════════════ Provider Profile ═══════════════════════════


class ProviderListView(generics.ListAPIView):
    """
    GET /api/accounts/providers/
    Public list of approved providers.
    """
    serializer_class = ProviderProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            ProviderProfile.objects
            .select_related("user")
            .filter(verification_status="approved")
        )


class ProviderDetailView(generics.RetrieveAPIView):
    """
    GET /api/accounts/providers/{id}/
    Public view of a single provider.
    """
    serializer_class = ProviderProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        return (
            ProviderProfile.objects
            .select_related("user")
            .filter(verification_status="approved")
        )


class ProviderProfileMeView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/accounts/providers/me/
    Provider manages their own profile.
    """
    permission_classes = [IsAuthenticated, IsProvider]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProviderProfileUpdateSerializer
        return ProviderProfileSerializer

    def get_object(self):
        return ProviderProfile.objects.select_related("user").get(
            user=self.request.user,
        )


# ═══════════════════ Admin: User Management ═════════════════════


class UserListView(generics.ListAPIView):
    """
    GET /api/accounts/users/
    Admin-only: list all users with filtering.
    """
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/accounts/users/{id}/
    Admin-only: manage individual users.
    """
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    lookup_field = "id"


# ═══════════════════ Admin: Provider Verification ═══════════════


class ProviderVerificationView(generics.UpdateAPIView):
    """
    PATCH /api/accounts/providers/{id}/verify/
    Admin-only: approve or reject a provider.
    """
    serializer_class = ProviderVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = ProviderProfile.objects.all()
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(
            "Provider %s verification updated to '%s' by admin %s",
            instance.user.email,
            instance.verification_status,
            request.user.email,
        )
        return Response(
            {
                "success": True,
                "message": f"Provider {instance.verification_status}.",
                "data": ProviderProfileSerializer(instance).data,
            },
        )


class PendingProviderListView(generics.ListAPIView):
    """
    GET /api/accounts/providers/pending/
    Admin-only: list providers awaiting verification.
    """
    serializer_class = ProviderProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return (
            ProviderProfile.objects
            .select_related("user")
            .filter(verification_status="pending")
        )