import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import ProviderProfile

logger = logging.getLogger(__name__)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_provider_profile(sender, instance, created, **kwargs):
    """
    Ensure a ProviderProfile exists for every user with role='provider'.
    This handles cases where a user's role is changed after registration.
    """
    if instance.role == "provider":
        profile, was_created = ProviderProfile.objects.get_or_create(
            user=instance,
        )
        if was_created:
            logger.info(
                "ProviderProfile auto-created via signal for %s",
                instance.email,
            )
