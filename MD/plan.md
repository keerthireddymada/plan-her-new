# PlanHer Backend Migration Plan: Flask → FastAPI

## Current State Analysis

### Existing Flask Backend Features:
- **Session-based user management** (temporary, no persistence)
- **ML model training** with RandomForest for mood prediction
- **Cycle tracking** with phase calculation
- **BMI computation**
- **3 endpoints**: `/setup`, `/daily_mood`, `/predict`

### Issues with Current Implementation:
1. **No data persistence** - all data lost on server restart
2. **No user authentication** - single session per server
3. **No database** - session storage only
4. **No user management** - can't handle multiple users

## Migration Plan: FastAPI + Database

### Phase 1: Database Design & User Management

#### 1.1 Database Schema (SQLAlchemy + PostgreSQL/SQLite)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    cycle_length INTEGER,
    luteal_length INTEGER,
    menses_length INTEGER,
    unusual_bleeding BOOLEAN DEFAULT FALSE,
    number_of_peak INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Period tracking table
CREATE TABLE period_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily mood/energy tracking
CREATE TABLE daily_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    day_of_cycle INTEGER,
    energy_level INTEGER, -- 0=low, 1=medium, 2=high
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ML model storage (optional)
CREATE TABLE user_models (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    model_data BYTEA, -- serialized model
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 FastAPI Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── period.py
│   │   └── mood.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── profile.py
│   │   └── mood.py
│   ├── api/                   # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── profiles.py
│   │   ├── periods.py
│   │   ├── moods.py
│   │   └── predictions.py
│   ├── core/                  # Core functionality
│   │   ├── __init__.py
│   │   ├── security.py        # JWT authentication
│   │   ├── ml_model.py        # ML model training/prediction
│   │   └── cycle_calculator.py # Cycle phase calculations
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       └── helpers.py
├── requirements.txt
├── alembic/                   # Database migrations
│   ├── versions/
│   └── alembic.ini
└── tests/                     # Unit tests
    ├── test_auth.py
    ├── test_users.py
    └── test_predictions.py
```

### Phase 2: Authentication & Authorization

#### 2.1 JWT Authentication
- **JWT tokens** for stateless authentication
- **Password hashing** with bcrypt
- **Token refresh** mechanism
- **Role-based access** (user/admin)

#### 2.2 Authentication Endpoints
```python
POST /auth/register     # User registration
POST /auth/login        # User login
POST /auth/refresh      # Refresh token
POST /auth/logout       # Logout (token blacklisting)
GET  /auth/me           # Get current user info
```

### Phase 3: API Endpoints Migration

#### 3.1 User Management
```python
GET    /users/me                    # Get current user profile
PUT    /users/me                    # Update user profile
DELETE /users/me                    # Delete account
```

#### 3.2 Profile Management (replaces /setup)
```python
GET    /profiles/me                 # Get user profile
POST   /profiles/me                 # Create/update profile
PUT    /profiles/me                 # Update profile
```

#### 3.3 Period Tracking
```python
GET    /periods/                    # Get all periods
POST   /periods/                    # Add new period
PUT    /periods/{period_id}         # Update period
DELETE /periods/{period_id}         # Delete period
```

#### 3.4 Mood Tracking (replaces /daily_mood)
```python
GET    /moods/                      # Get mood history
POST   /moods/                      # Add daily mood
PUT    /moods/{mood_id}             # Update mood
DELETE /moods/{mood_id}             # Delete mood
```

#### 3.5 Predictions (replaces /predict)
```python
GET    /predictions/current          # Get current prediction
GET    /predictions/history          # Get prediction history
POST   /predictions/retrain          # Retrain model
```

### Phase 4: Frontend Integration Changes

#### 4.1 Package.json Proxy Configuration
```json
{
  "proxy": "http://localhost:8000"
}
```

#### 4.2 API Endpoint Updates (Frontend Changes)
```javascript
// Current Flask endpoints → New FastAPI endpoints
// /setup → POST /profiles/me
// /daily_mood → POST /moods/
// /predict → GET /predictions/current

// Add authentication headers
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Phase 5: ML Model Improvements

#### 5.1 Model Persistence
- **Per-user models** stored in database
- **Model versioning** and accuracy tracking
- **Automatic retraining** when new data available

#### 5.2 Enhanced Features
- **Feature engineering** improvements
- **Model validation** and cross-validation
- **Prediction confidence** scores
- **Alternative models** (XGBoost, Neural Networks)

### Phase 6: Data Validation & Security

#### 6.1 Input Validation
- **Pydantic schemas** for request/response validation
- **Data sanitization** and type checking
- **Business logic validation** (cycle lengths, dates, etc.)

#### 6.2 Security Measures
- **Rate limiting** on API endpoints
- **CORS configuration** for frontend
- **Input sanitization** and SQL injection prevention
- **Audit logging** for sensitive operations

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up FastAPI project structure
- [ ] Configure database (SQLite for development)
- [ ] Create SQLAlchemy models
- [ ] Implement basic CRUD operations

### Week 2: Authentication
- [ ] Implement JWT authentication
- [ ] Create auth endpoints
- [ ] Add password hashing
- [ ] Test authentication flow

### Week 3: Core Features
- [ ] Migrate existing endpoints
- [ ] Implement ML model training
- [ ] Add prediction endpoints
- [ ] Test with frontend

### Week 4: Integration & Testing
- [ ] Update frontend API calls
- [ ] Add proxy configuration
- [ ] Comprehensive testing
- [ ] Documentation

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **scikit-learn** - ML models
- **PostgreSQL/SQLite** - Database

### Development Tools
- **uvicorn** - ASGI server
- **pytest** - Testing framework
- **black** - Code formatting
- **flake8** - Linting

## Benefits of Migration

1. **Scalability** - Async support, better performance
2. **Type Safety** - Pydantic validation, better error handling
3. **Documentation** - Automatic API docs with Swagger/OpenAPI
4. **Data Persistence** - Proper database storage
5. **Multi-user Support** - JWT authentication
6. **Better Testing** - Comprehensive test coverage
7. **Modern Standards** - RESTful API design

## Next Steps

1. **Review and approve** this plan
2. **Set up development environment**
3. **Start with database schema**
4. **Implement authentication system**
5. **Migrate existing endpoints**
6. **Update frontend integration**
7. **Deploy and test**

## Questions for Clarification

1. **Database choice**: PostgreSQL (production) vs SQLite (development)?
2. **Deployment**: Docker containers or direct deployment?
3. **ML model storage**: Database BLOB or file system?
4. **User roles**: Admin users needed?
5. **Data backup**: Backup strategy requirements?
