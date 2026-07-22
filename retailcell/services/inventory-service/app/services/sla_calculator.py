"""
RetailCell Inventory Service - SLA Calculator
"""
from datetime import datetime, timedelta, timezone


SLA_HOURS = {
    "P0": 4,    # 4 saat
    "P1": 12,   # 12 saat
    "P2": 48,   # 2 gün
    "P3": 120,  # 5 gün
}


def calculate_sla_deadline(priority: str, created_at: datetime = None) -> datetime:
    """Calculate SLA deadline based on priority."""
    if created_at is None:
        created_at = datetime.now(timezone.utc)
    hours = SLA_HOURS.get(priority, 48)
    return created_at + timedelta(hours=hours)


def is_sla_breached(deadline: datetime) -> bool:
    """Check if SLA deadline has passed."""
    if deadline is None:
        return False
    return datetime.now(timezone.utc) > deadline


def calculate_sla_remaining(deadline: datetime) -> dict:
    """Calculate remaining time until SLA deadline."""
    if deadline is None:
        return {"remaining_hours": 0, "is_breached": False, "status": "unknown"}

    now = datetime.now(timezone.utc)
    diff = deadline - now

    if diff.total_seconds() < 0:
        return {
            "remaining_hours": 0,
            "is_breached": True,
            "status": "breached",
            "breached_by_hours": round(abs(diff.total_seconds()) / 3600, 1),
        }

    hours = diff.total_seconds() / 3600
    status = "critical" if hours < 2 else "warning" if hours < 6 else "on_track"

    return {
        "remaining_hours": round(hours, 1),
        "is_breached": False,
        "status": status,
    }
