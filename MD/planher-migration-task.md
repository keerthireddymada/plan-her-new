# AI Task Planning Template - PlanHer Backend Migration

> **About This Template:** This is a systematic framework for planning and executing the PlanHer backend migration from Flask to FastAPI with proper data persistence and user management.

---

## 1. Task Overview

### Task Title
**Title:** PlanHer Backend Migration: Flask → FastAPI with Database Integration

### Goal Statement
**Goal:** Migrate the existing Flask-based PlanHer backend to FastAPI with proper database persistence, JWT authentication, and multi-user support while maintaining all existing ML functionality for cycle tracking and mood prediction. This will provide a scalable, secure, and modern backend architecture that can handle multiple users with persistent data storage.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Flask (current) → FastAPI (target), React 19.1.0 (frontend)
- **Language:** Python 3.8+ (backend), JavaScript/JSX (frontend)
- **Database & ORM:** No database (current) → SQLAlchemy + PostgreSQL/SQLite (target)
- **UI & Styling:** React with Tailwind CSS, Framer Motion animations
- **Authentication:** Session-based (current) → JWT tokens (target)
- **Key Architectural Patterns:** RESTful API, ML model training, Cycle phase calculations

### Current State
**Working:** Frontend React app with all UI components, Flask backend with ML model training, cycle tracking algorithms, BMI computation, 3 functional endpoints (/setup, /daily_mood, /predict)

**Broken/Missing:** Data persistence (session-based), user authentication, multi-user support, database storage, proper error handling, input validation

**Needs Change:** Backend framework migration, database integration, authentication system, API endpoint restructuring

## 3. Context & Problem Definition

### Problem Statement
The current PlanHer backend uses Flask with session-based storage, which means all user data is lost on server restart and only one user can be supported at a time. The app lacks proper authentication, data persistence, and scalability. Users cannot have their data saved permanently, and the system cannot handle multiple users simultaneously. The ML model training works but has no persistence, requiring retraining on every server restart.

### Success Criteria
- [ ] FastAPI backend successfully replaces Flask with all existing functionality
- [ ] Database integration with proper user data persistence
- [ ] JWT authentication system working for multiple users
- [ ] All existing endpoints migrated and functional
- [ ] ML model training and prediction working with data persistence
- [ ] Frontend integration successful with minimal code changes
- [ ] Comprehensive test coverage implemented

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Production system migration (existing working app)
- **Breaking Changes:** Must be avoided - frontend should work with minimal changes
- **Data Handling:** No existing data to migrate (session-based storage)
- **User Base:** Single user currently, expanding to multiple users
- **Priority:** Stability over speed - maintain existing functionality

---

## 5. Technical Requirements

### Functional Requirements
- **User can register and login** with email/password authentication
- **User can create and update profile** with cycle information (height, weight, cycle length, etc.)
- **User can track daily moods** with energy levels (0=low, 1=medium, 2=high)
- **User can log period start dates** for cycle tracking
- **System automatically calculates** BMI, cycle phases, and day of cycle
- **System automatically trains ML model** when sufficient data is available
- **System automatically predicts** mood and energy levels based on cycle data
- **When user logs in**, then system provides personalized predictions
- **When new mood data is added**, then system retrains model if needed

### Non-Functional Requirements
- **Performance:** API response time < 200ms, support 100+ concurrent users
- **Security:** JWT token authentication, password hashing with bcrypt, CORS protection
- **Usability:** RESTful API design, comprehensive error messages, automatic API documentation
- **Responsive Design:** Backend supports mobile-first frontend architecture
- **Theme Support:** Maintain existing lavender/black color scheme compatibility

### Technical Constraints
- Must maintain compatibility with existing React frontend
- Cannot change existing ML model algorithm (RandomForest)
- Must preserve existing cycle calculation logic
- Must support existing data formats and API responses
- Cannot break existing frontend routing and state management

---

## 6. Data & Database Changes

### Database Schema Changes
```sql
-- New tables to be created
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE period_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    day_of_cycle INTEGER,
    energy_level INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_models (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    model_data BYTEA,
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data Model Updates
```python
# New Pydantic schemas for FastAPI
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ProfileCreate(BaseModel):
    height_cm: int
    weight_kg: float
    cycle_length: int
    luteal_length: int
    menses_length: int
    unusual_bleeding: bool = False
    number_of_peak: int = 2

class MoodCreate(BaseModel):
    date: date
    energy_level: int  # 0=low, 1=medium, 2=high
    notes: Optional[str] = None
