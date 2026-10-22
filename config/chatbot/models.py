from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    """A chat session between a user and the AI chatbot."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_sessions",
        null=True,
        blank=True,
        help_text="Null for anonymous sessions",
    )
    session_key = models.CharField(
        max_length=100,
        blank=True,
        help_text="For anonymous session tracking",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        if self.user:
            return f"Chat session for {self.user.email}"
        return f"Anonymous chat session {self.session_key}"


class ChatMessage(models.Model):
    """A single message in a chat session."""

    ROLE_CHOICES = (
        ("user", "User"),
        ("assistant", "Assistant"),
    )

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
    )
    content = models.TextField()
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
