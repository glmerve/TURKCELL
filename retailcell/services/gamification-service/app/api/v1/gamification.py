"""
RetailCell Gamification Service - Leaderboard, Badges, Profile Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.db.models import Badge, UserBadge, PointTransaction, LeaderboardEntry

router = APIRouter(prefix="/gamification", tags=["🏆 Gamification"])


# ---- Schemas ----
class BadgeResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: str
    category: str
    icon_url: Optional[str] = None
    points: int
    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    id: str
    user_id: str
    total_points: int
    badge_count: int
    rank: Optional[int] = None
    region: Optional[str] = None
    model_config = {"from_attributes": True}


class PointTransactionResponse(BaseModel):
    id: str
    user_id: str
    points: int
    reason: str
    reference_id: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class GamificationProfile(BaseModel):
    user_id: str
    total_points: int
    badge_count: int
    rank: Optional[int] = None
    badges: list[BadgeResponse]
    recent_points: list[PointTransactionResponse]


class AwardPointsRequest(BaseModel):
    user_id: str
    points: int
    reason: str
    reference_id: Optional[str] = None


class AwardBadgeRequest(BaseModel):
    user_id: str
    badge_id: str


# ---- Endpoints ----
@router.get("/leaderboard", response_model=list[LeaderboardResponse], summary="Liderlik Tablosu")
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    region: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(LeaderboardEntry).order_by(LeaderboardEntry.total_points.desc())
    if region:
        query = query.where(LeaderboardEntry.region == region)
    query = query.limit(limit)
    result = await db.execute(query)
    entries = result.scalars().all()

    # Auto-assign ranks
    response = []
    for i, entry in enumerate(entries, 1):
        resp = LeaderboardResponse.model_validate(entry)
        resp.rank = i
        response.append(resp)

    return response


@router.get("/badges/catalog", response_model=list[BadgeResponse], summary="Rozet Kataloğu")
async def get_badge_catalog(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Badge).order_by(Badge.category))
    return [BadgeResponse.model_validate(b) for b in result.scalars().all()]


@router.get("/profiles/{user_id}", response_model=GamificationProfile, summary="Kullanıcı Oyunlaştırma Profili")
async def get_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    # Get leaderboard entry
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == user_id))
    lb = lb_result.scalar_one_or_none()

    # Get badges
    badge_result = await db.execute(
        select(Badge).join(UserBadge, UserBadge.badge_id == Badge.id).where(UserBadge.user_id == user_id)
    )
    badges = [BadgeResponse.model_validate(b) for b in badge_result.scalars().all()]

    # Get recent points
    points_result = await db.execute(
        select(PointTransaction).where(PointTransaction.user_id == user_id)
        .order_by(PointTransaction.created_at.desc()).limit(10)
    )
    recent_points = [PointTransactionResponse.model_validate(p) for p in points_result.scalars().all()]

    return GamificationProfile(
        user_id=user_id,
        total_points=lb.total_points if lb else 0,
        badge_count=lb.badge_count if lb else 0,
        rank=lb.rank if lb else None,
        badges=badges,
        recent_points=recent_points,
    )


@router.post("/points/award", summary="Puan Ver")
async def award_points(request: AwardPointsRequest, db: AsyncSession = Depends(get_db)):
    # Create point transaction
    pt = PointTransaction(
        user_id=request.user_id,
        points=request.points,
        reason=request.reason,
        reference_id=request.reference_id,
    )
    db.add(pt)

    # Update leaderboard
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == request.user_id))
    lb = lb_result.scalar_one_or_none()
    if lb:
        lb.total_points += request.points
    else:
        lb = LeaderboardEntry(user_id=request.user_id, total_points=request.points)
        db.add(lb)

    await db.flush()
    return {"message": f"{request.points} puan verildi.", "total_points": lb.total_points}


@router.post("/badges/award", summary="Rozet Ver")
async def award_badge(request: AwardBadgeRequest, db: AsyncSession = Depends(get_db)):
    # Check badge exists
    badge_result = await db.execute(select(Badge).where(Badge.id == request.badge_id))
    badge = badge_result.scalar_one_or_none()
    if not badge:
        raise HTTPException(status_code=404, detail="Rozet bulunamadı.")

    # Check if already earned
    existing = await db.execute(
        select(UserBadge).where(UserBadge.user_id == request.user_id, UserBadge.badge_id == request.badge_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu rozet zaten kazanılmış.")

    # Award badge
    ub = UserBadge(user_id=request.user_id, badge_id=request.badge_id)
    db.add(ub)

    # Update leaderboard badge count
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == request.user_id))
    lb = lb_result.scalar_one_or_none()
    if lb:
        lb.badge_count += 1
        lb.total_points += badge.points
    else:
        lb = LeaderboardEntry(user_id=request.user_id, total_points=badge.points, badge_count=1)
        db.add(lb)

    await db.flush()
    return {"message": f"'{badge.display_name}' rozeti verildi.", "points_earned": badge.points}
