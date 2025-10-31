"""
Models package
"""
from .user import (
    UserRole,
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    TokenData
)
from .flight import (
    FlightStatus,
    FlightBase,
    FlightCreate,
    FlightUpdate,
    FlightResponse,
    FlightSearch
)
from .schemas import (
    MessageSender,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ServiceCategory,
    ServiceBase,
    ServiceCreate,
    ServiceResponse,
    SpaceCategory,
    SpaceBase,
    SpaceCreate,
    SpaceResponse,
    NotificationType,
    NotificationBase,
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
    MeetGreetStatus,
    MeetGreetCreate,
    MeetGreetUpdate,
    MeetGreetResponse,
    TrackingCodeValidate,
    TicketValidate,
    SuccessResponse,
    ErrorResponse
)

__all__ = [
    # User models
    "UserRole",
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "Token",
    "TokenData",
    # Flight models
    "FlightStatus",
    "FlightBase",
    "FlightCreate",
    "FlightUpdate",
    "FlightResponse",
    "FlightSearch",
    # Chat models
    "MessageSender",
    "ChatMessageCreate",
    "ChatMessageResponse",
    "ChatRequest",
    "ChatResponse",
    # Service models
    "ServiceCategory",
    "ServiceBase",
    "ServiceCreate",
    "ServiceResponse",
    # Space models
    "SpaceCategory",
    "SpaceBase",
    "SpaceCreate",
    "SpaceResponse",
    # Notification models
    "NotificationType",
    "NotificationBase",
    "NotificationCreate",
    "NotificationResponse",
    "NotificationUpdate",
    # Meet & Greet models
    "MeetGreetStatus",
    "MeetGreetCreate",
    "MeetGreetUpdate",
    "MeetGreetResponse",
    "TrackingCodeValidate",
    "TicketValidate",
    # General responses
    "SuccessResponse",
    "ErrorResponse"
]
