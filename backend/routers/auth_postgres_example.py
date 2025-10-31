"""
Authentication router - PostgreSQL Example
This is an example showing how to migrate from Supabase to PostgreSQL
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
# Import the new PostgreSQL database functions
from database import select, insert, update

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user using PostgreSQL

    MIGRATION NOTE:
    - OLD: supabase.table("users").select("*").eq("email", email).execute()
    - NEW: await select("users", where={"email": email}, fetch_one=True)
    """
    try:
        # Check if user already exists
        # OLD Supabase way:
        # existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
        #
        # NEW PostgreSQL way:
        existing_user = await select(
            table="users",
            where={"email": user_data.email},
            fetch_one=True
        )

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
        # OLD Supabase way:
        # result = supabase.table("users").insert(user_dict).execute()
        # created_user = result.data[0]
        #
        # NEW PostgreSQL way:
        created_user = await insert(
            table="users",
            data=user_dict,
            returning="*"
        )

        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )

        # Create JWT token
        access_token = create_user_token(
            user_id=str(created_user["id"]),
            email=created_user["email"]
        )

        # Prepare user response
        user_response = UserResponse(
            id=str(created_user["id"]),
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
    Authenticate a user using PostgreSQL
    """
    try:
        # Find user by email
        # OLD: result = supabase.table("users").select("*").eq("email", credentials.email).execute()
        # NEW:
        user = await select(
            table="users",
            where={"email": credentials.email},
            fetch_one=True
        )

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
            user_id=str(user["id"]),
            email=user["email"]
        )

        # Prepare user response
        user_response = UserResponse(
            id=str(user["id"]),
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
    Validate a passenger ticket number using PostgreSQL
    """
    try:
        # Check if ticket is already associated with another user
        # OLD: existing_ticket = supabase.table("users").select("*").eq("ticket_number", ticket_data.ticket_number).execute()
        # NEW:
        existing_ticket = await select(
            table="users",
            where={"ticket_number": ticket_data.ticket_number},
            fetch_one=True
        )

        if existing_ticket:
            if existing_ticket["id"] != current_user.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ticket number already in use"
                )

        # Update user with ticket number
        # OLD: update_result = supabase.table("users").update({...}).eq("id", user_id).execute()
        # NEW:
        updated_user = await update(
            table="users",
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
        # For ILIKE queries, we need to use execute_raw from database module
        from database import execute_raw

        flight_result = await execute_raw(
            "SELECT * FROM flights WHERE flight_number ILIKE $1 LIMIT 1",
            f"%{ticket_data.ticket_number}%"
        )

        flight_info = None
        if flight_result and len(flight_result) > 0:
            flight = dict(flight_result[0])
            flight_info = {
                "flight_number": flight["flight_number"],
                "destination": flight.get("destination"),
                "gate": flight.get("gate"),
                "terminal": flight.get("terminal"),
                "departure_time": str(flight.get("departure_time")) if flight.get("departure_time") else None,
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


"""
MIGRATION SUMMARY:

1. Import changes:
   - OLD: from database.supabase_client import supabase
   - NEW: from database import select, insert, update, delete, execute_raw

2. SELECT queries:
   - OLD: supabase.table("users").select("*").eq("email", email).execute()
   - NEW: await select("users", where={"email": email}, fetch_one=True)

3. INSERT queries:
   - OLD: supabase.table("users").insert(data).execute()
   - NEW: await insert("users", data=data, returning="*")

4. UPDATE queries:
   - OLD: supabase.table("users").update(data).eq("id", id).execute()
   - NEW: await update("users", data=data, where={"id": id}, returning="*")

5. DELETE queries:
   - OLD: supabase.table("users").delete().eq("id", id).execute()
   - NEW: await delete("users", where={"id": id})

6. Complex queries (LIKE, ILIKE, etc.):
   - Use: await execute_raw("SELECT * FROM table WHERE column ILIKE $1", "%search%")

7. Getting results:
   - OLD: result.data (list) or result.data[0] (dict)
   - NEW: Functions return dict or list[dict] directly

8. UUIDs:
   - PostgreSQL returns UUID objects, convert to string: str(uuid_value)
"""
