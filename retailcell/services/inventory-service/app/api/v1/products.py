"""
RetailCell Inventory Service - Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from math import ceil

from app.db.database import get_db
from app.db.models import Product
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse

router = APIRouter(prefix="/products", tags=["📦 Ürünler"])


@router.get("/", response_model=ProductListResponse, summary="Ürün Listesi")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = None,
    status: str | None = None,
    region: str | None = None,
    search: str | None = None,
    risk_level: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if status:
        query = query.where(Product.status == status)
    if region:
        query = query.where(Product.region == region)
    if risk_level:
        query = query.where(Product.risk_level == risk_level)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size).order_by(Product.updated_at.desc())
    products = (await db.execute(query)).scalars().all()

    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total, page=page, page_size=page_size,
    )


@router.get("/{product_id}", response_model=ProductResponse, summary="Ürün Detayı")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    return ProductResponse.model_validate(product)


@router.post("/", response_model=ProductResponse, status_code=201, summary="Ürün Oluştur")
async def create_product(request: ProductCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Product).where(Product.sku == request.sku))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Bu SKU zaten mevcut.")

    product = Product(**request.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse, summary="Ürün Güncelle")
async def update_product(product_id: str, request: ProductUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    # Auto-update stock status
    if product.stock_quantity == 0:
        product.status = "OUT_OF_STOCK"
    elif product.stock_quantity <= product.reorder_level:
        product.status = "LOW_STOCK"
    else:
        product.status = "IN_STOCK"

    await db.flush()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", summary="Ürün Sil")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    await db.delete(product)
    return {"message": "Ürün başarıyla silindi."}
