from django.contrib import admin
from .models import Category, Service

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "created_at"
    )
    search_fields = (
        "name",
    )

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "provider",
        "category",
        "price",
        "city",
        "is_available",
    )
    
    list_filter = (
        "category",
        "city",
        "is_available",
    )

    search_fields = (
        "title",
        "provider__username",
        "provider__email",
    )