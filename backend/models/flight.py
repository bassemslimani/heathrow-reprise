"""
Flight models and schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union
from datetime import datetime
from enum import Enum
from uuid import UUID


class FlightStatus(str, Enum):
    """Flight status enumeration"""
    ON_TIME = "On Time"
    DELAYED = "Delayed"
    BOARDING = "Boarding"
    DEPARTED = "Departed"
    LANDED = "Landed"
    ARRIVED = "Arrived"
    CANCELLED = "Cancelled"


class FlightBase(BaseModel):
    """Base flight model"""
    flight_number: str = Field(..., min_length=3, max_length=20)
    airline: str = Field(..., min_length=1, max_length=100)
    origin: Optional[str] = Field(None, max_length=100)
    destination: Optional[str] = Field(None, max_length=100)
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    gate: Optional[str] = Field(None, max_length=10)
    terminal: Optional[str] = Field(None, max_length=10)
    status: FlightStatus = FlightStatus.ON_TIME
    boarding_time: Optional[datetime] = None
    baggage_claim: Optional[str] = Field(None, max_length=50)


class FlightCreate(FlightBase):
    """Flight creation model"""
    pass


class FlightUpdate(BaseModel):
    """Flight update model"""
    airline: Optional[str] = Field(None, min_length=1, max_length=100)
    origin: Optional[str] = Field(None, max_length=100)
    destination: Optional[str] = Field(None, max_length=100)
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    gate: Optional[str] = Field(None, max_length=10)
    terminal: Optional[str] = Field(None, max_length=10)
    status: Optional[FlightStatus] = None
    boarding_time: Optional[datetime] = None
    baggage_claim: Optional[str] = Field(None, max_length=50)


class FlightResponse(FlightBase):
    """Flight response model"""
    id: Union[str, UUID]
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class FlightSearch(BaseModel):
    """Flight search model"""
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[FlightStatus] = None