```

### Data Migration Plan
1. **No existing data migration** needed (session-based storage)
2. **Database initialization** with Alembic migrations
3. **Seed data creation** for testing purposes
4. **Data validation** and integrity checks

---

## 7. API & Backend Changes

### Data Access Pattern Rules
- **API routes** go in `app/api/` directory
- **Database models** go in `app/models/` directory
- **Pydantic schemas** go in `app/schemas/` directory
- **Business logic** goes in `app/core/` directory
- **Utility functions** go in `app/utils/` directory

### Server Actions
- **POST /auth/register** - Create new user account
- **POST /auth/login** - Authenticate user and return JWT token
- **POST /profiles/me** - Create/update user profile
- **POST /moods/** - Add daily mood entry
- **POST /periods/** - Add period start date
- **POST /predictions/retrain** - Retrain ML model for user

### Database Queries
- **Direct SQLAlchemy queries** for complex operations
- **Repository pattern** for data access abstraction
- **Eager loading** for related data (profiles, moods, periods)
- **Optimized queries** for ML model training data

---

## 8. Frontend Changes

### New Components
- **AuthContext** - JWT token management and authentication state
- **LoginForm** - User login component
- **RegisterForm** - User registration component
- **ProfileForm** - User profile management component

### Page Updates
- **Login page** - Add authentication form
- **Signup page** - Add registration form
- **Settings page** - Add profile management
- **All API calls** - Add authentication headers

### State Management
- **JWT token storage** in localStorage
- **User context** for authentication state
- **API client** with automatic token injection
- **Error handling** for authentication failures

---

## 9. Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Create FastAPI project structure
- [ ] Set up SQLAlchemy database connection
- [ ] Create database models (User, Profile, Period, Mood, Model)
- [ ] Set up Alembic for migrations
- [ ] Create Pydantic schemas for validation

### Phase 2: Authentication (Week 2)
- [ ] Implement JWT authentication system
- [ ] Create password hashing with bcrypt
- [ ] Build auth endpoints (/register, /login, /refresh, /logout)
- [ ] Add authentication middleware
- [ ] Test authentication flow

### Phase 3: Core Features (Week 3)
- [ ] Migrate existing endpoints (/setup → /profiles, /daily_mood → /moods)
- [ ] Implement ML model training with persistence
- [ ] Create prediction endpoints (/predict → /predictions)
- [ ] Add cycle calculation logic
- [ ] Test with sample data

### Phase 4: Integration (Week 4)
- [ ] Update frontend API calls with authentication
- [ ] Add proxy configuration to package.json
- [ ] Test end-to-end functionality
- [ ] Add comprehensive error handling
- [ ] Create API documentation

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- **Daily progress updates** with completed tasks and blockers
- **Code review checkpoints** after each phase
- **Testing milestones** with pass/fail status
- **Performance benchmarks** for API response times
- **Security validation** for authentication and data protection

---

## 11. File Structure & Organization

### New Files to Create
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── period.py
│   │   └── mood.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── profile.py
│   │   └── mood.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── profiles.py
│   │   ├── periods.py
│   │   ├── moods.py
│   │   └── predictions.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── ml_model.py
│   │   └── cycle_calculator.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── requirements.txt
├── alembic/
└── tests/
```

### Files to Modify
- **frontend/package.json** - Add proxy configuration
- **frontend/src/App.jsx** - Add authentication context
- **frontend/src/screens/login.jsx** - Update API calls
- **frontend/src/screens/signup.jsx** - Update API calls
- **frontend/src/screens/Home.jsx** - Add authentication headers

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1. **Start with database models** - Create SQLAlchemy models first
2. **Implement authentication** - JWT system before other features
3. **Migrate endpoints one by one** - Test each endpoint thoroughly
4. **Update frontend integration** - Add authentication headers
5. **Comprehensive testing** - Unit tests and integration tests
6. **Documentation** - API docs and deployment instructions

### Communication Preferences
- **Daily progress reports** with completed tasks and next steps
- **Immediate notification** of any breaking changes or blockers
- **Code review requests** after major milestones
- **Performance metrics** after each phase completion

### Code Quality Standards
- **Type hints** required for all Python functions
- **Docstrings** for all public methods
- **Error handling** with proper HTTP status codes
- **Input validation** using Pydantic schemas
- **Security best practices** for authentication and data handling

---

## 13. Second-Order Impact Analysis

### Impact Assessment
**Sections of code to monitor:**
- **Frontend API calls** in all screen components (Home.jsx, Log.jsx, Insights.jsx, etc.)
- **Authentication flow** in login/signup screens
- **ML model training** performance and accuracy
- **Database queries** for performance optimization

**Performance concerns:**
- **JWT token validation** overhead on each request
- **ML model training** time with larger datasets
- **Database connection pooling** for concurrent users
- **API response times** with authentication middleware

**User workflow impacts:**
- **Login requirement** before accessing app features
- **Data persistence** - users will see their data saved permanently
- **Multi-user support** - each user gets personalized predictions
- **Improved reliability** - no data loss on server restart

**Risk mitigation:**
- **Backward compatibility** - maintain existing API response formats
- **Graceful degradation** - handle authentication failures
- **Data validation** - prevent invalid data from breaking ML models
- **Error recovery** - automatic retraining if model fails

---

**🎯 Ready to Execute PlanHer Backend Migration**

This template provides the complete framework for migrating from Flask to FastAPI with proper database integration, authentication, and multi-user support while maintaining all existing functionality.

---

*This template is part of ShipKit - AI-powered development workflows and templates*  
*Get the complete toolkit at: https://shipkit.ai*
