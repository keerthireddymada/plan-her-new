from datetime import date, timedelta
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..core.ml_model import make_prediction
from ..core.mood_predictor_ml import make_mood_prediction
from ..core.symptom_predictor_ml import make_symptom_prediction

# --- Recommendation Logic --- #

# Define weights for different factors
ENERGY_WEIGHTS = {"low": -2, "medium": 1, "high": 3}
MOOD_WEIGHTS = {"Sad": -2, "Anxious": -2, "Irritated": -1, "Calm": 1, "Happy": 2}
SYMPTOM_WEIGHTS = {
    "Bleeding": -4,
    "Cramps": -3,
    "Headache": -2,
    "Fatigue": -2,
    "Back pain": -2,
    "Nausea": -2,
    "Spotting": -1,
    "Bloating": -1,
    "Breast tenderness": -1,
    "Acne": 0,
}

# Define thresholds for recommendations
RECOMMENDATION_THRESHOLDS = {
    -10: "Rest Day: Prioritize sleep, gentle stretching, and nourishing food. Avoid demanding tasks.",
    -3: "Light Day: Focus on low-stress activities, light work, and take plenty of breaks.",
    0: "Steady Day: Good for regular tasks and balanced activities. Listen to your body.",
    3: "Productive Day: A great day for focused work, exercise, and tackling challenging tasks.",
}

def get_recommendation(score: int) -> str:
    """Get recommendation based on the final score."""
    for threshold, recommendation in sorted(RECOMMENDATION_THRESHOLDS.items()):
        if score <= threshold:
            return recommendation
    return RECOMMENDATION_THRESHOLDS[3] # Default to productive day if score is very high

def generate_7_day_plan(user_id: int, db: Session) -> List[Dict[str, Any]]:
    """
    Generates a 7-day plan by combining predictions from all ML models.
    """
    today = date.today()
    seven_day_plan = []

    for i in range(7):
        target_date = today + timedelta(days=i)
        daily_plan = {"date": target_date.isoformat()}
        total_score = 0

        # 1. Get Energy Prediction
        try:
            energy_pred = make_prediction(user_id, target_date, db)
            daily_plan["predicted_energy_level"] = energy_pred["predicted_energy_level"]
            total_score += ENERGY_WEIGHTS.get(energy_pred["predicted_energy_level"], 0)
        except ValueError:
            daily_plan["predicted_energy_level"] = "N/A"

        # 2. Get Mood Prediction
        try:
            mood_pred = make_mood_prediction(user_id, target_date, db)
            daily_plan["predicted_mood"] = mood_pred["predicted_mood"]
            total_score += MOOD_WEIGHTS.get(mood_pred["predicted_mood"], 0)
        except ValueError:
            daily_plan["predicted_mood"] = "N/A"

        # 3. Get Symptom Predictions
        try:
            symptom_pred = make_symptom_prediction(user_id, target_date, db)
            predicted_symptoms = symptom_pred["predicted_symptoms"]
            daily_plan["predicted_symptoms"] = predicted_symptoms
            for symptom in predicted_symptoms:
                total_score += SYMPTOM_WEIGHTS.get(symptom, 0)
        except ValueError:
            daily_plan["predicted_symptoms"] = []

        # 4. Generate Final Recommendation
        daily_plan["recommendation"] = get_recommendation(total_score)
        daily_plan["score"] = total_score

        seven_day_plan.append(daily_plan)

    return seven_day_plan
