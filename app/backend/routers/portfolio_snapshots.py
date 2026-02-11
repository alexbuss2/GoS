import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.portfolio_snapshots import Portfolio_snapshotsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/portfolio_snapshots", tags=["portfolio_snapshots"])


# ---------- Pydantic Schemas ----------
class Portfolio_snapshotsData(BaseModel):
    """Entity data schema (for create/update)"""
    total_value_try: float
    total_value_usd: float = None
    total_value_eur: float = None
    gold_value: float = None
    crypto_value: float = None
    stock_value: float = None
    currency_value: float = None
    other_value: float = None
    snapshot_date: datetime
    created_at: Optional[datetime] = None


class Portfolio_snapshotsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    total_value_try: Optional[float] = None
    total_value_usd: Optional[float] = None
    total_value_eur: Optional[float] = None
    gold_value: Optional[float] = None
    crypto_value: Optional[float] = None
    stock_value: Optional[float] = None
    currency_value: Optional[float] = None
    other_value: Optional[float] = None
    snapshot_date: Optional[datetime] = None
    created_at: Optional[datetime] = None


class Portfolio_snapshotsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    total_value_try: float
    total_value_usd: Optional[float] = None
    total_value_eur: Optional[float] = None
    gold_value: Optional[float] = None
    crypto_value: Optional[float] = None
    stock_value: Optional[float] = None
    currency_value: Optional[float] = None
    other_value: Optional[float] = None
    snapshot_date: datetime
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Portfolio_snapshotsListResponse(BaseModel):
    """List response schema"""
    items: List[Portfolio_snapshotsResponse]
    total: int
    skip: int
    limit: int


class Portfolio_snapshotsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Portfolio_snapshotsData]


class Portfolio_snapshotsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Portfolio_snapshotsUpdateData


class Portfolio_snapshotsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Portfolio_snapshotsBatchUpdateItem]


class Portfolio_snapshotsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Portfolio_snapshotsListResponse)
async def query_portfolio_snapshotss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query portfolio_snapshotss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying portfolio_snapshotss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Portfolio_snapshotsService(db)
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
        logger.debug(f"Found {result['total']} portfolio_snapshotss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying portfolio_snapshotss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Portfolio_snapshotsListResponse)
async def query_portfolio_snapshotss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query portfolio_snapshotss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying portfolio_snapshotss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Portfolio_snapshotsService(db)
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
        logger.debug(f"Found {result['total']} portfolio_snapshotss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying portfolio_snapshotss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Portfolio_snapshotsResponse)
async def get_portfolio_snapshots(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single portfolio_snapshots by ID (user can only see their own records)"""
    logger.debug(f"Fetching portfolio_snapshots with id: {id}, fields={fields}")
    
    service = Portfolio_snapshotsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Portfolio_snapshots with id {id} not found")
            raise HTTPException(status_code=404, detail="Portfolio_snapshots not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio_snapshots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Portfolio_snapshotsResponse, status_code=201)
async def create_portfolio_snapshots(
    data: Portfolio_snapshotsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new portfolio_snapshots"""
    logger.debug(f"Creating new portfolio_snapshots with data: {data}")
    
    service = Portfolio_snapshotsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create portfolio_snapshots")
        
        logger.info(f"Portfolio_snapshots created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating portfolio_snapshots: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating portfolio_snapshots: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Portfolio_snapshotsResponse], status_code=201)
async def create_portfolio_snapshotss_batch(
    request: Portfolio_snapshotsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple portfolio_snapshotss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} portfolio_snapshotss")
    
    service = Portfolio_snapshotsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} portfolio_snapshotss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Portfolio_snapshotsResponse])
async def update_portfolio_snapshotss_batch(
    request: Portfolio_snapshotsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple portfolio_snapshotss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} portfolio_snapshotss")
    
    service = Portfolio_snapshotsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} portfolio_snapshotss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Portfolio_snapshotsResponse)
async def update_portfolio_snapshots(
    id: int,
    data: Portfolio_snapshotsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing portfolio_snapshots (requires ownership)"""
    logger.debug(f"Updating portfolio_snapshots {id} with data: {data}")

    service = Portfolio_snapshotsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Portfolio_snapshots with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Portfolio_snapshots not found")
        
        logger.info(f"Portfolio_snapshots {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating portfolio_snapshots {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating portfolio_snapshots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_portfolio_snapshotss_batch(
    request: Portfolio_snapshotsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple portfolio_snapshotss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} portfolio_snapshotss")
    
    service = Portfolio_snapshotsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} portfolio_snapshotss successfully")
        return {"message": f"Successfully deleted {deleted_count} portfolio_snapshotss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_portfolio_snapshots(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single portfolio_snapshots by ID (requires ownership)"""
    logger.debug(f"Deleting portfolio_snapshots with id: {id}")
    
    service = Portfolio_snapshotsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Portfolio_snapshots with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Portfolio_snapshots not found")
        
        logger.info(f"Portfolio_snapshots {id} deleted successfully")
        return {"message": "Portfolio_snapshots deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting portfolio_snapshots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")