"""
RetailCell Gamification Service - ORM Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, JSON, Enum, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base
import enum


class BadgeCategory(str, enum.Enum):
    SLA = "SLA"
    DELIVERY = "DELIVERY"
    STOCK = "STOCK"
    PERFORMANCE = "PERFORMANCE"
    SPECIAL = "SPECIAL"


class Badge(Base):
    __tablename__ = "badges"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[BadgeCategory] = mapped_column(Enum(BadgeCategory), nullable=False)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    criteria: Mapped[dict] = mapped_column(JSON, default={})
    points: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserBadge(Base):
    __tablename__ = "user_badges"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    badge_id: Mapped[str] = mapped_column(String(36), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PointTransaction(Base):
    __tablename__ = "point_transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    reference_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    badge_count: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
