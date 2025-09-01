import pandas as pd
import numpy as np
import pickle
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import cross_val_score
from ..models.user import User
from ..models.profile import UserProfile
from ..models.mood import DailyMood
from ..models.period import PeriodRecord
from ..models.model import UserModel
from ..core.cycle_calculator import calculate_day_of_cycle, calculate_cycle_phase
from ..config import settings


def compute_bmi(height_cm: int, weight_kg: float) -> float:
    """Compute BMI from height and weight"""
    # Convert to float if it's a Decimal
    if isinstance(weight_kg, Decimal):
        weight_kg = float(weight_kg)
    if isinstance(height_cm, Decimal):
        height_cm = float(height_cm)
    
    return float(weight_kg) / ((float(height_cm)/100)**2)


def prepare_training_data(user_id: int, db: Session) -> pd.DataFrame:
    """
    Prepare training data for ML model
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")
    
    # Get mood data
    moods = db.query(DailyMood).filter(
        DailyMood.user_id == user_id,
        DailyMood.day_of_cycle.isnot(None)
    ).order_by(DailyMood.date).all()
    
    if len(moods) < 3:
        raise ValueError("Not enough mood data for training (need at least 3 entries)")
    
    # Prepare data for training
    training_data = []
    for i, mood in enumerate(moods):
        if i < 3:  # Skip first 3 entries as we need lag data
            continue
            
        # Get lag data (previous 3 days)
        lag_moods = moods[i-3:i]
        
        record = {
            'day_of_cycle': int(mood.day_of_cycle),
            'Length_of_cycle': int(profile.cycle_length),
            'Length_of_Leutal_Phase': int(profile.luteal_length),
            'Length_of_menses': int(profile.menses_length),
            'number_of_peak': int(profile.number_of_peak),
            'BMI': float(compute_bmi(profile.height_cm, profile.weight_kg)),
            'Unusual_Bleeding': bool(profile.unusual_bleeding),
            'energy_level': int(mood.energy_level),
            'energy_lag_1': int(lag_moods[2].energy_level),
            'energy_lag_2': int(lag_moods[1].energy_level),
            'energy_lag_3': int(lag_moods[0].energy_level),
        }
        training_data.append(record)
    
    return pd.DataFrame(training_data)


def train_model(user_id: int, db: Session) -> tuple:
    """
    Train ML model for user
    """
    # Prepare training data
    df = prepare_training_data(user_id, db)
    
    # Define features and target
    features = [
        'Length_of_cycle', 'Length_of_Leutal_Phase', 'Length_of_menses',
        'number_of_peak', 'BMI', 'Unusual_Bleeding',
        'energy_lag_1', 'energy_lag_2', 'energy_lag_3'
    ]
    target = 'energy_level'
    
    X = df[features]
    y = df[target]
    
    # Define numeric and categorical features
    numeric_features = [
        'Length_of_cycle', 'Length_of_Leutal_Phase', 'Length_of_menses',
        'number_of_peak', 'BMI', 'energy_lag_1', 'energy_lag_2', 'energy_lag_3'
    ]
    categorical_features = ['Unusual_Bleeding']
    
    # Create preprocessor
    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric_features),
        ('cat', 'passthrough', categorical_features)
    ])
    
    # Create and train model
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=200, random_state=42))
    ])
    
    # Train model
    model.fit(X, y)
    
    # Calculate accuracy using cross-validation
    cv_scores = cross_val_score(model, X, y, cv=min(3, len(df)), scoring='accuracy')
    accuracy = cv_scores.mean()
    
    return model, accuracy


def save_model(user_id: int, model: Pipeline, accuracy: float, db: Session):
    """
    Save trained model to database
    """
    # Serialize model
    model_data = pickle.dumps(model)
    
    # Save to database
    db_model = UserModel(
        user_id=user_id,
        model_data=model_data,
        accuracy_score=accuracy,
        model_version="1.0"
    )
    
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return db_model


def load_model(user_id: int, db: Session) -> Optional[UserModel]:
    """
    Load the latest trained energy model record for user
    """
    model_record = db.query(UserModel).filter(
        UserModel.user_id == user_id,
        UserModel.model_type == "energy"
    ).order_by(UserModel.created_at.desc()).first()
    
    return model_record


def make_prediction(user_id: int, target_date: date, db: Session) -> Dict[str, Any]:
    """
    Make energy level prediction for a given date
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")
    
    # Load model
    model_record = load_model(user_id, db)
    if not model_record:
        raise ValueError("No trained model found")
    
    model = pickle.loads(model_record.model_data)

    # Calculate day of cycle
    day_of_cycle = calculate_day_of_cycle(user_id, target_date, db)
    
    # Get recent mood data for lag features
    recent_moods = db.query(DailyMood).filter(
        DailyMood.user_id == user_id,
        DailyMood.date < target_date
    ).order_by(DailyMood.date.desc()).limit(3).all()
    
    if len(recent_moods) < 3:
        raise ValueError("Not enough recent mood data for prediction")
    
    # Prepare input data
    input_data = {
        'day_of_cycle': int(day_of_cycle),
        'Length_of_cycle': int(profile.cycle_length),
        'Length_of_Leutal_Phase': int(profile.luteal_length),
        'Length_of_menses': int(profile.menses_length),
        'number_of_peak': int(profile.number_of_peak),
        'BMI': float(compute_bmi(profile.height_cm, profile.weight_kg)),
        'Unusual_Bleeding': bool(profile.unusual_bleeding),
        'energy_lag_1': int(recent_moods[0].energy_level),
        'energy_lag_2': int(recent_moods[1].energy_level),
        'energy_lag_3': int(recent_moods[2].energy_level),
    }
    
    # Make prediction
    input_df = pd.DataFrame([input_data])
    prediction = model.predict(input_df)[0]
    
    # Map prediction to energy level string
    energy_level_mapping = {0: 'low', 1: 'medium', 2: 'high'}
    predicted_energy_level = energy_level_mapping.get(prediction, 'medium')
    
    # Calculate cycle phase
    cycle_phase = calculate_cycle_phase(day_of_cycle, profile.cycle_length, profile.luteal_length)
    
    # Calculate days until next period
    days_until_next = None
    try:
        from .cycle_calculator import calculate_days_until_next_period
        days_until_next = calculate_days_until_next_period(user_id, db)
    except:
        pass
    
    return {
        "day_of_cycle": day_of_cycle,
        "cycle_phase": cycle_phase,
        "predicted_energy_level": predicted_energy_level,
        "next_period_in_days": days_until_next,
        "confidence_score": model_record.accuracy_score
    }


def should_retrain_model(user_id: int, db: Session) -> bool:
    """
    Check if model should be retrained
    """
    # Get recent mood entries
    recent_moods = db.query(DailyMood).filter(
        DailyMood.user_id == user_id
    ).order_by(DailyMood.created_at.desc()).limit(settings.ml_retrain_threshold).all()
    
    # Get latest model
    latest_model = db.query(UserModel).filter(
        UserModel.user_id == user_id
    ).order_by(UserModel.created_at.desc()).first()
    
    if not latest_model:
        return len(recent_moods) >= settings.ml_retrain_threshold
    
    # Check if enough new data since last training
    new_moods_since_training = [
        mood for mood in recent_moods 
        if mood.created_at > latest_model.created_at
    ]
    
    return len(new_moods_since_training) >= settings.ml_retrain_threshold
