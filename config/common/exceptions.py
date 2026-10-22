import logging

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that wraps all DRF errors
    into a consistent JSON response format:

    {
        "success": false,
        "message": "...",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "message": _get_error_message(response),
            "errors": response.data if isinstance(response.data, dict) else {"detail": response.data},
        }
        response.data = custom_data
    else:
        # Unhandled exception — log it and return 500
        logger.exception(
            "Unhandled exception in %s",
            context.get("view", "unknown"),
            exc_info=exc,
        )
        response = Response(
            {
                "success": False,
                "message": "An unexpected error occurred.",
                "errors": {},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _get_error_message(response):
    """Extract a human-readable message from the DRF error response."""
    if isinstance(response.data, dict):
        detail = response.data.get("detail")
        if detail:
            return str(detail)

        # Collect first field error
        for field, errors in response.data.items():
            if isinstance(errors, list) and errors:
                return f"{field}: {errors[0]}"
            elif isinstance(errors, str):
                return f"{field}: {errors}"

    if isinstance(response.data, list) and response.data:
        return str(response.data[0])

    return "Validation error."
