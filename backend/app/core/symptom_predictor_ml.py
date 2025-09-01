import pandas as pd
import numpy as np
import pickle
from datetime import date
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import StandardScaler, MultiLabelBinarizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from ..models.profile import UserProfile
from ..models.mood import DailyMood
from ..models.model import UserModel
from ..core.cycle_calculator import calculate_day_of_cycle
from ..core.ml_model import compute_bmi

# Define the known symptoms. This must be consistent.
ALL_SYMPTOMS = [
    "Bleeding", "Spotting", "Cramps", "Headache", "Bloating",
    "Fatigue", "Breast tenderness", "Back pain", "Nausea", "Acne"
]

def prepare_symptom_training_data(user_id: int, db: Session) -> Optional[pd.DataFrame]:
    """
    Prepare training data for the Symptom Prediction ML model.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")

    moods = db.query(DailyMood).filter(
        DailyMood.user_id == user_id,
        DailyMood.day_of_cycle.isnot(None)
    ).order_by(DailyMood.date).all()

    if len(moods) < 30: # Require at least 30 data points
        return None

    training_data = []
    for mood in moods:
        # For now, we handle a single symptom string. We wrap it in a list.
        symptoms_list = [mood.symptoms] if mood.symptoms else []
        record = {
            'day_of_cycle': int(mood.day_of_cycle),
            'cycle_length': int(profile.cycle_length),
            'luteal_length': int(profile.luteal_length),
            'bmi': float(compute_bmi(profile.height_cm, profile.weight_kg)),
            'symptoms': symptoms_list
        }
        training_data.append(record)
    
    return pd.DataFrame(training_data)

def train_symptom_model(user_id: int, db: Session) -> Optional[tuple]:
    """
    Train the Symptom Prediction ML model for a user.
    """
    df = prepare_symptom_training_data(user_id, db)
    if df is None or df.empty:
        return None

    mlb = MultiLabelBinarizer(classes=ALL_SYMPTOMS)
    y = mlb.fit_transform(df['symptoms'])

    features = ['day_of_cycle', 'cycle_length', 'luteal_length', 'bmi']
    X = df[features]

    # Define the model pipeline
    numeric_features = features
    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric_features)
    ])

    # We use a RandomForestClassifier wrapped in a MultiOutputClassifier
    # to handle multi-label symptom prediction.
    base_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', MultiOutputClassifier(base_classifier))
    ])

    model.fit(X, y)

    # Accuracy for multi-label is complex. We can use subset accuracy (a strict metric).
    accuracy = model.score(X, y)

    return model, accuracy, mlb

def save_symptom_model(user_id: int, model: Pipeline, mlb: MultiLabelBinarizer, accuracy: float, db: Session):
    """
    Save the trained symptom model and its binarizer to the database.
    """
    # We need to save both the model and the binarizer
    model_and_mlb = {"model": model, "mlb": mlb}
    model_data = pickle.dumps(model_and_mlb)
    
    db_model = UserModel(
        user_id=user_id,
        model_type="symptom",
        model_data=model_data,
        accuracy_score=accuracy,
        model_version="1.0"
    )
    
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return db_model

def load_symptom_model(user_id: int, db: Session) -> Optional[Dict[str, Any]]:
    """
    Load the latest trained symptom model record for a user.
    """
    model_record = db.query(UserModel).filter(
        UserModel.user_id == user_id,
        UserModel.model_type == "symptom"
    ).order_by(UserModel.created_at.desc()).first()

    if not model_record:
        return None

    model_and_mlb = pickle.loads(model_record.model_data)
    model_and_mlb["accuracy_score"] = model_record.accuracy_score
    return model_and_mlb

def make_symptom_prediction(user_id: int, target_date: date, db: Session) -> Dict[str, Any]:
    """
    Make a symptom prediction for a given date.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")

    loaded_data = load_symptom_model(user_id, db)
    if not loaded_data:
        raise ValueError("No trained symptom model found for user.")

    model = loaded_data["model"]
    mlb = loaded_data["mlb"]

    day_of_cycle = calculate_day_of_cycle(user_id, target_date, db)

    input_data = {
        'day_of_cycle': int(day_of_cycle),
        'cycle_length': int(profile.cycle_length),
        'luteal_length': int(profile.luteal_length),
        'bmi': float(compute_bmi(profile.height_cm, profile.weight_kg)),
    }

    input_df = pd.DataFrame([input_data])
    prediction_encoded = model.predict(input_df)
    predicted_symptoms = mlb.inverse_transform(prediction_encoded)[0]

    return {
        "predicted_symptoms": list(predicted_symptoms),
        "confidence_score": loaded_data.get("accuracy_score")
    }
