"""
RetailCell Inventory Service - Kafka Consumer
Listens for events from other services
"""
import asyncio
import json
import logging

logger = logging.getLogger("inventory-kafka-consumer")


class KafkaConsumerService:
    """Event consumer using Redis Streams."""

    def __init__(self, redis_client=None):
        self.redis = redis_client
        self.running = False
        self.handlers = {}

    def register_handler(self, event_type: str, handler):
        self.handlers[event_type] = handler

    async def start_consuming(self, topics: list[str], group: str = "inventory-group"):
        """Start consuming events from topics."""
        if not self.redis:
            logger.warning("⚠️ Redis not available, consumer not started")
            return

        self.running = True
        logger.info(f"🎧 Starting consumer for topics: {topics}")

        for topic in topics:
            stream_key = f"stream:{topic}"
            try:
                await self.redis.xgroup_create(stream_key, group, id="0", mkstream=True)
            except Exception:
                pass  # Group already exists

        while self.running:
            try:
                for topic in topics:
                    stream_key = f"stream:{topic}"
                    messages = await self.redis.xreadgroup(
                        group, "inventory-consumer", {stream_key: ">"}, count=10, block=1000
                    )
                    for stream, entries in messages:
                        for msg_id, data in entries:
                            event_type = data.get("event_type", "")
                            if event_type in self.handlers:
                                payload = json.loads(data.get("payload", "{}"))
                                await self.handlers[event_type](payload)
                            await self.redis.xack(stream_key, group, msg_id)

            except Exception as e:
                logger.error(f"Consumer error: {e}")
                await asyncio.sleep(5)

    async def stop(self):
        self.running = False
