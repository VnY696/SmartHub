from rest_framework import serializers


class ChatMessageInputSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=1000,
        help_text="User's query or message for the chatbot",
    )


class ChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    reply = serializers.CharField()
    recommended_services = serializers.ListField(child=serializers.DictField(), required=False)
    recommended_categories = serializers.ListField(child=serializers.DictField(), required=False)
