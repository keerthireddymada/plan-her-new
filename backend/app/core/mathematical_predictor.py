from datetime import date, timedelta
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ..models.profile import UserProfile
from ..models.mood import DailyMood
from ..models.period import PeriodRecord
from ..core.cycle_calculator import calculate_day_of_cycle, calculate_cycle_phase

# --- Mathematical Fallback Predictors --- #

def get_default_energy_prediction(day_of_cycle: int, cycle_length: int, luteal_length: int) -> str:
    """
    Provides a default energy prediction based on cycle phase.
    """
    cycle_phase = calculate_cycle_phase(day_of_cycle, cycle_length, luteal_length)
    if cycle_phase == "Menses":
        return "low"
    elif cycle_phase == "Follicular":
        return "high"
    elif cycle_phase == "Luteal":
        return "medium"
    else:
        return "medium" # Default for 'Next Cycle' or unknown

def get_default_mood_prediction(day_of_cycle: int, cycle_length: int, luteal_length: int) -> str:
    """
    Provides a default mood prediction based on cycle phase.
    """
    cycle_phase = calculate_cycle_phase(day_of_cycle, cycle_length, luteal_length)
    if cycle_phase == "Menses":
        return "Sad"
    elif cycle_phase == "Follicular":
        return "Happy"
    elif cycle_phase == "Luteal":
        return "Calm"
    else:
        return "Calm"

def get_default_symptom_prediction(day_of_cycle: int, cycle_length: int, luteal_length: int) -> List[str]:
    """
    Provides default symptom predictions based on cycle phase.
    """
    cycle_phase = calculate_cycle_phase(day_of_cycle, cycle_length, luteal_length)
    symptoms = []
    if cycle_phase == "Menses":
        symptoms.extend(["Bleeding", "Cramps", "Fatigue"])
    elif cycle_phase == "Follicular":
        # Generally fewer symptoms
        pass
    elif cycle_phase == "Luteal":
        symptoms.extend(["Bloating", "Mood swings"])
    return symptoms


def get_mathematical_prediction(user_id: int, target_date: date, db: Session) -> Dict[str, Any]:
    """
    Provides a comprehensive mathematical prediction as a fallback.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found for mathematical prediction.")

    day_of_cycle = calculate_day_of_cycle(user_id, target_date, db)
    cycle_phase = calculate_cycle_phase(day_of_cycle, profile.cycle_length, profile.luteal_length)

    predicted_energy_level = get_default_energy_prediction(day_of_cycle, profile.cycle_length, profile.luteal_length)
    predicted_mood = get_default_mood_prediction(day_of_cycle, profile.cycle_length, profile.luteal_length)
    predicted_symptoms = get_default_symptom_prediction(day_of_cycle, profile.cycle_length, profile.luteal_length)

    # Next period prediction is already handled by the statistical model in cycle_calculator
    from ..core.cycle_calculator import calculate_days_until_next_period
    days_until_next = None
    try:
        days_until_next = calculate_days_until_next_period(user_id, db)
    except ValueError:
        pass # No period records yet

    return {
        "day_of_cycle": day_of_cycle,
        "cycle_phase": cycle_phase,
        "predicted_energy_level": predicted_energy_level,
        "predicted_mood": predicted_mood,
        "predicted_symptoms": predicted_symptoms,
        "next_period_in_days": days_until_next,
        "confidence_score": 0.5 # Default confidence for mathematical model
    }
