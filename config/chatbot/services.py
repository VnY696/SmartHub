"""
AI Chatbot service layer.

Uses OpenAI API when OPENAI_API_KEY is set, otherwise falls back
to a rule-based response system that uses internal service search.

The chatbot helps users with:
- Service discovery
- Category selection
- Booking guidance
- General platform questions
- Provider recommendations
"""

import os
import logging
import json

from django.db.models import Q

logger = logging.getLogger(__name__)

# Check if OpenAI is available
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def get_chatbot_response(message, user=None):
    """
    Process a user message and return a response.

    Args:
        message: The user's message string.
        user: Authenticated user or None.

    Returns:
        dict with keys: reply, recommended_services, recommended_categories
    """
    if OPENAI_API_KEY:
        try:
            return _get_openai_response(message, user)
        except Exception as e:
            logger.error("OpenAI API error: %s — falling back to rule-based", e)

    return _get_rule_based_response(message, user)


def _get_openai_response(message, user=None):
    """Call OpenAI API for an intelligent response."""
    from openai import OpenAI

    # Get context about available services
    context = _build_context(message, user)

    client = OpenAI(api_key=OPENAI_API_KEY)

    system_prompt = (
        "You are SmartHub Assistant, an AI helper for a local service marketplace. "
        "Help users find services, understand categories, and guide them through bookings. "
        "Be friendly, concise, and helpful. "
        "When recommending services, use the provided context about available services. "
        "Never make up services that don't exist on the platform. "
        "Do not modify bookings or perform actions — only provide information and guidance."
    )

    if context["services"]:
        system_prompt += f"\n\nAvailable services matching the query:\n{json.dumps(context['services'], indent=2)}"

    if context["categories"]:
        system_prompt += f"\n\nAvailable categories:\n{json.dumps(context['categories'], indent=2)}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        reply = response.choices[0].message.content

        return {
            "reply": reply,
            "recommended_services": context.get("service_objects", []),
            "recommended_categories": context.get("category_objects", []),
        }
    except Exception as e:
        logger.error("OpenAI API call failed: %s", e)
        raise


def _get_rule_based_response(message, user=None):
    """
    Fallback rule-based chatbot when OpenAI is not configured.
    Searches services based on message keywords.
    """
    message_lower = message.lower()
    context = _build_context(message, user)

    # ── Greeting ──
    if any(word in message_lower for word in ("hello", "hi", "hey", "greetings")):
        reply = (
            "Hello! 👋 Welcome to SmartHub! I can help you find local services, "
            "explore categories, or guide you through making a booking. "
            "What are you looking for today?"
        )

    # ── Booking help ──
    elif any(word in message_lower for word in ("book", "booking", "schedule", "appointment")):
        reply = (
            "To book a service:\n"
            "1. Browse or search for a service\n"
            "2. Select the service you want\n"
            "3. Choose a date and time\n"
            "4. Provide your address and any notes\n"
            "5. Submit your booking!\n\n"
            "The provider will review and accept your request."
        )

    # ── Category query ──
    elif any(word in message_lower for word in ("category", "categories", "types", "kind")):
        if context["categories"]:
            cat_names = ", ".join([c["name"] for c in context["categories"]])
            reply = f"We have these service categories available: {cat_names}. Which one interests you?"
        else:
            reply = "We have many service categories! Try searching for a specific type of service."

    # ── Service search ──
    elif context["services"]:
        count = len(context["services"])
        reply = (
            f"I found {count} service(s) matching your query! "
            "Here are some recommendations. Would you like to know more about any of them, "
            "or would you like to book one?"
        )

    # ── Pricing ──
    elif any(word in message_lower for word in ("price", "cost", "how much", "rate", "fee")):
        reply = (
            "Pricing varies by service and provider. You can filter services by price range "
            "in our service listings. Each service listing shows the price and pricing type "
            "(fixed, hourly, or negotiable)."
        )

    # ── Review ──
    elif any(word in message_lower for word in ("review", "rating", "feedback")):
        reply = (
            "After a service is completed, you can leave a review and rating (1-5 stars). "
            "This helps other customers choose the best providers!"
        )

    # ── Default ──
    else:
        reply = (
            "I'm here to help! You can ask me about:\n"
            "• Finding specific services (e.g., 'I need a plumber')\n"
            "• Available service categories\n"
            "• How to book a service\n"
            "• Pricing information\n"
            "• Reviews and ratings\n\n"
            "What would you like to know?"
        )

    return {
        "reply": reply,
        "recommended_services": context.get("service_objects", []),
        "recommended_categories": context.get("category_objects", []),
    }


def _build_context(message, user=None):
    """
    Build context by searching services and categories based on the message.
    Returns serialized data for both AI and rule-based responses.
    """
    from services.models import Service, Category
    from services.serializers import ServiceSerializer, CategorySerializer

    message_words = message.lower().split()

    # Search services
    service_query = Q()
    for word in message_words:
        if len(word) > 2:  # Skip short words
            service_query |= (
                Q(title__icontains=word)
                | Q(description__icontains=word)
                | Q(category__name__icontains=word)
                | Q(city__icontains=word)
            )

    services = []
    service_objects = []
    if service_query:
        matched_services = (
            Service.objects
            .select_related("provider", "category")
            .filter(service_query, is_available=True, status="active")
            .distinct()[:5]
        )
        services = [
            {
                "id": s.id,
                "title": s.title,
                "category": s.category.name,
                "price": str(s.price),
                "city": s.city,
                "rating": str(s.average_rating),
            }
            for s in matched_services
        ]
        service_objects = ServiceSerializer(matched_services, many=True).data

    # Get categories
    categories = list(
        Category.objects.filter(is_active=True)
        .values("id", "name", "slug")[:10]
    )
    category_objects = CategorySerializer(
        Category.objects.filter(is_active=True)[:10],
        many=True,
    ).data

    return {
        "services": services,
        "service_objects": service_objects,
        "categories": categories,
        "category_objects": category_objects,
    }
