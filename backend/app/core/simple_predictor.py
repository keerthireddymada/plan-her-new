from datetime import date
from sqlalchemy.orm import Session
from ..models.profile import UserProfile
from ..core.cycle_calculator import (
    calculate_day_of_cycle,
    calculate_cycle_phase,
    calculate_days_until_next_period,
)


class SimplePredictor:
    @staticmethod
    def get_prediction(user_id: int, target_date: date, db: Session) -> dict:
        """
        Get complete prediction for a user using the cycle calculator.
        """
        try:
            # Get user profile
            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
            if not profile:
                raise ValueError("User profile not found")

            # Calculate cycle day and phase
            day_of_cycle = calculate_day_of_cycle(user_id, target_date, db)
            cycle_phase = calculate_cycle_phase(
                day_of_cycle, profile.cycle_length, profile.luteal_length
            )
            
            # Simple phase-based energy level prediction
            if cycle_phase == "Menses":
                predicted_energy_level = "low"
            elif cycle_phase == "Follicular":
                predicted_energy_level = "high"
            elif cycle_phase == "Luteal":
                predicted_energy_level = "medium"
            else: # Next Cycle or other cases
                predicted_energy_level = "medium"

            # Calculate days until next period
            days_until_next = calculate_days_until_next_period(user_id, db)
            
            return {
                "day_of_cycle": day_of_cycle,
                "cycle_phase": cycle_phase,
                "predicted_energy_level": predicted_energy_level,
                "next_period_in_days": days_until_next,
                "confidence": 0.85  # Simple confidence score
            }
            
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")