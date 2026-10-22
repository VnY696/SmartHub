import django_filters
from .models import Service


class ServiceFilter(django_filters.FilterSet):
    """Advanced filtering for service listings."""

    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
    )
    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
    )
    city = django_filters.CharFilter(
        lookup_expr="icontains",
    )
    category = django_filters.NumberFilter(
        field_name="category__id",
    )
    category_slug = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="exact",
    )
    experience = django_filters.NumberFilter(
        lookup_expr="gte",
    )
    pricing_type = django_filters.CharFilter(
        lookup_expr="exact",
    )
    status = django_filters.CharFilter(
        lookup_expr="exact",
    )
    is_available = django_filters.BooleanFilter()
    provider = django_filters.NumberFilter(
        field_name="provider__id",
    )

    class Meta:
        model = Service
        fields = [
            "category",
            "category_slug",
            "city",
            "is_available",
            "pricing_type",
            "status",
            "provider",
        ]