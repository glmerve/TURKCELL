"""
RetailCell Identity Service - Audit Log Endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.db.models import AuditLog
from app.core.security import require_manager_or_admin
from app.schemas.audit import AuditLogResponse, AuditLogListResponse

router = APIRouter(prefix="/audit-logs", tags=["📋 Denetim Günlükleri"])


@router.get(
    "/",
    response_model=AuditLogListResponse,
    summary="Denetim Günlükleri",
    description="Sistem denetim günlüklerini listeleyin.",
)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: str | None = Query(None, description="Kullanıcı ID filtresi"),
    action: str | None = Query(None, description="Eylem filtresi"),
    resource: str | None = Query(None, description="Kaynak filtresi"),
    current_user: dict = Depends(require_manager_or_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog)

    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if action:
        query = query.where(AuditLog.action == action)
    if resource:
        query = query.where(AuditLog.resource == resource)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size).order_by(
        AuditLog.created_at.desc()
    )
    result = await db.execute(query)
    logs = result.scalars().all()

    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(log) for log in logs],
        total=total,
        page=page,
        page_size=page_size,
    )
