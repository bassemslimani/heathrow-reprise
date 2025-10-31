# AeroWay - Airport Navigation System

A comprehensive full-stack airport navigation system built with React + TypeScript (frontend) and FastAPI + Supabase (backend).

## Features

- **User Registration & Authentication** - JWT-based secure authentication
- **Passenger Interface** - Flight information, ticket validation, navigation
- **Visitor Interface** - Arrival tracking, Meet & Greet system
- **Interactive 3D Maps** - Navigate the airport with 3D visualization
- **AI Chatbot** - Multi-language support (French, English, Arabic)
- **Real-time Notifications** - Flight updates and alerts
- **Services Directory** - Shops, restaurants, lounges, and facilities
- **Meet & Greet Tracking** - Real-time passenger location sharing

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Three Fiber (3D maps)
- Axios + Zustand

### Backend
- FastAPI (Python)
- PostgreSQL (Self-hosted with Docker)
- JWT Authentication
- Pydantic + Bcrypt

## Quick Start with Docker (Recommended)

```bash
# 1. Set JWT secret key in backend/.env
cp backend/.env.example backend/.env
# Edit backend/.env and set JWT_SECRET_KEY

# 2. Start everything with Docker
docker-compose up --build

# That's it! Everything runs automatically
```

**Access:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Manual Setup (Without Docker)

### 1. PostgreSQL Setup
```bash
# Install PostgreSQL 16
# Then create database:
psql -U postgres -c "CREATE DATABASE aeroway;"
psql -U postgres -d aeroway -f backend/database/init.sql
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aeroway
python main.py
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

## API Services

The project includes ready-to-use API services:

```typescript
import { authService, flightsService, chatbotService, servicesService } from '@/services';

// Register user
await authService.register(userData);

// Get flights
await flightsService.getAllFlights({ terminal: 'A' });

// Send chat message
await chatbotService.sendMessage({ message, language: 'fr' });

// Generate Meet & Greet code
await servicesService.generateMeetGreetCode();
```

## Main API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/flights` - Get flights
- `POST /api/chatbot` - Chat message
- `POST /api/meet-greet/generate` - Generate tracking code
- `GET /api/meet-greet/track/{code}` - Track passenger

API Docs: `http://localhost:8000/docs`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aeroway
JWT_SECRET_KEY=your_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

📖 **See `POSTGRESQL_MIGRATION.md` for detailed database setup instructions**

## Docker Setup

```bash
docker-compose up --build
```

## Project Structure

```
├── backend/
│   ├── routers/        # API endpoints
│   ├── models/         # Pydantic models
│   ├── database/       # Supabase client + migration
│   └── main.py         # FastAPI app
├── src/
│   ├── services/       # API services
│   ├── components/     # React components
│   └── ...
└── docker-compose.yml
```

## Documentation

Full documentation available in this README. See API docs at `/docs` endpoint.

## License

MIT License
