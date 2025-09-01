# PlanHer API Endpoints & Frontend-Backend Flow Documentation

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Profile Management Endpoints](#profile-management-endpoints)
4. [Period Tracking Endpoints](#period-tracking-endpoints)
5. [Mood Tracking Endpoints](#mood-tracking-endpoints)
6. [Predictions & ML Endpoints](#predictions--ml-endpoints)
7. [Frontend Flow & File Structure](#frontend-flow--file-structure)

---

## Authentication Endpoints

### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Backend File**: `backend/app/api/auth.py`
- **Frontend File**: `frontend/src/screens/signup.jsx`
- **Input Type**: 
  ```json
  {
    "email": "string",
    "password": "string", 
    "name": "string"
  }
  ```
- **Return Type**: 
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "id": "integer",
      "email": "string",
      "name": "string",
      "created_at": "datetime"
    }
  }
  ```
- **Flow**: 
  1. User fills signup form in `signup.jsx`
  2. Calls `authAPI.register()` from `frontend/src/services/api.js`
  3. Backend validates data, hashes password, creates user
  4. Returns JWT token and user data
  5. Frontend stores token in localStorage and navigates to `/question1`

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Backend File**: `backend/app/api/auth.py`
- **Frontend File**: `frontend/src/screens/login.jsx`
- **Input Type**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Return Type**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "id": "integer",
      "email": "string", 
      "name": "string",
      "created_at": "datetime"
    },
    "has_profile": "boolean"
  }
  ```
- **Flow**:
  1. User fills login form in `login.jsx`
  2. Calls `authAPI.login()` from `frontend/src/services/api.js`
  3. Backend verifies credentials, checks if user has profile
  4. Returns JWT token, user data, and profile status
  5. Frontend stores token and navigates to `/home` or `/question1` based on `has_profile`

### 3. Get Current User
- **Endpoint**: `GET /auth/me`
- **Backend File**: `backend/app/api/auth.py`
- **Frontend File**: `frontend/src/contexts/AuthContext.jsx`
- **Input Type**: None (uses JWT token)
- **Return Type**:
  ```json
  {
    "id": "integer",
    "email": "string",
    "name": "string",
    "created_at": "datetime"
  }
  ```
- **Flow**:
  1. Called on app startup in `AuthContext.jsx`
  2. Uses stored JWT token to get current user info
  3. Updates global auth state

### 4. Logout
- **Endpoint**: `POST /auth/logout`
- **Backend File**: `backend/app/api/auth.py`
- **Frontend File**: `frontend/src/screens/Settings.jsx`
- **Input Type**: None (uses JWT token)
- **Return Type**: `{"message": "string"}`
- **Flow**:
  1. User clicks logout in Settings
  2. Calls `authAPI.logout()` and clears localStorage
  3. Navigates to `/login`

---

## User Management Endpoints

### 1. Update User Account
- **Endpoint**: `PUT /users/me`
- **Backend File**: `backend/app/api/users.py`
- **Frontend File**: `frontend/src/screens/Settings.jsx`
- **Input Type**:
  ```json
  {
    "name": "string",
    "email": "string"
  }
  ```
- **Return Type**: User object
- **Flow**: Updates user account information

### 2. Delete User Account
- **Endpoint**: `DELETE /users/me`
- **Backend File**: `backend/app/api/users.py`
- **Frontend File**: `frontend/src/screens/Settings.jsx`
- **Input Type**: None
- **Return Type**: `{"message": "string"}`
- **Flow**: Deletes user account and all associated data

---

## Profile Management Endpoints

### 1. Create User Profile
- **Endpoint**: `POST /profiles/me`
- **Backend File**: `backend/app/api/profiles.py`
- **Frontend File**: `frontend/src/screens/question4.jsx`
- **Input Type**:
  ```json
  {
    "height_cm": "integer (100-250)",
    "weight_kg": "float (30-200)",
    "cycle_length": "integer (20-40)",
    "luteal_length": "integer (10-20)",
    "menses_length": "integer (2-10)",
    "unusual_bleeding": "boolean",
    "number_of_peak": "integer (1-5)"
  }
  ```
- **Return Type**:
  ```json
  {
    "id": "integer",
    "user_id": "integer",
    "height_cm": "integer",
    "weight_kg": "float",
    "cycle_length": "integer",
    "luteal_length": "integer",
    "menses_length": "integer",
    "unusual_bleeding": "boolean",
    "number_of_peak": "integer",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```
- **Flow**:
  1. User completes profile setup questions (`question1.jsx` → `question4.jsx`)
  2. Data collected in `ProfileContext.jsx`
  3. `question4.jsx` calls `profileAPI.createProfile()`
  4. Backend creates profile and returns profile data
  5. Frontend navigates to `/home`

### 2. Get User Profile
- **Endpoint**: `GET /profiles/me`
- **Backend File**: `backend/app/api/profiles.py`
- **Frontend File**: `frontend/src/screens/Settings.jsx`
- **Input Type**: None (uses JWT token)
- **Return Type**: Profile object (same as create)
- **Flow**: Retrieves current user's profile for display/editing

### 3. Update User Profile
- **Endpoint**: `PUT /profiles/me`
- **Backend File**: `backend/app/api/profiles.py`
- **Frontend File**: `frontend/src/screens/Settings.jsx`
- **Input Type**: Same as create (all fields optional)
- **Return Type**: Updated profile object
- **Flow**: Updates existing profile information

---

## Period Tracking Endpoints

### 1. Get Period Records
- **Endpoint**: `GET /periods/`
- **Backend File**: `backend/app/api/periods.py`
- **Frontend File**: `frontend/src/screens/Log.jsx`
- **Input Type**: Query parameters (optional)
- **Return Type**:
  ```json
  [
    {
      "id": "integer",
      "user_id": "integer",
      "start_date": "date",
      "end_date": "date",
      "created_at": "datetime"
    }
  ]
  ```
- **Flow**: Retrieves user's period history

### 2. Create Period Record
- **Endpoint**: `POST /periods/`
- **Backend File**: `backend/app/api/periods.py`
- **Frontend File**: `frontend/src/screens/Log.jsx`
- **Input Type**:
  ```json
  {
    "start_date": "date (YYYY-MM-DD)",
    "end_date": "date (YYYY-MM-DD, optional)"
  }
  ```
- **Return Type**: Created period record
- **Flow**:
  1. User logs period start in `Log.jsx`
  2. Calls `periodAPI.createPeriod()`
  3. Backend creates period record
  4. Triggers ML model retraining if needed

---

## Mood Tracking Endpoints

### 1. Get Mood Records
- **Endpoint**: `GET /moods/`
- **Backend File**: `backend/app/api/moods.py`
- **Frontend File**: `frontend/src/screens/Log.jsx`
- **Input Type**: Query parameters (optional)
- **Return Type**:
  ```json
  [
    {
      "id": "integer",
      "user_id": "integer",
      "date": "date",
      "energy_level": "string (low/medium/high)",
      "day_of_cycle": "integer",
      "created_at": "datetime"
    }
  ]
  ```
- **Flow**: Retrieves user's mood history

### 2. Create Mood Record
- **Endpoint**: `POST /moods/`
- **Backend File**: `backend/app/api/moods.py`
- **Frontend File**: `frontend/src/screens/Log.jsx`
- **Input Type**:
  ```json
  {
    "date": "date (YYYY-MM-DD)",
    "energy_level": "string (low/medium/high)",
    "symptoms": "array of strings (optional)"
  }
  ```
- **Return Type**: Created mood record
- **Flow**:
  1. User logs daily mood in `Log.jsx`
  2. Calls `moodAPI.createMood()`
  3. Backend calculates `day_of_cycle` automatically
  4. Creates mood record

---

## Predictions & ML Endpoints

### 1. Get Current Prediction
- **Endpoint**: `GET /predictions/current`
- **Backend File**: `backend/app/api/predictions.py`
- **Frontend File**: `frontend/src/screens/Home.jsx`
- **Input Type**: Query parameter `target_date` (optional)
- **Return Type**:
  ```json
  {
    "day_of_cycle": "integer",
    "cycle_phase": "string (Menses/Follicular/Luteal/Next Cycle)",
    "predicted_energy_level": "string (low/medium/high)",
    "next_period_in_days": "integer",
    "confidence": "float"
  }
  ```
- **Flow**:
  1. `Home.jsx` loads and calls `predictionsAPI.getCurrentPrediction()`
  2. Backend calculates current cycle day and phase
  3. ML model predicts mood based on historical data
  4. Returns prediction with confidence score

### 2. Confirm Period (New Endpoint)
- **Endpoint**: `POST /predictions/confirm-period`
- **Backend File**: `backend/app/api/predictions.py`
- **Frontend File**: `frontend/src/screens/Home.jsx`
- **Input Type**:
  ```json
  {
    "period_date": "date (YYYY-MM-DD)"
  }
  ```
- **Return Type**: `{"message": "string"}`
- **Flow**:
  1. User confirms period start in `Home.jsx` dialog
  2. Calls `predictionsAPI.confirmPeriod()`
  3. Backend logs period and triggers model retraining
  4. Updates predictions

### 3. Get Prediction History
- **Endpoint**: `GET /predictions/history`
- **Backend File**: `backend/app/api/predictions.py`
- **Input Type**: Query parameters `start_date`, `end_date`
- **Return Type**: Array of prediction records
- **Flow**: Retrieves historical predictions for analysis

### 4. Retrain ML Model
- **Endpoint**: `POST /predictions/retrain`
- **Backend File**: `backend/app/api/predictions.py`
- **Input Type**: None
- **Return Type**: `{"message": "string", "accuracy": "float"}`
- **Flow**: Manually triggers ML model retraining

### 5. Get Model Status
- **Endpoint**: `GET /predictions/model-status`
- **Backend File**: `backend/app/api/predictions.py`
- **Return Type**:
  ```json
  {
    "has_model": "boolean",
    "last_trained": "datetime",
    "accuracy": "float",
    "data_points": "integer"
  }
  ```
- **Flow**: Returns ML model status and performance metrics

### 6. Get Cycle Information
- **Endpoint**: `GET /predictions/cycle-info`
- **Backend File**: `backend/app/api/predictions.py`
- **Return Type**:
  ```json
  {
    "current_day": "integer",
    "cycle_phase": "string",
    "next_period_date": "date",
    "cycle_length": "integer"
  }
  ```
- **Flow**: Returns current cycle information

---

## Frontend Flow & File Structure

### Authentication Flow
```
1. App Startup: AuthContext.jsx → checkAuthStatus() → authAPI.getCurrentUser()
2. Login: login.jsx → authAPI.login() → navigate based on has_profile
3. Signup: signup.jsx → authAPI.register() → navigate to /question1
4. Logout: Settings.jsx → authAPI.logout() → navigate to /login
```

### Profile Setup Flow
```
1. question1.jsx → collect unusual_bleeding → ProfileContext
2. question2.jsx → collect height, weight, cycle_length → ProfileContext  
3. question3.jsx → collect luteal_length, menses_length → ProfileContext
4. question4.jsx → profileAPI.createProfile() → navigate to /home
```

### Main App Flow
```
1. Home.jsx → predictionsAPI.getCurrentPrediction() → display cycle info
2. Log.jsx → moodAPI.createMood() + periodAPI.createPeriod() → save daily data
3. Settings.jsx → profileAPI.getProfile() → display/edit profile
```

### Key Frontend Files
- **Contexts**: `AuthContext.jsx`, `ProfileContext.jsx`
- **Services**: `api.js` (centralized API communication)
- **Screens**: `login.jsx`, `signup.jsx`, `question1-4.jsx`, `Home.jsx`, `Log.jsx`, `Settings.jsx`
- **Components**: `ProtectedRoute.jsx`

### Key Backend Files
- **API Routes**: `auth.py`, `users.py`, `profiles.py`, `periods.py`, `moods.py`, `predictions.py`
- **Models**: `user.py`, `profile.py`, `period.py`, `mood.py`, `user_model.py`
- **Schemas**: `user.py`, `profile.py`, `period.py`, `mood.py`, `prediction.py`
- **Core**: `security.py`, `ml_model.py`, `cycle_calculator.py`
- **Config**: `config.py`, `database.py`

### Data Flow Summary
1. **User Registration**: Frontend form → Backend validation → User creation → JWT token
2. **Profile Setup**: Multi-step form → Context storage → Backend profile creation
3. **Daily Tracking**: Frontend forms → Backend data processing → ML model updates
4. **Predictions**: Backend ML model → Frontend display → User confirmation → Model retraining

### Error Handling
- **Frontend**: Axios interceptors handle 401 errors, component-level error states
- **Backend**: HTTPException with detailed error messages
- **Validation**: Pydantic schemas with field constraints and error messages

