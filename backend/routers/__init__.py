"""
Routers package
"""
from .auth import router as auth_router
from .flights import router as flights_router
from .chatbot import router as chatbot_router
from .services import router as services_router

__all__ = [
    "auth_router",
    "flights_router",
    "chatbot_router",
    "services_router"
]
