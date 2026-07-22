"""
RetailCell Inventory Service - Kafka Producer
Publishes events to Kafka topics
"""
import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger("inventory-kafka-producer")


class KafkaProducerService:
    """Kafka event producer using Redis Streams as fallback."""

    def __init__(self, redis_client=None):
        self.redis = redis_client

    async def publish_event(self, topic: str, event_type: str, payload: dict):
        """Publish an event to a topic (Redis Streams)."""
        event = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "inventory-service",
            "payload": json.dumps(payload),
        }

        try:
            if self.redis:
                await self.redis.xadd(f"stream:{topic}", event, maxlen=10000)
                logger.info(f"📤 Event published: {topic}/{event_type}")
            else:
                logger.warning(f"⚠️ Redis not available, event not published: {topic}/{event_type}")
        except Exception as e:
            logger.error(f"❌ Failed to publish event: {e}")

    async def publish_inventory_updated(self, product_id: str, stock_quantity: int, status: str):
        await self.publish_event("inventory", "inventory.updated", {
            "product_id": product_id,
            "stock_quantity": stock_quantity,
            "status": status,
        })

    async def publish_supply_request_created(self, request_id: str, priority: str, region: str):
        await self.publish_event("supply", "supply.created", {
            "request_id": request_id,
            "priority": priority,
            "region": region,
        })

    async def publish_supply_request_shipped(self, request_id: str, requester_id: str):
        await self.publish_event("supply", "supply.shipped", {
            "request_id": request_id,
            "requester_id": requester_id,
        })

    async def publish_supply_request_delivered(self, request_id: str, requester_id: str):
        await self.publish_event("supply", "supply.delivered", {
            "request_id": request_id,
            "requester_id": requester_id,
        })
