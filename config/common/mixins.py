from rest_framework.response import Response
from rest_framework import status


class SuccessResponseMixin:
    """
    Mixin for views that want to wrap successful responses in
    a standard format:

    {
        "success": true,
        "message": "...",
        "data": { ... }
    }
    """

    def success_response(self, data=None, message="Success", http_status=status.HTTP_200_OK):
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
            },
            status=http_status,
        )

    def created_response(self, data=None, message="Created successfully"):
        return self.success_response(
            data=data,
            message=message,
            http_status=status.HTTP_201_CREATED,
        )

    def no_content_response(self, message="Deleted successfully"):
        return Response(
            {
                "success": True,
                "message": message,
            },
            status=status.HTTP_204_NO_CONTENT,
        )
