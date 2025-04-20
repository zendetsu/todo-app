from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def update(self, instance, validated_data):
        if validated_data.get("is_completed") and instance.subtasks.filter(is_completed=False).exists():
            raise serializers.ValidationError("Cannot complete task with incomplete subtasks")
        return super().update(instance, validated_data)
