from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models.user import User
from ..models.period import PeriodRecord
from ..schemas.period import PeriodCreate, PeriodResponse, PeriodUpdate
from ..core.security import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[PeriodResponse])
async def get_period_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get period history for current user
    """
    query = db.query(PeriodRecord).filter(PeriodRecord.user_id == current_user.id)
    
    if start_date:
        query = query.filter(PeriodRecord.start_date >= start_date)
    if end_date:
        query = query.filter(PeriodRecord.start_date <= end_date)
    
    periods = query.order_by(PeriodRecord.start_date.desc()).offset(skip).limit(limit).all()
    return periods


@router.post("/", response_model=PeriodResponse, status_code=status.HTTP_201_CREATED)
async def create_period_record(
    period_data: PeriodCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new period record
    """
    # Check if period record already exists for this start date
    existing_period = db.query(PeriodRecord).filter(
        PeriodRecord.user_id == current_user.id,
        PeriodRecord.start_date == period_data.start_date
    ).first()
    
    if existing_period:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Period record already exists for this start date"
        )
    
    # Create period record
    db_period = PeriodRecord(
        user_id=current_user.id,
        **period_data.dict()
    )
    
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    
    return db_period


@router.get("/{period_id}", response_model=PeriodResponse)
async def get_period_record(
    period_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific period record
    """
    period = db.query(PeriodRecord).filter(
        PeriodRecord.id == period_id,
        PeriodRecord.user_id == current_user.id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Period record not found"
        )
    
    return period


@router.put("/{period_id}", response_model=PeriodResponse)
async def update_period_record(
    period_id: int,
    period_data: PeriodUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a period record
    """
    period = db.query(PeriodRecord).filter(
        PeriodRecord.id == period_id,
        PeriodRecord.user_id == current_user.id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Period record not found"
        )
    
    # Check if new start date conflicts with existing records
    if period_data.start_date and period_data.start_date != period.start_date:
        existing_period = db.query(PeriodRecord).filter(
            PeriodRecord.user_id == current_user.id,
            PeriodRecord.start_date == period_data.start_date,
            PeriodRecord.id != period_id
        ).first()
        
        if existing_period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Period record already exists for this start date"
            )
    
    # Update period fields
    for field, value in period_data.dict(exclude_unset=True).items():
        setattr(period, field, value)
    
    db.commit()
    db.refresh(period)
    
    return period


@router.delete("/{period_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_period_record(
    period_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a period record
    """
    period = db.query(PeriodRecord).filter(
        PeriodRecord.id == period_id,
        PeriodRecord.user_id == current_user.id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Period record not found"
        )
    
    db.delete(period)
    db.commit()
    
    return None
