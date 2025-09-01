import pandas as pd
import numpy as np
import pickle
from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import cross_val_score
from ..models.user import User
from ..models.profile import UserProfile
from ..models.mood import DailyMood
from ..models.model import UserModel
from ..core.cycle_calculator import calculate_day_of_cycle
from ..core.ml_model import compute_bmi # Re-use from existing model
from ..config import settings

MOOD_LABELS = ["Happy", "Calm", "Sad", "Anxious", "Irritated"]

def prepare_mood_training_data(user_id: int, db: Session) -> Optional[pd.DataFrame]:
    """
    Prepare training data for the Mood Prediction ML model.
    Returns None if there is not enough data.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")

    moods = db.query(DailyMood).filter(
        DailyMood.user_id == user_id,
        DailyMood.day_of_cycle.isnot(None),
        DailyMood.mood.isnot(None)
    ).order_by(DailyMood.date).all()

    # Check if we have enough data (e.g., at least 30 days with mood logs)
    if len(moods) < 30:
        return None

    training_data = []
    for mood in moods:
        record = {
            'day_of_cycle': int(mood.day_of_cycle),
            'cycle_length': int(profile.cycle_length),
            'luteal_length': int(profile.luteal_length),
            'bmi': float(compute_bmi(profile.height_cm, profile.weight_kg)),
            'mood': mood.mood
        }
        training_data.append(record)
    
    return pd.DataFrame(training_data)

def train_mood_model(user_id: int, db: Session) -> Optional[tuple]:
    """
    Train the Mood Prediction ML model for a user.
    Returns None if there is not enough data.
    """
    df = prepare_mood_training_data(user_id, db)
    if df is None:
        return None

    # Encode the target variable
    df['mood_encoded'] = df['mood'].apply(lambda x: MOOD_LABELS.index(x) if x in MOOD_LABELS else -1)
    df = df[df['mood_encoded'] != -1]

    if len(df) < 30:
        return None

    features = ['day_of_cycle', 'cycle_length', 'luteal_length', 'bmi']
    target = 'mood_encoded'

    X = df[features]
    y = df[target]

    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), features)
    ])

    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])

    model.fit(X, y)

    cv_scores = cross_val_score(model, X, y, cv=min(3, len(df) // 10), scoring='accuracy')
    accuracy = cv_scores.mean()

    return model, accuracy

def save_mood_model(user_id: int, model: Pipeline, accuracy: float, db: Session):
    """
    Save the trained mood model to the database.
    """
    model_data = pickle.dumps(model)
    
    db_model = UserModel(
        user_id=user_id,
        model_type="mood",
        model_data=model_data,
        accuracy_score=accuracy,
        model_version="1.0"
    )
    
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return db_model

def load_mood_model(user_id: int, db: Session) -> Optional[UserModel]:
    """
    Load the latest trained mood model record for a user.
    """
    return db.query(UserModel).filter(
        UserModel.user_id == user_id,
        UserModel.model_type == "mood"
    ).order_by(UserModel.created_at.desc()).first()

def make_mood_prediction(user_id: int, target_date: date, db: Session) -> Dict[str, Any]:
    """
    Make a mood prediction for a given date.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")

    model_record = load_mood_model(user_id, db)
    if not model_record:
        raise ValueError("No trained mood model found for user.")

    model = pickle.loads(model_record.model_data)
    day_of_cycle = calculate_day_of_cycle(user_id, target_date, db)

    input_data = {
        'day_of_cycle': int(day_of_cycle),
        'cycle_length': int(profile.cycle_length),
        'luteal_length': int(profile.luteal_length),
        'bmi': float(compute_bmi(profile.height_cm, profile.weight_kg)),
    }

    input_df = pd.DataFrame([input_data])
    prediction_encoded = model.predict(input_df)[0]
    predicted_mood = MOOD_LABELS[prediction_encoded]

    return {
        "predicted_mood": predicted_mood,
        "confidence_score": model_record.accuracy_score
    }
