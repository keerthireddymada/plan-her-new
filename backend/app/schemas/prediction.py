from pydantic import BaseModel
from typing import Optional


class PredictionResponse(BaseModel):
    day_of_cycle: int
    cycle_phase: str
    predicted_energy_level: str  # "low", "medium", "high"
    predicted_mood: Optional[str] = None
    predicted_symptoms: Optional[list[str]] = None
    confidence_score: Optional[float] = None
    next_period_in_days: Optional[int] = None