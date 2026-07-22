"""
RetailCell Identity Service - User Management Endpoints
CRUD operations for user management (admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from math import ceil

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user, require_admin, require_manager_or_admin
from app.core.password import hash_password, verify_password
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserListResponse, PasswordChangeRequest
)

router = APIRouter(prefix="/users", tags=["👤 Kullanıcı Yönetimi"])


@router.get(
    "/",
    response_model=UserListResponse,
    summary="Kullanıcı Listesi",
    description="Tüm kullanıcıları sayfalı olarak listeleyin.",
)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str | None = Query(None, description="Rol filtresi"),
    status_filter: str | None = Query(None, alias="status", description="Durum filtresi"),
    search: str | None = Query(None, description="Ad veya e-posta araması"),
    region: str | None = Query(None, description="Bölge filtresi"),
    current_user: dict = Depends(require_manager_or_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if status_filter:
        query = query.where(User.status == status_filter)
    if region:
        query = query.where(User.region == region)
    if search:
        query = query.where(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size).order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()

    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 1,
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Kullanıcı Detayı",
    description="Belirtilen kullanıcının detay bilgilerini alın.",
)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return UserResponse.model_validate(user)


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Kullanıcı Oluştur",
    description="Yeni kullanıcı oluşturun (yalnızca admin).",
)
async def create_user(
    request: UserCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Check existing
    result = await db.execute(
        select(User).where((User.email == request.email) | (User.username == request.username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu e-posta veya kullanıcı adı zaten mevcut.")

    user = User(
        email=request.email,
        username=request.username,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        role=request.role,
        phone=request.phone,
        region=request.region,
        dealer_id=request.dealer_id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Kullanıcı Güncelle",
    description="Kullanıcı bilgilerini güncelleyin.",
)
async def update_user(
    user_id: str,
    request: UserUpdate,
    current_user: dict = Depends(require_manager_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete(
    "/{user_id}",
    summary="Kullanıcı Sil",
    description="Kullanıcıyı deaktive edin (yalnızca admin).",
)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    user.status = "INACTIVE"
    await db.flush()
    return {"message": "Kullanıcı başarıyla deaktive edildi."}


@router.post(
    "/change-password",
    summary="Şifre Değiştir",
    description="Mevcut şifrenizi değiştirin.",
)
async def change_password(
    request: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    if not verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı.")

    user.hashed_password = hash_password(request.new_password)
    await db.flush()
    return {"message": "Şifre başarıyla değiştirildi."}
