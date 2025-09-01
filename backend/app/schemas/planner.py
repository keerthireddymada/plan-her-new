from pydantic import BaseModel
from typing import Optional

class DailyPlan(BaseModel):
    date: str
    predicted_energy_level: str
    predicted_mood: str
    predicted_symptoms: list[str]
    recommendation: str
    score: int

class SevenDayPlanResponse(BaseModel):
    plan: list[DailyPlan]