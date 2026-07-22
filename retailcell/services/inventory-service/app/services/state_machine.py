"""
RetailCell Inventory Service - State Machine
Manages supply request state transitions
"""
from fastapi import HTTPException

# Valid state transitions
VALID_TRANSITIONS = {
    "CREATED": ["PENDING_APPROVAL", "CANCELLED"],
    "PENDING_APPROVAL": ["APPROVED", "REJECTED", "CANCELLED"],
    "APPROVED": ["PROCESSING", "CANCELLED"],
    "REJECTED": [],
    "PROCESSING": ["SHIPPED", "CANCELLED"],
    "SHIPPED": ["DELIVERED"],
    "DELIVERED": [],
    "CANCELLED": [],
}

TRANSITION_LABELS = {
    "CREATED": "Oluşturuldu",
    "PENDING_APPROVAL": "Onay Bekliyor",
    "APPROVED": "Onaylandı",
    "REJECTED": "Reddedildi",
    "PROCESSING": "İşleniyor",
    "SHIPPED": "Kargoya Verildi",
    "DELIVERED": "Teslim Edildi",
    "CANCELLED": "İptal Edildi",
}


def can_transition(current_status: str, new_status: str) -> bool:
    """Check if a state transition is valid."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    return new_status in allowed


def validate_transition(current_status: str, new_status: str):
    """Validate and enforce state transition rules."""
    if not can_transition(current_status, new_status):
        allowed = VALID_TRANSITIONS.get(current_status, [])
        raise HTTPException(
            status_code=400,
            detail=f"'{TRANSITION_LABELS.get(current_status)}' durumundan "
                   f"'{TRANSITION_LABELS.get(new_status)}' durumuna geçiş yapılamaz. "
                   f"İzin verilen geçişler: {[TRANSITION_LABELS.get(s) for s in allowed]}",
        )


def get_next_states(current_status: str) -> list[dict]:
    """Get available next states for a supply request."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    return [{"status": s, "label": TRANSITION_LABELS.get(s, s)} for s in allowed]
