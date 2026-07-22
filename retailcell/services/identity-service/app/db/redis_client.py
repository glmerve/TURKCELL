"""
RetailCell Identity Service - Redis Client
Used for token blacklist and session caching
"""
import redis.asyncio as redis
from app.core.config import get_settings

settings = get_settings()

redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    """Get Redis client instance."""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def blacklist_token(token: str, expires_in: int = 900):
    """Add a token to the blacklist (for logout)."""
    client = await get_redis()
    await client.setex(f"blacklist:{token}", expires_in, "1")


async def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted."""
    client = await get_redis()
    result = await client.get(f"blacklist:{token}")
    return result is not None


async def cache_user_session(user_id: str, session_data: dict, expires_in: int = 3600):
    """Cache user session data in Redis."""
    client = await get_redis()
    import json
    await client.setex(f"session:{user_id}", expires_in, json.dumps(session_data))


async def get_user_session(user_id: str) -> dict | None:
    """Get cached user session data."""
    client = await get_redis()
    import json
    data = await client.get(f"session:{user_id}")
    return json.loads(data) if data else None
