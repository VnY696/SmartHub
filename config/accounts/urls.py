from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    ProviderListView,
    ProviderDetailView,
    ProviderProfileMeView,
    UserListView,
    UserDetailView,
    ProviderVerificationView,
    PendingProviderListView,
)

urlpatterns = [
    # ── Authentication ──
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # ── Profile ──
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),

    # ── Provider profiles (public) ──
    path("providers/", ProviderListView.as_view(), name="provider-list"),
    path("providers/me/", ProviderProfileMeView.as_view(), name="provider-me"),
    path("providers/<int:id>/", ProviderDetailView.as_view(), name="provider-detail"),

    # ── Admin: user management ──
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:id>/", UserDetailView.as_view(), name="user-detail"),

    # ── Admin: provider verification ──
    path("providers/pending/", PendingProviderListView.as_view(), name="provider-pending"),
    path("providers/<int:id>/verify/", ProviderVerificationView.as_view(), name="provider-verify"),
]