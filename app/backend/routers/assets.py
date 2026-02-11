import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.assets import AssetsService
from services.market_prices import MarketPriceProvider
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/assets", tags=["assets"])


# ---------- Pydantic Schemas ----------
class AssetsData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str
    category: str
    quantity: float
    purchase_price: float
    purchase_date: Optional[datetime] = None
    current_price: float = None
    currency: str
    is_sold: bool = None
    sold_price: float = None
    sold_date: Optional[datetime] = None
    notes: str = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AssetsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[datetime] = None
    current_price: Optional[float] = None
    currency: Optional[str] = None
    is_sold: Optional[bool] = None
    sold_price: Optional[float] = None
    sold_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AssetsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    name: str
    category: str
    quantity: float
    purchase_price: float
    purchase_date: Optional[datetime] = None
    current_price: Optional[float] = None
    currency: str
    is_sold: Optional[bool] = None
    sold_price: Optional[float] = None
    sold_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssetsListResponse(BaseModel):
    """List response schema"""
    items: List[AssetsResponse]
    total: int
    skip: int
    limit: int


class AssetsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[AssetsData]


class AssetsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: AssetsUpdateData


class AssetsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[AssetsBatchUpdateItem]


class AssetsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


class RefreshPricesResponse(BaseModel):
    updated_count: int
    skipped_count: int
    errors: List[str]


# ---------- Routes ----------
@router.get("", response_model=AssetsListResponse)
async def query_assetss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query assetss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying assetss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = AssetsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} assetss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying assetss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=AssetsListResponse)
async def query_assetss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query assetss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying assetss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = AssetsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} assetss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying assetss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=AssetsResponse)
async def get_assets(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single assets by ID (user can only see their own records)"""
    logger.debug(f"Fetching assets with id: {id}, fields={fields}")
    
    service = AssetsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Assets with id {id} not found")
            raise HTTPException(status_code=404, detail="Assets not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assets {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=AssetsResponse, status_code=201)
async def create_assets(
    data: AssetsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new assets"""
    logger.debug(f"Creating new assets with data: {data}")
    
    service = AssetsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create assets")
        
        logger.info(f"Assets created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating assets: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating assets: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[AssetsResponse], status_code=201)
async def create_assetss_batch(
    request: AssetsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple assetss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} assetss")
    
    service = AssetsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} assetss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[AssetsResponse])
async def update_assetss_batch(
    request: AssetsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple assetss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} assetss")
    
    service = AssetsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} assetss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=AssetsResponse)
async def update_assets(
    id: int,
    data: AssetsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing assets (requires ownership)"""
    logger.debug(f"Updating assets {id} with data: {data}")

    service = AssetsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Assets with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Assets not found")
        
        logger.info(f"Assets {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating assets {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating assets {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_assetss_batch(
    request: AssetsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple assetss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} assetss")
    
    service = AssetsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} assetss successfully")
        return {"message": f"Successfully deleted {deleted_count} assetss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_assets(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single assets by ID (requires ownership)"""
    logger.debug(f"Deleting assets with id: {id}")
    
    service = AssetsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Assets with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Assets not found")
        
        logger.info(f"Assets {id} deleted successfully")
        return {"message": "Assets deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting assets {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/actions/refresh-prices", response_model=RefreshPricesResponse)
async def refresh_prices(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Refresh market prices for unsold assets (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can refresh prices")

    service = AssetsService(db)
    summary = await service.refresh_market_prices(provider=MarketPriceProvider())
    return RefreshPricesResponse(**summary)