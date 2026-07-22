"""
RetailCell Identity Service - Auth Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

    model_config = {"json_schema_extra": {
        "example": {"email": "admin@retailcell.com", "password": "Admin123!"}
    }}


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
    email: str
    username: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None


class RefreshRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Logout request."""
    refresh_token: Optional[str] = None


class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = None
    region: Optional[str] = None

    model_config = {"json_schema_extra": {
        "example": {
            "email": "user@retailcell.com",
            "username": "newuser",
            "password": "User123!",
            "full_name": "Yeni Kullanıcı",
            "phone": "+905551234567",
            "region": "İstanbul"
        }
    }}


# Fix forward reference
TokenResponse.model_rebuild()
