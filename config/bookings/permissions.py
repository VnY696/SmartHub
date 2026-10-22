from rest_framework.permissions import BasePermission


class IsBookingCustomer(BasePermission):
    """Only the customer who made the booking can access it."""

    def has_object_permission(self, request, view, obj):
        return obj.customer == request.user


class IsBookingProvider(BasePermission):
    """Only the provider associated with the booking can access it."""

    def has_object_permission(self, request, view, obj):
        return obj.provider == request.user
