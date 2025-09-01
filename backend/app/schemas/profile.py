from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ProfileBase(BaseModel):
    height_cm: int = Field(..., ge=100, le=250, description="Height in centimeters")
    weight_kg: float = Field(..., ge=30, le=200, description="Weight in kilograms")
    cycle_length: int = Field(..., ge=20, le=40, description="Average cycle length in days")
    luteal_length: int = Field(..., ge=10, le=20, description="Luteal phase length in days")
    menses_length: int = Field(..., ge=2, le=10, description="Menses length in days")
    unusual_bleeding: bool = Field(..., description="Whether user experiences unusual bleeding")
    number_of_peak: int = Field(..., ge=1, le=5, description="Number of peak days")
    period_regularity: str = Field(..., description="Period regularity: regular or irregular")
    period_description: str = Field(..., description="Period description: usual or unusual")
    medical_conditions: Optional[str] = Field(None, description="Medical conditions")
    last_period_start: date = Field(..., description="Last period start date")
    last_period_end: date = Field(..., description="Last period end date")


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    height_cm: Optional[int] = Field(None, ge=100, le=250)
    weight_kg: Optional[float] = Field(None, ge=30, le=200)
    cycle_length: Optional[int] = Field(None, ge=20, le=40)
    luteal_length: Optional[int] = Field(None, ge=10, le=20)
    menses_length: Optional[int] = Field(None, ge=2, le=10)
    unusual_bleeding: Optional[bool] = None
    number_of_peak: Optional[int] = Field(None, ge=1, le=5)
    period_regularity: Optional[str] = None
    period_description: Optional[str] = None
    medical_conditions: Optional[str] = None
    last_period_start: Optional[date] = None
    last_period_end: Optional[date] = None


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
