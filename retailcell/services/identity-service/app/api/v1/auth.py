"""
RetailCell Identity Service - Auth Endpoints
POST /auth/login/customer, POST /auth/login/staff, POST /auth/register/customer, POST /auth/register/staff
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import math

from app.db.database import get_db
from app.db.models import User, AuditLog, AccountType
from app.db.redis_client import blacklist_token, is_token_blacklisted
from app.core.security import (
    create_access_token, create_refresh_token, verify_token, get_current_user,
    verify_password, get_password_hash, enforce_password_policy, require_admin
)
from app.core.config import get_settings
from app.schemas.auth import (
    CustomerLoginRequest, StaffLoginRequest, TokenResponse, RefreshRequest, LogoutRequest,
    CustomerRegisterRequest, StaffRegisterRequest, UserBrief
)

router = APIRouter(prefix="/auth", tags=["🔐 Kimlik Doğrulama"])
settings = get_settings()

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def _check_and_update_lockout(user: User, db: AsyncSession):
    """Check if user is locked. Raise exception if true. Returns nothing if safe."""
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        remaining = (user.locked_until - datetime.now(timezone.utc)).total_seconds()
        remaining_mins = math.ceil(remaining / 60)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Hesabınız güvenlik nedeniyle kilitlenmiştir. Kalan süre: {remaining_mins} dakika.",
        )
    elif user.locked_until and user.locked_until <= datetime.now(timezone.utc):
        # Lock expired, reset
        user.failed_login_attempts = 0
        user.locked_until = None
        await db.flush()


async def _handle_failed_login(user: User, db: AsyncSession):
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
    await db.flush()


async def _handle_successful_login(user: User, db: AsyncSession, req: Request):
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    audit = AuditLog(
        user_id=user.id,
        action="LOGIN",
        resource="auth",
        ip_address=req.client.host if req.client else None,
        user_agent=req.headers.get("user-agent"),
    )
    db.add(audit)
    await db.flush()


@router.post(
    "/login/customer",
    response_model=TokenResponse,
    summary="Müşteri Girişi (GSM + OTP)",
)
async def login_customer(request: CustomerLoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.gsm_number == request.gsm_number))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GSM numarası kayıtlı değil.")

    await _check_and_update_lockout(user, db)

    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hesabınız aktif değil.")

    if request.otp != "1234":
        await _handle_failed_login(user, db)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Hatalı OTP kodu.")

    await _handle_successful_login(user, db, req)

    token_data = {
        "sub": user.id,
        "gsm_number": user.gsm_number,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "account_type": "CUSTOMER"
    }
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserBrief(
            id=user.id, full_name=user.full_name, gsm_number=user.gsm_number,
            role=user.role.value if hasattr(user.role, 'value') else user.role, account_type="CUSTOMER"
        ),
    )


@router.post(
    "/login/staff",
    response_model=TokenResponse,
    summary="Personel Girişi (E-Posta + Şifre)",
)
async def login_staff(request: StaffLoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı.")

    await _check_and_update_lockout(user, db)

    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hesabınız aktif değil.")

    if not verify_password(request.password, user.hashed_password):
        await _handle_failed_login(user, db)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı.")

    await _handle_successful_login(user, db, req)

    token_data = {
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "account_type": "STAFF"
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserBrief(
            id=user.id, email=user.email, full_name=user.full_name,
            role=user.role.value if hasattr(user.role, 'value') else user.role, account_type="STAFF",
            avatar_url=user.avatar_url
        ),
    )


@router.post(
    "/register/customer",
    response_model=UserBrief,
    status_code=status.HTTP_201_CREATED,
    summary="Müşteri/Kullanıcı Kaydı",
)
async def register_customer(request: CustomerRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.gsm_number == request.gsm_number))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu GSM numarası zaten kayıtlı.")

    user = User(
        full_name=f"{request.first_name} {request.last_name}",
        gsm_number=request.gsm_number,
        email=request.email,
        account_type=AccountType.CUSTOMER,
        role="VIEWER",
        hashed_password="NOPASSWORD_OTP_ONLY"
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return UserBrief(
        id=user.id, gsm_number=user.gsm_number, email=user.email, full_name=user.full_name,
        role="VIEWER", account_type="CUSTOMER"
    )


@router.post(
    "/register/staff",
    response_model=UserBrief,
    status_code=status.HTTP_201_CREATED,
    summary="Personel Hesabı Oluşturma (Sadece Admin)",
)
async def register_staff(
    request: StaffRegisterRequest,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu e-posta zaten kullanımda.")

    # Validate Strict Password Policy
    try:
        enforce_password_policy(request.password)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    user = User(
        email=request.email,
        username=request.email.split('@')[0],
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name,
        role=request.role,
        region=request.region,
        specialties=request.specialties,
        account_type=AccountType.STAFF
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return UserBrief(
        id=user.id, email=user.email, full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role, account_type="STAFF"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_token(request.refresh_token, token_type="refresh")
    if await is_token_blacklisted(request.refresh_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token geçersiz kılınmış.")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı aktif değil.")

    token_data = {
        "sub": user.id,
        "email": user.email,
        "gsm_number": user.gsm_number,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "account_type": user.account_type.value if hasattr(user.account_type, 'value') else user.account_type
    }
    
    await blacklist_token(request.refresh_token, expires_in=7 * 24 * 3600)

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserBrief(
            id=user.id, email=user.email, gsm_number=user.gsm_number, full_name=user.full_name,
            role=token_data["role"], account_type=token_data["account_type"]
        ),
    )


@router.post("/logout")
async def logout(
    request: LogoutRequest, req: Request,
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if request.refresh_token:
        await blacklist_token(request.refresh_token, expires_in=7 * 24 * 3600)
    
    audit = AuditLog(
        user_id=current_user["user_id"], action="LOGOUT", resource="auth",
        ip_address=req.client.host if req.client else None,
    )
    db.add(audit)
    return {"message": "Başarıyla çıkış yapıldı."}


@router.get("/me", response_model=UserBrief)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    
    return UserBrief(
        id=user.id, email=user.email, gsm_number=user.gsm_number, full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        account_type=user.account_type.value if hasattr(user.account_type, 'value') else user.account_type
    )
