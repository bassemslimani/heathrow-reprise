"""
User models and schemas
"""
from pydantic import BaseModel, EmailStr, Field, validator, field_validator
from typing import Optional, Union
from datetime import datetime
from enum import Enum
from uuid import UUID


class UserRole(str, Enum):
    """User role enumeration"""
    PASSENGER = "passenger"
    VISITOR = "visitor"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    nom: str = Field(..., min_length=1, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    telephone: str = Field(..., min_length=10, max_length=20)
    num_identite: Optional[str] = Field(None, max_length=50)
    date_naissance: Optional[datetime] = None
    lieu_naissance: Optional[str] = Field(None, max_length=100)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    role: UserRole = UserRole.PASSENGER
    ticket_number: Optional[str] = Field(None, max_length=50)


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=8, max_length=100)

    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response model (without password)"""
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


class UserUpdate(BaseModel):
    """User update model"""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    prenom: Optional[str] = Field(None, min_length=1, max_length=100)
    telephone: Optional[str] = Field(None, min_length=10, max_length=20)
    num_identite: Optional[str] = Field(None, max_length=50)
    date_naissance: Optional[datetime] = None
    lieu_naissance: Optional[str] = Field(None, max_length=100)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    ticket_number: Optional[str] = Field(None, max_length=50)


class Token(BaseModel):
    """JWT token model"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[str] = None
    email: Optional[str] = None
