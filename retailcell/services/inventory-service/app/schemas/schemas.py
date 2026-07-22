"""
RetailCell Inventory Service - Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ---- Product Schemas ----

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    sku: str = Field(..., min_length=3, max_length=50)
    category: str
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    reorder_quantity: int = Field(default=50, ge=1)
    region: Optional[str] = None
    dealer_id: Optional[str] = None
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    region: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    description: Optional[str] = None
    price: Decimal
    stock_quantity: int
    reorder_level: int
    reorder_quantity: int
    status: str
    risk_level: str
    region: Optional[str] = None
    dealer_id: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int


# ---- Supply Request Schemas ----

class SupplyRequestItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0)


class SupplyRequestCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="P2")
    region: Optional[str] = None
    dealer_name: Optional[str] = None
    items: list[SupplyRequestItemCreate] = Field(default_factory=list)


class SupplyRequestStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class SupplyRequestItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: Decimal
    model_config = {"from_attributes": True}


class SupplyRequestResponse(BaseModel):
    id: str
    request_number: str
    requester_id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    region: Optional[str] = None
    dealer_name: Optional[str] = None
    sla_deadline: Optional[datetime] = None
    sla_breached: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    notes: Optional[str] = None
    items: list[SupplyRequestItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SupplyRequestListResponse(BaseModel):
    items: list[SupplyRequestResponse]
    total: int
    page: int
    page_size: int


# ---- Case Schemas ----

class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "P2"
    region: Optional[str] = None
    supply_request_id: Optional[str] = None


class CaseUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None


class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    region: Optional[str] = None
    assigned_to: Optional[str] = None
    supply_request_id: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---- Message Schemas ----

class MessageCreate(BaseModel):
    receiver_id: str
    subject: Optional[str] = None
    content: str


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    subject: Optional[str] = None
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---- Dashboard Schemas ----

class DashboardStats(BaseModel):
    total_dealers: int
    active_supply_requests: int
    critical_cases: int
    pending_approvals: int
    ai_accuracy: float
    avg_sla_days: float
    total_inventory: int
    daily_shipments: int


class RiskDistribution(BaseModel):
    normal_stock: float
    overstock_risk: float
    out_of_stock_warning: float


class PriorityDistribution(BaseModel):
    p0: int
    p1: int
    p2: int
    p3: int
