from rest_framework.permissions import BasePermission


class IsProvider(BasePermission):
    """
    Only authenticated providers can create services.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "provider"
        )

class IsOwnerOrReadOnly(BasePermission):
    """
    Only the owner can update/delete.
    Everyone can view.
    """

    def has_object_permission(self, request, view, obj):

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return obj.provider == request.user