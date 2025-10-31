"""
Authentication router - handles user registration, login, and ticket validation
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import Optional

from models import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TicketValidate,
    SuccessResponse
)
from auth_utils import (
    get_password_hash,
    verify_password,
    create_user_token,
    get_current_user,
    TokenData
)
from database import select, insert, update, execute_raw

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user

    Args:
        user_data: User registration data

    Returns:
        Token: JWT token with user information

    Raises:
        HTTPException: If email already exists or registration fails
    """
    try:
        # Check if user already exists
        existing_user = await select("users", where={"email": user_data.email}, fetch_one=True)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = get_password_hash(user_data.password)

        # Prepare user data for insertion
        user_dict = user_data.model_dump(exclude={"password"})
        user_dict["password_hash"] = hashed_password
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()

        # Insert user into database
        created_user = await insert("users", data=user_dict, returning="*")

        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )

        # Create JWT token
        access_token = create_user_token(
            user_id=created_user["id"],
            email=created_user["email"]
        )

        # Prepare user response
        user_response = UserResponse(
            id=created_user["id"],
            email=created_user["email"],
            nom=created_user["nom"],
            prenom=created_user["prenom"],
            telephone=created_user["telephone"],
            num_identite=created_user.get("num_identite"),
            date_naissance=created_user.get("date_naissance"),
            lieu_naissance=created_user.get("lieu_naissance"),
            ville=created_user.get("ville"),
            pays=created_user.get("pays"),
            role=created_user["role"],
            ticket_number=created_user.get("ticket_number"),
            created_at=created_user["created_at"],
            updated_at=created_user.get("updated_at")
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login_user(credentials: UserLogin):
    """
    Authenticate a user and return JWT token

    Args:
        credentials: User login credentials

    Returns:
        Token: JWT token with user information

    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        # Find user by email
        user = await select("users", where={"email": credentials.email}, fetch_one=True)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create JWT token
        access_token = create_user_token(
            user_id=user["id"],
            email=user["email"]
        )

        # Prepare user response
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            nom=user["nom"],
            prenom=user["prenom"],
            telephone=user["telephone"],
            num_identite=user.get("num_identite"),
            date_naissance=user.get("date_naissance"),
            lieu_naissance=user.get("lieu_naissance"),
            ville=user.get("ville"),
            pays=user.get("pays"),
            role=user["role"],
            ticket_number=user.get("ticket_number"),
            created_at=user["created_at"],
            updated_at=user.get("updated_at")
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/validate-ticket", response_model=SuccessResponse)
async def validate_ticket(
    ticket_data: TicketValidate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Validate a passenger ticket number and link it to the user

    Args:
        ticket_data: Ticket validation data
        current_user: Current authenticated user

    Returns:
        SuccessResponse: Success message with flight information

    Raises:
        HTTPException: If ticket is invalid or already in use
    """
    try:
        # Check if ticket is already associated with another user
        existing_ticket = await select("users", where={"ticket_number": ticket_data.ticket_number}, fetch_one=True)

        if existing_ticket:
            # Check if it's the current user's ticket
            if existing_ticket["id"] != current_user.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ticket number already in use"
                )

        # Update user with ticket number
        updated_user = await update(
            "users",
            data={
                "ticket_number": ticket_data.ticket_number,
                "updated_at": datetime.utcnow()
            },
            where={"id": current_user.user_id},
            returning="*"
        )

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to validate ticket"
            )

        # Try to find associated flight
        flight = await execute_raw(
            "SELECT * FROM flights WHERE flight_number ILIKE $1 LIMIT 1",
            f"%{ticket_data.ticket_number}%"
        )

        flight_info = None
        if flight:
            flight = flight[0]
            flight_info = {
                "flight_number": flight["flight_number"],
                "destination": flight.get("destination"),
                "gate": flight.get("gate"),
                "terminal": flight.get("terminal"),
                "departure_time": flight.get("departure_time"),
                "status": flight.get("status")
            }

        return SuccessResponse(
            success=True,
            message="Ticket validated successfully",
            data={"flight": flight_info} if flight_info else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ticket validation failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """
    Get current authenticated user information

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user information

    Raises:
        HTTPException: If user not found
    """
    try:
        user = await select("users", where={"id": current_user.user_id}, fetch_one=True)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(
            id=user["id"],
            email=user["email"],
            nom=user["nom"],
            prenom=user["prenom"],
            telephone=user["telephone"],
            num_identite=user.get("num_identite"),
            date_naissance=user.get("date_naissance"),
            lieu_naissance=user.get("lieu_naissance"),
            ville=user.get("ville"),
            pays=user.get("pays"),
            role=user["role"],
            ticket_number=user.get("ticket_number"),
            created_at=user["created_at"],
            updated_at=user.get("updated_at")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user information: {str(e)}"
        )


@router.post("/logout", response_model=SuccessResponse)
async def logout_user(current_user: TokenData = Depends(get_current_user)):
    """
    Logout current user (client-side token removal)

    Args:
        current_user: Current authenticated user

    Returns:
        SuccessResponse: Success message
    """
    return SuccessResponse(
        success=True,
        message="Logged out successfully. Please remove the token from client storage."
    )
