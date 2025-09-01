from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from ..database import get_db
from ..models.user import User
from ..models.mood import DailyMood
from ..schemas.prediction import PredictionResponse
from ..schemas.planner import SevenDayPlanResponse
from ..core.security import get_current_active_user
from ..core.simple_predictor import SimplePredictor
from ..core.ml_model import make_prediction, train_model, save_model, should_retrain_model
from ..core.mood_predictor_ml import make_mood_prediction
from ..core.symptom_predictor_ml import make_symptom_prediction
from ..core.seven_day_planner import generate_7_day_plan
from ..core.mathematical_predictor import get_mathematical_prediction
from ..core.cycle_calculator import get_cycle_statistics, calculate_day_of_cycle, calculate_days_until_next_period, calculate_cycle_phase

router = APIRouter()


@router.get("/current", response_model=PredictionResponse)
async def get_current_prediction(
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current prediction for today or specified date.
    Tries to use the ML models first, and falls back to the mathematical predictor if they fail.
    """
    if target_date is None:
        target_date = date.today()

    try:
        # 1. Get energy prediction from the primary ML model
        energy_prediction = make_prediction(current_user.id, target_date, db)

        # 2. Get mood prediction from the mood ML model
        predicted_mood = None
        try:
            mood_prediction = make_mood_prediction(current_user.id, target_date, db)
            predicted_mood = mood_prediction.get("predicted_mood")
        except ValueError:
            pass

        # 3. Get symptom prediction from the symptom ML model
        predicted_symptoms = []
        try:
            symptom_prediction = make_symptom_prediction(current_user.id, target_date, db)
            predicted_symptoms = symptom_prediction.get("predicted_symptoms", [])
        except ValueError:
            pass

        # 4. Combine predictions
        final_prediction = {
            **energy_prediction,
            "predicted_mood": predicted_mood,
            "predicted_symptoms": predicted_symptoms,
        }
        
        return PredictionResponse(**final_prediction)

    except ValueError:
        # If any ML model fails (e.g., not enough data), fall back to mathematical predictor
        try:
            prediction = get_mathematical_prediction(current_user.id, target_date, db)
            return PredictionResponse(**prediction)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

@router.post("/retrain")
async def retrain_all_models(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrain all ML models for the current user.
    """
    results = {}
    # Energy Model
    try:
        energy_model, energy_accuracy = train_model(current_user.id, db)
        save_model(current_user.id, energy_model, energy_accuracy, db)
        results["energy_model"] = f"Trained with accuracy: {energy_accuracy:.2f}"
    except ValueError as e:
        results["energy_model"] = f"Training failed: {e}"

    # Mood Model
    try:
        from ..core.mood_predictor_ml import train_mood_model, save_mood_model
        mood_model_data = train_mood_model(current_user.id, db)
        if mood_model_data:
            mood_model, mood_accuracy = mood_model_data
            save_mood_model(current_user.id, mood_model, mood_accuracy, db)
            results["mood_model"] = f"Trained with accuracy: {mood_accuracy:.2f}"
        else:
            results["mood_model"] = "Not enough data to train."
    except ValueError as e:
        results["mood_model"] = f"Training failed: {e}"

    # Symptom Model
    try:
        from ..core.symptom_predictor_ml import train_symptom_model, save_symptom_model
        symptom_model_data = train_symptom_model(current_user.id, db)
        if symptom_model_data:
            symptom_model, symptom_accuracy, mlb = symptom_model_data
            save_symptom_model(current_user.id, symptom_model, mlb, symptom_accuracy, db)
            results["symptom_model"] = f"Trained with accuracy: {symptom_accuracy:.2f}"
        else:
            results["symptom_model"] = "Not enough data to train."
    except ValueError as e:
        results["symptom_model"] = f"Training failed: {e}"

    return {"message": "Retraining process completed.", "results": results}


@router.get("/history")
async def get_prediction_history(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get prediction history for a date range
    """
    if start_date is None:
        start_date = date.today() - timedelta(days=30)
    if end_date is None:
        end_date = date.today()
    
    predictions = []
    current_date = start_date
    
    while current_date <= end_date:
        try:
            # Get energy prediction
            energy_prediction = make_prediction(current_user.id, current_date, db)
            
            # Get mood prediction
            predicted_mood = None
            try:
                mood_prediction = make_mood_prediction(current_user.id, current_date, db)
                predicted_mood = mood_prediction.get("predicted_mood")
            except ValueError:
                pass

            # Get symptom prediction
            predicted_symptoms = []
            try:
                symptom_prediction = make_symptom_prediction(current_user.id, current_date, db)
                predicted_symptoms = symptom_prediction.get("predicted_symptoms", [])
            except ValueError:
                pass

            # Combine all predictions for the day
            daily_prediction = {
                "date": current_date.isoformat(),
                **energy_prediction,
                "predicted_mood": predicted_mood,
                "predicted_symptoms": predicted_symptoms,
            }
            predictions.append(daily_prediction)
        except Exception:
            # Skip dates where prediction fails
            pass
        
        current_date += timedelta(days=1)
    
    return {
        "predictions": predictions,
        "total_predictions": len(predictions)
    }


@router.get("/model-status")
async def get_model_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current model status and statistics for all models.
    """
    from ..models.model import UserModel
    
    def get_status(model_type: str):
        model = db.query(UserModel).filter(
            UserModel.user_id == current_user.id,
            UserModel.model_type == model_type
        ).order_by(UserModel.created_at.desc()).first()
        return {
            "has_model": model is not None,
            "model_accuracy": model.accuracy_score if model else None,
            "model_created_at": model.created_at if model else None,
        }

    return {
        "energy_model_status": get_status("energy"),
        "mood_model_status": get_status("mood"),
        "symptom_model_status": get_status("symptom"),
    }

@router.get("/7-day-plan", response_model=SevenDayPlanResponse)
async def get_7_day_plan(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate a 7-day plan with daily recommendations.
    """
    try:
        plan = generate_7_day_plan(current_user.id, db)
        return SevenDayPlanResponse(plan=plan)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate 7-day plan: {e}"
        )