"""
Notification service layer.

Provides a single function to create notifications from anywhere
in the codebase. Designed to be extended with email/push later.
"""

import logging
from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(
    user,
    notification_type,
    title,
    message,
    related_booking=None,
):
    """
    Create an in-app notification for a user.

    Args:
        user: The User to notify.
        notification_type: One of Notification.TYPE_CHOICES.
        title: Short notification title.
        message: Notification body text.
        related_booking: Optional related Booking instance.

    Returns:
        The created Notification instance.
    """
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_booking=related_booking,
    )

    logger.info(
        "Notification created for %s: [%s] %s",
        user.email,
        notification_type,
        title,
    )

    # ── Future extension points ──
    # _send_email_notification(user, title, message)
    # _send_push_notification(user, title, message)

    return notification
