from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allow access only to users with the 'admin' role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsCustomer(BasePermission):
    """
    Allow access only to users with the 'customer' role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "customer"
        )


class IsProvider(BasePermission):
    """
    Allow access only to users with the 'provider' role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "provider"
        )


class IsProviderOrAdmin(BasePermission):
    """
    Allow access to providers or admins.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("provider", "admin")
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: only the owner can modify.
    Safe methods (GET, HEAD, OPTIONS) are allowed for everyone.
    Expects the object to have a 'provider' or 'user' attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        # Check common ownership patterns
        if hasattr(obj, "provider"):
            return obj.provider == request.user
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False
