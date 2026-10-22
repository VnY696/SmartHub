"""
Recommendation engine service layer.

This module provides a modular recommendation system that can be
easily extended or replaced with ML-based approaches.

Current algorithm (rule-based):
1. For authenticated users:
   - Services from categories the user has booked before
   - Services in the user's city
   - Highly rated services
   - Services from categories in their search history
2. For anonymous users:
   - Popular services (by rating and review count)
"""

import logging
from django.db.models import Q, F, Avg, Count

from services.models import Service

logger = logging.getLogger(__name__)


def get_recommendations(user=None, limit=10):
    """
    Return recommended services.

    Args:
        user: Authenticated user or None for anonymous.
        limit: Max number of recommendations.

    Returns:
        QuerySet of Service objects.
    """
    if user and user.is_authenticated:
        return _get_personalized_recommendations(user, limit)
    return _get_popular_services(limit)


def _get_personalized_recommendations(user, limit):
    """
    Personalized recommendations based on:
    - User's booking history (preferred categories)
    - User's city
    - Search history
    - Service ratings
    """
    from bookings.models import Booking

    # Get categories from past bookings
    booked_category_ids = list(
        Booking.objects.filter(customer=user)
        .values_list("service__category_id", flat=True)
        .distinct()
    )

    # Get categories from search history
    from recommendations.models import SearchHistory
    search_category_ids = list(
        SearchHistory.objects.filter(user=user, category__isnull=False)
        .values_list("category_id", flat=True)
        .distinct()[:5]
    )

    preferred_categories = list(set(booked_category_ids + search_category_ids))

    # Build recommendation query
    queryset = (
        Service.objects
        .select_related("provider", "category")
        .filter(is_available=True, status="active")
        .exclude(provider=user)  # Don't recommend user's own services
    )

    if preferred_categories or user.city:
        # Score-based filtering: prefer matched categories and city
        filters = Q()
        if preferred_categories:
            filters |= Q(category_id__in=preferred_categories)
        if user.city:
            filters |= Q(city__icontains=user.city)

        recommended = queryset.filter(filters).order_by(
            "-average_rating", "-total_reviews", "-created_at"
        )[:limit]

        # If not enough results, pad with popular services
        if recommended.count() < limit:
            remaining = limit - recommended.count()
            exclude_ids = list(recommended.values_list("id", flat=True))
            popular = queryset.exclude(id__in=exclude_ids).order_by(
                "-average_rating", "-total_reviews"
            )[:remaining]
            return list(recommended) + list(popular)

        return recommended

    # Fallback: popular services
    return _get_popular_services(limit)


def _get_popular_services(limit):
    """Return popular services sorted by rating and review count."""
    return (
        Service.objects
        .select_related("provider", "category")
        .filter(is_available=True, status="active")
        .order_by("-average_rating", "-total_reviews", "-created_at")
        [:limit]
    )
