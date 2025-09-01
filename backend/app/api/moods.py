from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from ..database import get_db
from ..models.user import User
from ..models.mood import DailyMood
from ..schemas.mood import MoodCreate, MoodResponse, MoodUpdate
from ..core.security import get_current_active_user
from ..core.cycle_calculator import calculate_day_of_cycle

router = APIRouter()


@router.get("/", response_model=List[MoodResponse])
async def get_mood_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get mood history for current user
    """
    query = db.query(DailyMood).filter(DailyMood.user_id == current_user.id)
    
    if start_date:
        query = query.filter(DailyMood.date >= start_date)
    if end_date:
        query = query.filter(DailyMood.date <= end_date)
    
    moods = query.order_by(DailyMood.date.desc()).offset(skip).limit(limit).all()
    return moods


@router.post("/", response_model=MoodResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_entry(
    mood_data: MoodCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new mood entry
    """
    # Check if mood entry already exists for this date
    existing_mood = db.query(DailyMood).filter(
        DailyMood.user_id == current_user.id,
        DailyMood.date == mood_data.date
    ).first()
    
    if existing_mood:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mood entry already exists for this date"
        )
    
    # Calculate day of cycle if profile exists
    day_of_cycle = None
    try:
        day_of_cycle = calculate_day_of_cycle(current_user.id, mood_data.date, db)
    except Exception:
        # If cycle calculation fails, continue without it
        pass
    
    # Create mood entry
    db_mood = DailyMood(
        user_id=current_user.id,
        day_of_cycle=day_of_cycle,
        **mood_data.dict()
    )
    
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    
    return db_mood


@router.get("/{mood_id}", response_model=MoodResponse)
async def get_mood_entry(
    mood_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific mood entry
    """
    mood = db.query(DailyMood).filter(
        DailyMood.id == mood_id,
        DailyMood.user_id == current_user.id
    ).first()
    
    if not mood:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mood entry not found"
        )
    
    return mood


@router.put("/{mood_id}", response_model=MoodResponse)
async def update_mood_entry(
    mood_id: int,
    mood_data: MoodUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a mood entry
    """
    mood = db.query(DailyMood).filter(
        DailyMood.id == mood_id,
        DailyMood.user_id == current_user.id
    ).first()
    
    if not mood:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mood entry not found"
        )
    
    # Update mood fields
    for field, value in mood_data.dict(exclude_unset=True).items():
        setattr(mood, field, value)
    
    # Recalculate day of cycle if date changed
    if mood_data.date and mood_data.date != mood.date:
        try:
            mood.day_of_cycle = calculate_day_of_cycle(current_user.id, mood_data.date, db)
        except Exception:
            # If cycle calculation fails, continue without it
            pass
    
    db.commit()
    db.refresh(mood)
    
    return mood


@router.delete("/{mood_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mood_entry(
    mood_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a mood entry
    """
    mood = db.query(DailyMood).filter(
        DailyMood.id == mood_id,
        DailyMood.user_id == current_user.id
    ).first()
    
    if not mood:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mood entry not found"
        )
    
    db.delete(mood)
    db.commit()
    
    return None
