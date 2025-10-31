"""
Services router - handles services, spaces, and meet & greet functionality
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import random
import string

from models import (
    ServiceResponse,
    ServiceCategory,
    SpaceResponse,
    SpaceCategory,
    MeetGreetCreate,
    MeetGreetUpdate,
    MeetGreetResponse,
    MeetGreetStatus,
    TrackingCodeValidate,
    SuccessResponse
)
from auth_utils import get_current_user, get_optional_current_user, TokenData
from database import select, insert, update, delete, execute_raw

router = APIRouter(prefix="/api", tags=["Services"])


# ============ Services Endpoints ============

@router.get("/services", response_model=List[ServiceResponse])
async def get_all_services(
    category: Optional[ServiceCategory] = Query(None, description="Filter by category"),
    terminal: Optional[str] = Query(None, description="Filter by terminal"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """
    Get all airport services with optional filtering

    Args:
        category: Optional category filter
        terminal: Optional terminal filter
        limit: Maximum number of results

    Returns:
        List[ServiceResponse]: List of services

    Raises:
        HTTPException: If query fails
    """
    try:
        # Build where clause
        where = {}
        if category:
            where["category"] = category.value
        if terminal:
            where["terminal"] = terminal

        services_data = await select(
            "services",
            where=where if where else None,
            limit=limit
        )

        services = [
            ServiceResponse(
                id=service["id"],
                name=service["name"],
                category=service["category"],
                location=service["location"],
                terminal=service.get("terminal"),
                description=service.get("description"),
                opening_hours=service.get("opening_hours"),
                image_url=service.get("image_url"),
                created_at=service["created_at"]
            )
            for service in services_data
        ]

        return services

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch services: {str(e)}"
        )


@router.get("/services/{category}", response_model=List[ServiceResponse])
async def get_services_by_category(category: ServiceCategory):
    """
    Get services by category (shops, restaurants, cafes, lounges, etc.)

    Args:
        category: Service category

    Returns:
        List[ServiceResponse]: List of services in the category

    Raises:
        HTTPException: If query fails
    """
    try:
        services_data = await select(
            "services",
            where={"category": category.value}
        )

        services = [
            ServiceResponse(
                id=service["id"],
                name=service["name"],
                category=service["category"],
                location=service["location"],
                terminal=service.get("terminal"),
                description=service.get("description"),
                opening_hours=service.get("opening_hours"),
                image_url=service.get("image_url"),
                created_at=service["created_at"]
            )
            for service in services_data
        ]

        return services

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch services by category: {str(e)}"
        )


# ============ Spaces Endpoints ============

@router.get("/spaces", response_model=List[SpaceResponse])
async def get_all_spaces(
    category: Optional[SpaceCategory] = Query(None, description="Filter by category"),
    terminal: Optional[str] = Query(None, description="Filter by terminal"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """
    Get all airport spaces with optional filtering

    Args:
        category: Optional category filter
        terminal: Optional terminal filter
        limit: Maximum number of results

    Returns:
        List[SpaceResponse]: List of spaces

    Raises:
        HTTPException: If query fails
    """
    try:
        # Build where clause
        where = {}
        if category:
            where["category"] = category.value
        if terminal:
            where["terminal"] = terminal

        spaces_data = await select(
            "spaces",
            where=where if where else None,
            limit=limit
        )

        spaces = [
            SpaceResponse(
                id=space["id"],
                name=space["name"],
                category=space["category"],
                location=space["location"],
                terminal=space.get("terminal"),
                description=space.get("description"),
                opening_hours=space.get("opening_hours"),
                image_url=space.get("image_url"),
                coordinates=space.get("coordinates"),
                created_at=space["created_at"]
            )
            for space in spaces_data
        ]

        return spaces

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch spaces: {str(e)}"
        )


# ============ Meet & Greet Endpoints ============

def generate_tracking_code() -> str:
    """
    Generate a unique 6-character tracking code

    Returns:
        str: Tracking code
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("/meet-greet/generate", response_model=MeetGreetResponse, status_code=status.HTTP_201_CREATED)
async def generate_meet_greet_code(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate a Meet & Greet tracking code for the current user

    Args:
        current_user: Current authenticated user

    Returns:
        MeetGreetResponse: Meet & Greet tracking information

    Raises:
        HTTPException: If generation fails
    """
    try:
        # Get user information
        user = await select(
            "users",
            where={"id": current_user.user_id},
            fetch_one=True
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        passenger_name = f"{user['prenom']} {user['nom']}"

        # Try to find user's flight if they have a ticket
        flight_id = None
        if user.get("ticket_number"):
            flights = await execute_raw(
                "SELECT id FROM flights WHERE flight_number ILIKE $1",
                f"%{user['ticket_number']}%"
            )

            if flights:
                flight_id = flights[0]["id"]

        # Check if user already has an active Meet & Greet code
        existing_code = await select(
            "meet_greet",
            where={
                "passenger_id": current_user.user_id,
                "status": MeetGreetStatus.ACTIVE.value
            },
            fetch_one=True
        )

        if existing_code:
            # Return existing code if still valid
            if existing_code.get("expires_at"):
                expires_at = datetime.fromisoformat(existing_code["expires_at"])
                if expires_at > datetime.utcnow():
                    return MeetGreetResponse(**existing_code)

        # Generate new unique tracking code
        tracking_code = generate_tracking_code()

        # Ensure uniqueness
        while True:
            check_result = await select(
                "meet_greet",
                columns=["id"],
                where={"tracking_code": tracking_code},
                fetch_one=True
            )

            if not check_result:
                break

            tracking_code = generate_tracking_code()

        # Create Meet & Greet entry
        meet_greet_data = {
            "tracking_code": tracking_code,
            "passenger_id": current_user.user_id,
            "passenger_name": passenger_name,
            "flight_id": flight_id,
            "current_location": "Check-in",
            "status": MeetGreetStatus.ACTIVE.value,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "last_updated": datetime.utcnow()
        }

        created = await insert("meet_greet", data=meet_greet_data, returning="*")

        if not created:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate tracking code"
            )

        return MeetGreetResponse(**created)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Meet & Greet code: {str(e)}"
        )


@router.post("/meet-greet/track", response_model=MeetGreetResponse)
async def track_passenger(tracking_data: TrackingCodeValidate):
    """
    Track a passenger using their Meet & Greet code

    Args:
        tracking_data: Tracking code validation data

    Returns:
        MeetGreetResponse: Passenger tracking information

    Raises:
        HTTPException: If code is invalid or expired
    """
    try:
        tracking_info = await select(
            "meet_greet",
            where={"tracking_code": tracking_data.tracking_code.upper()},
            fetch_one=True
        )

        if not tracking_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid tracking code"
            )

        # Check if code is expired
        if tracking_info.get("expires_at"):
            expires_at = datetime.fromisoformat(tracking_info["expires_at"])
            if expires_at < datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tracking code has expired"
                )

        # Check if code is active
        if tracking_info["status"] != MeetGreetStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tracking code is {tracking_info['status']}"
            )

        return MeetGreetResponse(**tracking_info)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track passenger: {str(e)}"
        )


@router.get("/meet-greet/track/{tracking_code}", response_model=MeetGreetResponse)
async def track_passenger_by_code(tracking_code: str):
    """
    Track a passenger using their Meet & Greet code (GET method for easier frontend use)

    Args:
        tracking_code: Tracking code

    Returns:
        MeetGreetResponse: Passenger tracking information

    Raises:
        HTTPException: If code is invalid or expired
    """
    return await track_passenger(TrackingCodeValidate(tracking_code=tracking_code))


@router.patch("/meet-greet/{tracking_code}", response_model=MeetGreetResponse)
async def update_passenger_location(
    tracking_code: str,
    update_data: MeetGreetUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update passenger location (for the passenger to update their own location)

    Args:
        tracking_code: Tracking code
        update_data: Update data
        current_user: Current authenticated user

    Returns:
        MeetGreetResponse: Updated tracking information

    Raises:
        HTTPException: If update fails or unauthorized
    """
    try:
        # Verify tracking code belongs to current user
        tracking_info = await select(
            "meet_greet",
            where={"tracking_code": tracking_code.upper()},
            fetch_one=True
        )

        if not tracking_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tracking code not found"
            )

        if tracking_info["passenger_id"] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own tracking information"
            )

        # Prepare update data
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        update_dict["last_updated"] = datetime.utcnow()

        # Update tracking information
        updated = await update(
            "meet_greet",
            data=update_dict,
            where={"tracking_code": tracking_code.upper()},
            returning="*"
        )

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update tracking information"
            )

        return MeetGreetResponse(**updated)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update passenger location: {str(e)}"
        )


@router.delete("/meet-greet/{tracking_code}", response_model=SuccessResponse)
async def deactivate_meet_greet(
    tracking_code: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Deactivate a Meet & Greet tracking code

    Args:
        tracking_code: Tracking code
        current_user: Current authenticated user

    Returns:
        SuccessResponse: Success message

    Raises:
        HTTPException: If deactivation fails or unauthorized
    """
    try:
        # Verify tracking code belongs to current user
        tracking_info = await select(
            "meet_greet",
            where={"tracking_code": tracking_code.upper()},
            fetch_one=True
        )

        if not tracking_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tracking code not found"
            )

        if tracking_info["passenger_id"] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only deactivate your own tracking code"
            )

        # Update status to completed
        await update(
            "meet_greet",
            data={
                "status": MeetGreetStatus.COMPLETED.value,
                "last_updated": datetime.utcnow()
            },
            where={"tracking_code": tracking_code.upper()}
        )

        return SuccessResponse(
            success=True,
            message="Meet & Greet tracking code deactivated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate tracking code: {str(e)}"
        )
