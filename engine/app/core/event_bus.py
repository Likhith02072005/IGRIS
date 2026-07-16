import redis
import json
import logging
from typing import Callable, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class EventBus:
    """
    Enterprise Redis Streams & Pub/Sub Event Bus for IGRIS.
    Enables loose coupling and real-time messaging between microservices.
    """
    def __init__(self):
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.stream_name = "igris:event_stream"
        self.pubsub_prefix = "igris:chan:"
        
    def publish(self, event_type: str, data: Dict[str, Any]) -> str:
        """
        Publishes an event to both Redis Streams (persistence) and Pub/Sub (real-time notification).
        """
        payload = {
            "event_type": event_type,
            "data": json.dumps(data)
        }
        try:
            # 1. Publish to Redis Stream for persistence / event sourcing
            stream_id = self.redis_client.xadd(self.stream_name, payload)
            
            # 2. Publish to Pub/Sub channel for live subscriber alerts
            channel = f"{self.pubsub_prefix}{event_type}"
            self.redis_client.publish(channel, json.dumps(payload))
            
            logger.info(f"Published event {event_type} to EventBus. Stream ID: {stream_id}")
            return stream_id
        except Exception as e:
            logger.error(f"EventBus publication failed for {event_type}: {e}")
            raise e

    def subscribe(self, event_types: list[str], callback: Callable[[str, Dict[str, Any]], None]):
        """
        Subscribes to specific Pub/Sub channels and executes the callback on message arrival.
        """
        pubsub = self.redis_client.pubsub()
        channels = [f"{self.pubsub_prefix}{et}" for et in event_types]
        
        pubsub.subscribe(**{ch: lambda msg: self._handle_pubsub_msg(msg, callback) for ch in channels})
        return pubsub

    def _handle_pubsub_msg(self, message: Dict[str, Any], callback: Callable[[str, Dict[str, Any]], None]):
        try:
            raw_data = json.loads(message["data"])
            event_type = raw_data["event_type"]
            data = json.loads(raw_data["data"])
            callback(event_type, data)
        except Exception as e:
            logger.error(f"Failed to parse EventBus pubsub message: {e}")

# Global EventBus instance
event_bus = EventBus()
