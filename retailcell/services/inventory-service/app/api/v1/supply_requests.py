"""
RetailCell Inventory Service - Supply Request Endpoints
"""
import random
import string
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.db.models import SupplyRequest, SupplyRequestItem
from app.schemas.schemas import (
    SupplyRequestCreate, SupplyRequestResponse, SupplyRequestListResponse,
    SupplyRequestStatusUpdate, SupplyRequestItemResponse
)
from app.services.sla_calculator import calculate_sla_deadline
from app.services.state_machine import validate_transition, get_next_states

router = APIRouter(prefix="/supply-requests", tags=["📋 Tedarik Talepleri"])


def generate_request_number() -> str:
    suffix = ''.join(random.choices(string.digits, k=6))
    return f"SR-{suffix}"


@router.get("/", response_model=SupplyRequestListResponse, summary="Tedarik Talepleri Listesi")
async def list_supply_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    priority: str | None = None,
    region: str | None = None,
    requester_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(SupplyRequest)
    if status:
        query = query.where(SupplyRequest.status == status)
    if priority:
        query = query.where(SupplyRequest.priority == priority)
    if region:
        query = query.where(SupplyRequest.region == region)
    if requester_id:
        query = query.where(SupplyRequest.requester_id == requester_id)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size).order_by(SupplyRequest.created_at.desc())
    requests = (await db.execute(query)).scalars().all()

    return SupplyRequestListResponse(
        items=[SupplyRequestResponse.model_validate(r) for r in requests],
        total=total, page=page, page_size=page_size,
    )


@router.get("/{request_id}", response_model=SupplyRequestResponse, summary="Talep Detayı")
async def get_supply_request(request_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupplyRequest).where(SupplyRequest.id == request_id))
    sr = result.scalar_one_or_none()
    if not sr:
        raise HTTPException(status_code=404, detail="Tedarik talebi bulunamadı.")
    return SupplyRequestResponse.model_validate(sr)


@router.post("/", response_model=SupplyRequestResponse, status_code=201, summary="Yeni Talep Oluştur")
async def create_supply_request(
    request: SupplyRequestCreate,
    requester_id: str = Query(..., description="Talep eden kullanıcı ID"),
    db: AsyncSession = Depends(get_db),
):
    sla_deadline = calculate_sla_deadline(request.priority)

    sr = SupplyRequest(
        request_number=generate_request_number(),
        requester_id=requester_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        region=request.region,
        dealer_name=request.dealer_name,
        sla_deadline=sla_deadline,
        status="CREATED",
    )
    db.add(sr)
    await db.flush()

    # Add items
    for item_data in request.items:
        item = SupplyRequestItem(
            supply_request_id=sr.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )
        db.add(item)

    await db.flush()
    await db.refresh(sr)
    return SupplyRequestResponse.model_validate(sr)


@router.patch("/{request_id}/status", response_model=SupplyRequestResponse, summary="Talep Durumu Güncelle")
async def update_supply_request_status(
    request_id: str,
    request: SupplyRequestStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SupplyRequest).where(SupplyRequest.id == request_id))
    sr = result.scalar_one_or_none()
    if not sr:
        raise HTTPException(status_code=404, detail="Tedarik talebi bulunamadı.")

    # Validate state transition
    current = sr.status.value if hasattr(sr.status, 'value') else sr.status
    validate_transition(current, request.status)

    sr.status = request.status
    if request.notes:
        sr.notes = request.notes

    now = datetime.now(timezone.utc)
    if request.status == "APPROVED":
        sr.approved_at = now
    elif request.status == "SHIPPED":
        sr.shipped_at = now
    elif request.status == "DELIVERED":
        sr.delivered_at = now

    await db.flush()
    await db.refresh(sr)
    return SupplyRequestResponse.model_validate(sr)


@router.get("/{request_id}/transitions", summary="İzin Verilen Durum Geçişleri")
async def get_transitions(request_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupplyRequest).where(SupplyRequest.id == request_id))
    sr = result.scalar_one_or_none()
    if not sr:
        raise HTTPException(status_code=404, detail="Tedarik talebi bulunamadı.")

    current = sr.status.value if hasattr(sr.status, 'value') else sr.status
    return {"current_status": current, "next_states": get_next_states(current)}
