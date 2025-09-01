from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PeriodBase(BaseModel):
    start_date: date
    end_date: Optional[date] = None


class PeriodCreate(PeriodBase):
    pass


class PeriodUpdate(PeriodBase):
    pass


class PeriodResponse(PeriodBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
