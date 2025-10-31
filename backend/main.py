"""
AeroWay Backend - FastAPI Application
Main entry point for the AeroWay airport navigation system backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database
from database import init_db, close_db

# Import routers
from routers import (
    auth_router,
    flights_router,
    chatbot_router,
    services_router
)

# Create FastAPI application
app = FastAPI(
    title="AeroWay API",
    description="Backend API for AeroWay Airport Navigation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint - API health check

    Returns:
        dict: Welcome message and API information
    """
    return {
        "message": "Welcome to AeroWay API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint

    Returns:
        dict: Health status
    """
    return {
        "status": "healthy",
        "service": "AeroWay API",
        "version": "1.0.0"
    }


# API info endpoint
@app.get("/api")
async def api_info():
    """
    API information endpoint

    Returns:
        dict: API endpoints and information
    """
    return {
        "message": "AeroWay API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "validate_ticket": "POST /api/auth/validate-ticket",
                "me": "GET /api/auth/me",
                "logout": "POST /api/auth/logout"
            },
            "flights": {
                "list": "GET /api/flights",
                "get_by_number": "GET /api/flights/{flight_number}",
                "my_flight": "GET /api/flights/user/my-flight",
                "search_arrivals": "GET /api/flights/arrivals/search"
            },
            "chatbot": {
                "send_message": "POST /api/chatbot",
                "history": "GET /api/chatbot/history/{session_id}",
                "user_history": "GET /api/chatbot/user-history"
            },
            "services": {
                "list": "GET /api/services",
                "by_category": "GET /api/services/{category}",
                "spaces": "GET /api/spaces"
            },
            "meet_greet": {
                "generate": "POST /api/meet-greet/generate",
                "track": "POST /api/meet-greet/track",
                "track_by_code": "GET /api/meet-greet/track/{tracking_code}",
                "update": "PATCH /api/meet-greet/{tracking_code}",
                "deactivate": "DELETE /api/meet-greet/{tracking_code}"
            }
        }
    }


# Include routers
app.include_router(auth_router)
app.include_router(flights_router)
app.include_router(chatbot_router)
app.include_router(services_router)


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Global HTTP exception handler

    Args:
        request: Request object
        exc: HTTP exception

    Returns:
        JSONResponse: Error response
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    Global general exception handler

    Args:
        request: Request object
        exc: Exception

    Returns:
        JSONResponse: Error response
    """
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "details": str(exc) if os.getenv("DEBUG", "False") == "True" else None
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    """
    print("AeroWay API starting...")
    print(f"Documentation available at: /docs")
    print(f"ReDoc available at: /redoc")
    print(f"CORS enabled for: {origins}")

    # Initialize database connection pool
    try:
        await init_db()
        print("Database connection pool initialized")
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    """
    print("AeroWay API shutting down...")

    # Close database connection pool
    try:
        await close_db()
        print("Database connection pool closed")
    except Exception as e:
        print(f"Error closing database: {e}")


if __name__ == "__main__":
    import uvicorn

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "True") == "True"

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
