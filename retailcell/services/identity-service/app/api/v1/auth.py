"""
RetailCell Identity Service - Auth Endpoints
POST /login, POST /register, POST /refresh, POST /logout
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, AuditLog
from app.db.redis_client import blacklist_token, is_token_blacklisted
from app.core.security import (
    create_access_token, create_refresh_token, verify_token, get_current_user
)
from app.core.password import hash_password, verify_password
from app.core.config import get_settings
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshRequest, LogoutRequest,
    RegisterRequest, UserBrief
)

router = APIRouter(prefix="/auth", tags=["🔐 Kimlik Doğrulama"])
settings = get_settings()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Kullanıcı Girişi",
    description="E-posta ve şifre ile giriş yaparak JWT token alın.",
)
async def login(request: LoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı.",
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız aktif değil. Yöneticinize başvurun.",
        )

    # Create tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="LOGIN",
        resource="auth",
        ip_address=req.client.host if req.client else None,
        user_agent=req.headers.get("user-agent"),
    )
    db.add(audit)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserBrief(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role.value if hasattr(user.role, 'value') else user.role,
            avatar_url=user.avatar_url,
        ),
    )


@router.post(
    "/register",
    response_model=UserBrief,
    status_code=status.HTTP_201_CREATED,
    summary="Kullanıcı Kayıt",
    description="Yeni kullanıcı hesabı oluşturun.",
)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing
    result = await db.execute(
        select(User).where((User.email == request.email) | (User.username == request.username))
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta veya kullanıcı adı zaten kullanılıyor.",
        )

    # Create user
    user = User(
        email=request.email,
        username=request.username,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        phone=request.phone,
        region=request.region,
        role="DEALER",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return UserBrief(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        avatar_url=user.avatar_url,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Token Yenileme",
    description="Refresh token kullanarak yeni access token alın.",
)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # Verify refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")

    # Check blacklist
    if await is_token_blacklisted(request.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz kılınmış.",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı veya aktif değil.",
        )

    # Create new tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
    }
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    # Blacklist old refresh token
    await blacklist_token(request.refresh_token, expires_in=7 * 24 * 3600)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserBrief(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role.value if hasattr(user.role, 'value') else user.role,
            avatar_url=user.avatar_url,
        ),
    )


@router.post(
    "/logout",
    summary="Çıkış Yap",
    description="Access ve refresh token'ları geçersiz kılın.",
)
async def logout(
    request: LogoutRequest,
    req: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Blacklist refresh token if provided
    if request.refresh_token:
        await blacklist_token(request.refresh_token, expires_in=7 * 24 * 3600)

    # Audit log
    audit = AuditLog(
        user_id=current_user["user_id"],
        action="LOGOUT",
        resource="auth",
        ip_address=req.client.host if req.client else None,
    )
    db.add(audit)

    return {"message": "Başarıyla çıkış yapıldı."}


@router.get(
    "/me",
    response_model=UserBrief,
    summary="Mevcut Kullanıcı",
    description="JWT token'dan mevcut kullanıcı bilgilerini alın.",
)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    return UserBrief(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        avatar_url=user.avatar_url,
    )
