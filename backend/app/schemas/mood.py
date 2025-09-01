from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class MoodBase(BaseModel):
    date: date
    energy_level: int = Field(..., ge=0, le=2)  # 0=low, 1=medium, 2=high
    mood: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None


class MoodCreate(MoodBase):
    pass


class MoodUpdate(MoodBase):
    pass


class MoodResponse(MoodBase):
    id: int
    user_id: int
    day_of_cycle: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
