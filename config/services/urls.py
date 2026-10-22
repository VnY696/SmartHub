from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    ServiceListView,
    ServiceDetailView,
    ServiceCreateView,
    ServiceUpdateView,
    ServiceDeleteView,
    ServiceCompareView,
    ProviderMyServicesView,
    AdminServiceListView,
    AdminServiceModerateView,
)

urlpatterns = [
    # ── Categories ──
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<int:id>/", CategoryDetailView.as_view(), name="category-detail"),

    # ── Services (public) ──
    path("", ServiceListView.as_view(), name="service-list"),
    path("compare/", ServiceCompareView.as_view(), name="service-compare"),
    path("create/", ServiceCreateView.as_view(), name="service-create"),
    path("<int:id>/", ServiceDetailView.as_view(), name="service-detail"),
    path("<int:id>/update/", ServiceUpdateView.as_view(), name="service-update"),
    path("<int:id>/delete/", ServiceDeleteView.as_view(), name="service-delete"),

    # ── Provider's own services ──
    path("my/", ProviderMyServicesView.as_view(), name="provider-my-services"),

    # ── Admin moderation ──
    path("admin/", AdminServiceListView.as_view(), name="admin-service-list"),
    path("admin/<int:id>/", AdminServiceModerateView.as_view(), name="admin-service-moderate"),
]