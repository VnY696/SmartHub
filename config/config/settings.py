"""
Django settings for SmartHub — AI-Powered Local Service Marketplace.

Uses python-dotenv to load configuration from .env file.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ─────────────────────────── Security ───────────────────────────

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-CHANGE-ME-IN-PRODUCTION",
)

DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if h.strip()
]


# ─────────────────────── Application definition ─────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "django_filters",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",

    # Local apps
    "common",
    "accounts",
    "services",
    "bookings",
    "reviews",
    "recommendations",
    "chatbot",
    "notifications",
]

AUTH_USER_MODEL = "accounts.User"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ─────────────────────────── Database ───────────────────────────

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "service_marketplace"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "admin123"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ──────────────────── Django REST Framework ─────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
}


# ─────────────────────── Simple JWT ─────────────────────────────

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", "30"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# ──────────────────── drf-spectacular ───────────────────────────

SPECTACULAR_SETTINGS = {
    "TITLE": "SmartHub — AI-Powered Local Service Marketplace API",
    "DESCRIPTION": (
        "REST API for connecting customers with local service providers. "
        "Features include service discovery, booking management, reviews, "
        "AI-powered recommendations, and an AI chatbot."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/",
    "COMPONENT_SPLIT_REQUEST": True,
}


# ──────────────────── Password validation ───────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ──────────────────── Internationalization ──────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ───────────────── Static & Media files ─────────────────────────

STATIC_URL = "static/"
MEDIA_URL = os.getenv("MEDIA_URL", "/media/")
MEDIA_ROOT = BASE_DIR / "media"


# ──────────────────────── CORS ──────────────────────────────────

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True


# ──────────────────────── Logging ───────────────────────────────

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "smarthub.log",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "accounts": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "services": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "bookings": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "reviews": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "recommendations": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "chatbot": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "notifications": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
