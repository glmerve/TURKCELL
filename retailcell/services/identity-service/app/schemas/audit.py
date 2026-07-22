"""
RetailCell Identity Service - Audit Log Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogResponse(BaseModel):
    """Audit log response schema."""
    id: str
    user_id: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    """Paginated audit log list."""
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
