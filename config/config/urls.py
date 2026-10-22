"""
Root URL configuration for SmartHub.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API endpoints
    path("api/accounts/", include("accounts.urls")),
    path("api/services/", include("services.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/admin/", include("common.urls")),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )