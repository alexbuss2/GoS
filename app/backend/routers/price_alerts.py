import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.price_alerts import Price_alertsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/price_alerts", tags=["price_alerts"])


# ---------- Pydantic Schemas ----------
class Price_alertsData(BaseModel):
    """Entity data schema (for create/update)"""
    asset_name: str
    asset_category: str = None
    target_price: float
    condition: str
    currency: str
    is_active: bool = None
    is_triggered: bool = None
    triggered_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class Price_alertsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    asset_name: Optional[str] = None
    asset_category: Optional[str] = None
    target_price: Optional[float] = None
    condition: Optional[str] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None
    is_triggered: Optional[bool] = None
    triggered_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class Price_alertsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    asset_name: str
    asset_category: Optional[str] = None
    target_price: float
    condition: str
    currency: str
    is_active: Optional[bool] = None
    is_triggered: Optional[bool] = None
    triggered_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Price_alertsListResponse(BaseModel):
    """List response schema"""
    items: List[Price_alertsResponse]
    total: int
    skip: int
    limit: int


class Price_alertsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Price_alertsData]


class Price_alertsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Price_alertsUpdateData


class Price_alertsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Price_alertsBatchUpdateItem]


class Price_alertsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Price_alertsListResponse)
async def query_price_alertss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query price_alertss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying price_alertss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Price_alertsService(db)
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
        logger.debug(f"Found {result['total']} price_alertss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying price_alertss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Price_alertsListResponse)
async def query_price_alertss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query price_alertss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying price_alertss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Price_alertsService(db)
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
        logger.debug(f"Found {result['total']} price_alertss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying price_alertss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Price_alertsResponse)
async def get_price_alerts(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single price_alerts by ID (user can only see their own records)"""
    logger.debug(f"Fetching price_alerts with id: {id}, fields={fields}")
    
    service = Price_alertsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Price_alerts with id {id} not found")
            raise HTTPException(status_code=404, detail="Price_alerts not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching price_alerts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Price_alertsResponse, status_code=201)
async def create_price_alerts(
    data: Price_alertsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new price_alerts"""
    logger.debug(f"Creating new price_alerts with data: {data}")
    
    service = Price_alertsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create price_alerts")
        
        logger.info(f"Price_alerts created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating price_alerts: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating price_alerts: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Price_alertsResponse], status_code=201)
async def create_price_alertss_batch(
    request: Price_alertsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple price_alertss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} price_alertss")
    
    service = Price_alertsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} price_alertss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Price_alertsResponse])
async def update_price_alertss_batch(
    request: Price_alertsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple price_alertss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} price_alertss")
    
    service = Price_alertsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} price_alertss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Price_alertsResponse)
async def update_price_alerts(
    id: int,
    data: Price_alertsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing price_alerts (requires ownership)"""
    logger.debug(f"Updating price_alerts {id} with data: {data}")

    service = Price_alertsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Price_alerts with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Price_alerts not found")
        
        logger.info(f"Price_alerts {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating price_alerts {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating price_alerts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_price_alertss_batch(
    request: Price_alertsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple price_alertss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} price_alertss")
    
    service = Price_alertsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} price_alertss successfully")
        return {"message": f"Successfully deleted {deleted_count} price_alertss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_price_alerts(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single price_alerts by ID (requires ownership)"""
    logger.debug(f"Deleting price_alerts with id: {id}")
    
    service = Price_alertsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Price_alerts with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Price_alerts not found")
        
        logger.info(f"Price_alerts {id} deleted successfully")
        return {"message": "Price_alerts deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting price_alerts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")