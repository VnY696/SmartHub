from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, ProviderProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "email",
        "username",
        "role",
        "city",
        "is_active",
        "date_joined",
    )
    list_filter = (
        "role",
        "is_active",
        "is_staff",
        "city",
    )
    search_fields = (
        "email",
        "username",
        "phone",
        "city",
    )
    ordering = ("-date_joined",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("SmartHub Fields", {
            "fields": ("phone", "role", "city", "address", "profile_image"),
        }),
    )


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "business_name",
        "city",
        "verification_status",
        "is_available",
        "created_at",
    )
    list_filter = (
        "verification_status",
        "is_available",
        "city",
    )
    search_fields = (
        "user__email",
        "user__username",
        "business_name",
        "city",
    )
    list_editable = (
        "verification_status",
    )