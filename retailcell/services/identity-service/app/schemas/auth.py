"""
RetailCell Identity Service - Auth Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


class CustomerLoginRequest(BaseModel):
    """Customer OTP Login Request"""
    gsm_number: str = Field(..., min_length=10, max_length=15, description="Format: 5321234567")
    otp: str = Field(..., min_length=4, max_length=6, description="OTP Code (1234 for simulation)")


class StaffLoginRequest(BaseModel):
    """Staff Email/Password Login Request"""
    email: EmailStr
    password: str


class CustomerRegisterRequest(BaseModel):
    """Customer Registration Request"""
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    gsm_number: str = Field(..., min_length=10, max_length=15)
    email: Optional[EmailStr] = None


class StaffRegisterRequest(BaseModel):
    """Staff Registration Request (Admin only)"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(..., description="ANALYST, EXPERT, OPERATOR, MANAGER, SUPERVISOR")
    specialties: Optional[List[str]] = Field(default_factory=list)
    region: Optional[str] = None


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token expiry in seconds")
    user: "UserBrief"


class UserBrief(BaseModel):
    """Brief user info returned with token."""
    id: str
    email: Optional[str] = None
    gsm_number: Optional[str] = None
    full_name: str
    role: str
    account_type: str
    avatar_url: Optional[str] = None


class RefreshRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Logout request."""
    refresh_token: Optional[str] = None


# Fix forward reference
TokenResponse.model_rebuild()
