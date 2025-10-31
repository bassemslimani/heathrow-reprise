"""
Additional schemas for chatbot, services, notifications, and meet & greet
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
from uuid import UUID


# ============ Chat/Message Models ============

class MessageSender(str, Enum):
    """Message sender enumeration"""
    USER = "user"
    BOT = "bot"


class ChatMessageCreate(BaseModel):
    """Chat message creation model"""
    message_text: str = Field(..., min_length=1)
    user_id: Optional[str] = None
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """Chat message response model"""
    id: Union[str, UUID]
    user_id: Optional[Union[str, UUID]]
    session_id: Optional[str]
    sender: MessageSender
    message_text: str
    timestamp: datetime

    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Chatbot request model"""
    message: str = Field(..., min_length=1)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    language: str = Field(default="fr", pattern="^(fr|en|ar)$")


class ChatResponse(BaseModel):
    """Chatbot response model"""
    message: str
    sender: str = "bot"
    timestamp: datetime = Field(default_factory=datetime.now)
    session_id: Optional[str] = None


# ============ Service Models ============

class ServiceCategory(str, Enum):
    """Service category enumeration"""
    SHOP = "shop"
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    LOUNGE = "lounge"
    BANK = "bank"
    PHARMACY = "pharmacy"
    OTHER = "other"


class ServiceBase(BaseModel):
    """Base service model"""
    name: str = Field(..., min_length=1, max_length=200)
    category: ServiceCategory
    location: str = Field(..., min_length=1, max_length=100)
    terminal: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = None
    opening_hours: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None


class ServiceCreate(ServiceBase):
    """Service creation model"""
    pass


class ServiceResponse(ServiceBase):
    """Service response model"""
    id: Union[str, UUID]
    created_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


# ============ Space Models ============

class SpaceCategory(str, Enum):
    """Space category enumeration"""
    GATE = "gate"
    SECURITY = "security"
    BAGGAGE = "baggage"
    RESTROOM = "restroom"
    INFORMATION = "information"
    WAITING_AREA = "waiting_area"
    PARKING = "parking"
    OTHER = "other"


class SpaceBase(BaseModel):
    """Base space model"""
    name: str = Field(..., min_length=1, max_length=200)
    category: SpaceCategory
    location: str = Field(..., min_length=1, max_length=100)
    terminal: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = None
    opening_hours: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None  # {x, y, z}


class SpaceCreate(SpaceBase):
    """Space creation model"""
    pass


class SpaceResponse(SpaceBase):
    """Space response model"""
    id: Union[str, UUID]
    created_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


# ============ Notification Models ============

class NotificationType(str, Enum):
    """Notification type enumeration"""
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"


class NotificationBase(BaseModel):
    """Base notification model"""
    user_id: str
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    related_flight_id: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Notification creation model"""
    pass


class NotificationResponse(NotificationBase):
    """Notification response model"""
    id: Union[str, UUID]
    timestamp: datetime
    is_read: bool = False

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    """Notification update model"""
    is_read: bool


# ============ Meet & Greet Models ============

class MeetGreetStatus(str, Enum):
    """Meet & Greet status enumeration"""
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"


class MeetGreetCreate(BaseModel):
    """Meet & Greet creation model"""
    passenger_id: str
    passenger_name: str = Field(..., min_length=1, max_length=200)
    flight_id: Optional[str] = None
    current_location: Optional[str] = Field(None, max_length=100)


class MeetGreetUpdate(BaseModel):
    """Meet & Greet update model"""
    current_location: Optional[str] = Field(None, max_length=100)
    status: Optional[MeetGreetStatus] = None


class MeetGreetResponse(BaseModel):
    """Meet & Greet response model"""
    id: Union[str, UUID]
    tracking_code: str
    passenger_id: Union[str, UUID]
    passenger_name: str
    flight_id: Optional[Union[str, UUID]]
    current_location: Optional[str]
    status: MeetGreetStatus
    created_at: datetime
    expires_at: Optional[datetime]
    last_updated: datetime

    @field_validator('id', 'passenger_id', 'flight_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class TrackingCodeValidate(BaseModel):
    """Tracking code validation model"""
    tracking_code: str = Field(..., min_length=6, max_length=10)


class TicketValidate(BaseModel):
    """Ticket validation model"""
    ticket_number: str = Field(..., min_length=3, max_length=50)


# ============ General Response Models ============

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    details: Optional[str] = None
