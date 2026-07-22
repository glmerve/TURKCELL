"""
RetailCell Inventory Service - ORM Models
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    String, Integer, DateTime, JSON, Enum, Index, Text, Boolean, Numeric, ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import enum


class ProductCategory(str, enum.Enum):
    PHONE = "PHONE"
    TABLET = "TABLET"
    ACCESSORY = "ACCESSORY"
    SIM_CARD = "SIM_CARD"
    MODEM = "MODEM"
    SMART_WATCH = "SMART_WATCH"
    OTHER = "OTHER"


class StockStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    DISCONTINUED = "DISCONTINUED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SupplyRequestStatus(str, enum.Enum):
    CREATED = "CREATED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PriorityLevel(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class CaseStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10)
    reorder_quantity: Mapped[int] = mapped_column(Integer, default=50)
    status: Mapped[StockStatus] = mapped_column(Enum(StockStatus), default=StockStatus.IN_STOCK)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.LOW)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    dealer_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    supply_request_items: Mapped[list["SupplyRequestItem"]] = relationship(back_populates="product")


class SupplyRequest(Base):
    __tablename__ = "supply_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    requester_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[SupplyRequestStatus] = mapped_column(Enum(SupplyRequestStatus), default=SupplyRequestStatus.CREATED)
    priority: Mapped[PriorityLevel] = mapped_column(Enum(PriorityLevel), default=PriorityLevel.P2)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    dealer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sla_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sla_breached: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items: Mapped[list["SupplyRequestItem"]] = relationship(back_populates="supply_request", cascade="all, delete-orphan")
    cases: Mapped[list["Case"]] = relationship(back_populates="supply_request")


class SupplyRequestItem(Base):
    __tablename__ = "supply_request_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supply_request_id: Mapped[str] = mapped_column(String(36), ForeignKey("supply_requests.id", ondelete="CASCADE"))
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    supply_request: Mapped["SupplyRequest"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="supply_request_items")


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    supply_request_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("supply_requests.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[CaseStatus] = mapped_column(Enum(CaseStatus), default=CaseStatus.OPEN)
    priority: Mapped[PriorityLevel] = mapped_column(Enum(PriorityLevel), default=PriorityLevel.P2)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(36), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    supply_request: Mapped["SupplyRequest | None"] = relationship(back_populates="cases")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id: Mapped[str] = mapped_column(String(36), nullable=False)
    receiver_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
