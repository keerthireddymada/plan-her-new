# PlanHer - Period Tracking & Prediction App

PlanHer is a comprehensive period tracking and prediction application that helps users monitor their menstrual cycles, track moods, and receive AI-powered predictions about their cycle phases and mood patterns.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5174 (or the port shown in terminal)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 Application Overview

PlanHer is a full-stack web application built with:
- **Frontend**: React.js with Vite, Tailwind CSS, Framer Motion
- **Backend**: FastAPI with SQLAlchemy, SQLite database
- **Authentication**: JWT tokens with bcrypt password hashing
- **ML Features**: Cycle prediction and mood analysis

### Key Features
- 🔐 **User Authentication**: Secure registration and login
- 👤 **Profile Management**: Health metrics and cycle information
- 📅 **Period Tracking**: Log and monitor menstrual cycles
- 😊 **Mood Tracking**: Daily energy levels and mood patterns
- 🤖 **AI Predictions**: ML-powered cycle and mood predictions
- 📊 **Insights**: Data visualization and analytics
- 🔄 **Cycle Calculator**: Automatic cycle day calculations

## 🏗️ Project Structure

```
plan-her/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Security, ML models
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── utils/         # Utility functions
│   ├── alembic/           # Database migrations
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── screens/       # Page components
│   │   └── services/      # API services
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
└── README.md
```

## 🔌 API Documentation

### Authentication Endpoints

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `signup.jsx` | `/auth/register` | POST | `{email, password, name}` | `{access_token, user}` | User registration |
| `login.jsx` | `/auth/login` | POST | `{email, password}` | `{access_token, user}` | User login |
| `AuthContext.jsx` | `/auth/me` | GET | None (JWT) | `{user}` | Get current user |
| `Settings.jsx` | `/auth/logout` | POST | None (JWT) | `{message}` | User logout |

### Profile Management

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `question4.jsx` | `/profiles/me` | POST | Profile data | `{profile}` | Create user profile |
| `Settings.jsx` | `/profiles/me` | GET | None (JWT) | `{profile}` | Get user profile |
| `Settings.jsx` | `/profiles/me` | PUT | Profile data | `{profile}` | Update user profile |

### Period Tracking

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `Log.jsx` | `/periods/` | GET | Query params | `[{period}]` | Get period history |
| `Log.jsx` | `/periods/` | POST | `{start_date, end_date?}` | `{period}` | Log new period |
| `Log.jsx` | `/periods/{id}` | PUT | Period data | `{period}` | Update period |
| `Log.jsx` | `/periods/{id}` | DELETE | None | `{message}` | Delete period |

### Mood Tracking

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `Log.jsx` | `/moods/` | GET | Query params | `[{mood}]` | Get mood history |
| `Log.jsx` | `/moods/` | POST | `{date, energy_level, symptoms?}` | `{mood}` | Log daily mood |
| `Log.jsx` | `/moods/{id}` | PUT | Mood data | `{mood}` | Update mood |
| `Log.jsx` | `/moods/{id}` | DELETE | None | `{message}` | Delete mood |

### Predictions & ML

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `Home.jsx` | `/predictions/current` | GET | Query params | `{prediction}` | Get current prediction |
| `Home.jsx` | `/predictions/confirm-period` | POST | `{period_date}` | `{message}` | Confirm period start |
| `Insights.jsx` | `/predictions/history` | GET | Query params | `[{prediction}]` | Get prediction history |
| `Settings.jsx` | `/predictions/model-status` | GET | None | `{model_info}` | Get ML model status |
| `Settings.jsx` | `/predictions/retrain` | POST | None | `{message}` | Retrain ML model |

### User Management

| Frontend Location | Backend Endpoint | Method | Request Body | Response | Description |
|------------------|------------------|--------|--------------|----------|-------------|
| `Settings.jsx` | `/users/me` | PUT | `{name, email}` | `{user}` | Update user account |
| `Settings.jsx` | `/users/me` | DELETE | None | `{message}` | Delete user account |

## 📊 Data Models

### User Profile Schema
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

### Period Record Schema
```json
{
  "start_date": "date (YYYY-MM-DD)",
  "end_date": "date (YYYY-MM-DD, optional)"
}
```

### Mood Record Schema
```json
{
  "date": "date (YYYY-MM-DD)",
  "energy_level": "string (low/medium/high)",
  "symptoms": "array of strings (optional)"
}
```

### Prediction Response Schema
```json
{
  "day_of_cycle": "integer",
  "cycle_phase": "string (Menses/Follicular/Luteal/Next Cycle)",
  "predicted_energy_level": "string (low/medium/high)",
  "next_period_in_days": "integer",
  "confidence": "float"
}
```

## 🔐 Authentication Flow

1. **Registration**: User creates account → receives JWT token
2. **Login**: User authenticates → receives JWT token
3. **API Calls**: Frontend includes JWT in Authorization header
4. **Token Validation**: Backend validates JWT for protected routes
5. **Token Refresh**: Automatic token refresh when needed

## 🧠 ML Features

### Cycle Prediction
- Analyzes historical period data
- Predicts next period date
- Calculates current cycle day
- Determines cycle phase

### Mood Prediction
- Uses historical mood data
- Correlates with cycle phases
- Predicts energy levels
- Provides confidence scores

### Model Training
- Automatic retraining with new data
- User-specific models
- Accuracy tracking
- Model versioning

## 🎨 Frontend Features

### User Experience
- **Onboarding Flow**: Multi-step profile setup
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Eye-friendly interface
- **Smooth Animations**: Framer Motion integration

### Data Visualization
- **Cycle Calendar**: Visual period tracking
- **Mood Trends**: Energy level patterns
- **Predictions Dashboard**: AI insights display
- **Progress Charts**: Historical data analysis

## 🛠️ Development

### Backend Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
python -m pytest tests/

# Database migrations
alembic upgrade head
```

### Frontend Development
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./planher.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
- Unit tests for API endpoints
- Database model tests
- Authentication tests
- ML model tests

### Frontend Tests
- Component tests
- Integration tests
- API service tests
- User flow tests

## 📦 Deployment

### Backend Deployment
- Use production WSGI server (Gunicorn)
- Set up environment variables
- Configure database (PostgreSQL recommended)
- Set up SSL certificates

### Frontend Deployment
- Build static files: `npm run build`
- Serve with Nginx or CDN
- Configure API endpoint URLs
- Set up domain and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the test files for usage examples

---

**PlanHer** - Empowering women with intelligent period tracking and predictions.
