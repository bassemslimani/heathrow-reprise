"""
Flights router - handles flight information and queries
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from models import (
    FlightResponse,
    FlightCreate,
    FlightUpdate,
    FlightStatus
)
from auth_utils import get_optional_current_user, TokenData
from database import select, insert, update, delete, execute_raw

router = APIRouter(prefix="/api/flights", tags=["Flights"])


@router.get("", response_model=List[FlightResponse])
async def get_all_flights(
    status_filter: Optional[FlightStatus] = Query(None, description="Filter by flight status"),
    terminal: Optional[str] = Query(None, description="Filter by terminal"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    current_user: Optional[TokenData] = Depends(get_optional_current_user)
):
    """
    Get all flights with optional filtering

    Args:
        status_filter: Optional status filter
        terminal: Optional terminal filter
        limit: Maximum number of results
        current_user: Optional current user

    Returns:
        List[FlightResponse]: List of flights

    Raises:
        HTTPException: If query fails
    """
    try:
        # Build where clause
        where = {}
        if status_filter:
            where["status"] = status_filter.value
        if terminal:
            where["terminal"] = terminal

        # Fetch flights with filters
        flights_data = await select(
            "flights",
            where=where if where else None,
            order_by="departure_time ASC",
            limit=limit
        )

        flights = [
            FlightResponse(
                id=flight["id"],
                flight_number=flight["flight_number"],
                airline=flight["airline"],
                origin=flight.get("origin"),
                destination=flight.get("destination"),
                departure_time=flight.get("departure_time"),
                arrival_time=flight.get("arrival_time"),
                gate=flight.get("gate"),
                terminal=flight.get("terminal"),
                status=flight["status"],
                boarding_time=flight.get("boarding_time"),
                baggage_claim=flight.get("baggage_claim"),
                created_at=flight["created_at"],
                updated_at=flight.get("updated_at")
            )
            for flight in flights_data
        ]

        return flights

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch flights: {str(e)}"
        )


@router.get("/{flight_number}", response_model=FlightResponse)
async def get_flight_by_number(
    flight_number: str,
    current_user: Optional[TokenData] = Depends(get_optional_current_user)
):
    """
    Get flight information by flight number

    Args:
        flight_number: Flight number
        current_user: Optional current user

    Returns:
        FlightResponse: Flight information

    Raises:
        HTTPException: If flight not found
    """
    try:
        flight = await select(
            "flights",
            where={"flight_number": flight_number.upper()},
            fetch_one=True
        )

        if not flight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flight {flight_number} not found"
            )

        return FlightResponse(
            id=flight["id"],
            flight_number=flight["flight_number"],
            airline=flight["airline"],
            origin=flight.get("origin"),
            destination=flight.get("destination"),
            departure_time=flight.get("departure_time"),
            arrival_time=flight.get("arrival_time"),
            gate=flight.get("gate"),
            terminal=flight.get("terminal"),
            status=flight["status"],
            boarding_time=flight.get("boarding_time"),
            baggage_claim=flight.get("baggage_claim"),
            created_at=flight["created_at"],
            updated_at=flight.get("updated_at")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch flight: {str(e)}"
        )


@router.get("/user/my-flight", response_model=FlightResponse)
async def get_user_flight(current_user: TokenData = Depends(get_optional_current_user)):
    """
    Get flight information for the current user based on their ticket number

    Args:
        current_user: Current authenticated user

    Returns:
        FlightResponse: User's flight information

    Raises:
        HTTPException: If user has no ticket or flight not found
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        # Get user's ticket number
        user = await select(
            "users",
            columns=["ticket_number"],
            where={"id": current_user.user_id},
            fetch_one=True
        )

        if not user or not user.get("ticket_number"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No ticket number associated with this account"
            )

        ticket_number = user["ticket_number"]

        # Find flight by ticket number (assuming ticket number contains flight number)
        flights = await execute_raw(
            "SELECT * FROM flights WHERE flight_number ILIKE $1",
            f"%{ticket_number}%"
        )

        if not flights:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flight not found for your ticket"
            )

        flight = flights[0]

        return FlightResponse(
            id=flight["id"],
            flight_number=flight["flight_number"],
            airline=flight["airline"],
            origin=flight.get("origin"),
            destination=flight.get("destination"),
            departure_time=flight.get("departure_time"),
            arrival_time=flight.get("arrival_time"),
            gate=flight.get("gate"),
            terminal=flight.get("terminal"),
            status=flight["status"],
            boarding_time=flight.get("boarding_time"),
            baggage_claim=flight.get("baggage_claim"),
            created_at=flight["created_at"],
            updated_at=flight.get("updated_at")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user flight: {str(e)}"
        )


@router.get("/arrivals/search", response_model=List[FlightResponse])
async def search_arrivals(
    origin: Optional[str] = Query(None, description="Search by origin city"),
    flight_number: Optional[str] = Query(None, description="Search by flight number"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results")
):
    """
    Search for arrival flights

    Args:
        origin: Origin city to filter by
        flight_number: Flight number to search for
        limit: Maximum number of results

    Returns:
        List[FlightResponse]: List of matching arrival flights

    Raises:
        HTTPException: If search fails
    """
    try:
        # Build query with ILIKE filters
        conditions = ["arrival_time IS NOT NULL"]
        params = []
        param_count = 1

        if origin:
            conditions.append(f"origin ILIKE ${param_count}")
            params.append(f"%{origin}%")
            param_count += 1

        if flight_number:
            conditions.append(f"flight_number ILIKE ${param_count}")
            params.append(f"%{flight_number}%")
            param_count += 1

        where_clause = " AND ".join(conditions)
        query = f"SELECT * FROM flights WHERE {where_clause} ORDER BY arrival_time ASC LIMIT {limit}"

        flights_data = await execute_raw(query, *params)

        flights = [
            FlightResponse(
                id=flight["id"],
                flight_number=flight["flight_number"],
                airline=flight["airline"],
                origin=flight.get("origin"),
                destination=flight.get("destination"),
                departure_time=flight.get("departure_time"),
                arrival_time=flight.get("arrival_time"),
                gate=flight.get("gate"),
                terminal=flight.get("terminal"),
                status=flight["status"],
                boarding_time=flight.get("boarding_time"),
                baggage_claim=flight.get("baggage_claim"),
                created_at=flight["created_at"],
                updated_at=flight.get("updated_at")
            )
            for flight in flights_data
        ]

        return flights

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search arrivals: {str(e)}"
        )


@router.post("", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
async def create_flight(flight_data: FlightCreate):
    """
    Create a new flight (Admin only - add authentication later)

    Args:
        flight_data: Flight creation data

    Returns:
        FlightResponse: Created flight

    Raises:
        HTTPException: If creation fails
    """
    try:
        # Check if flight already exists
        existing_flight = await select(
            "flights",
            where={"flight_number": flight_data.flight_number},
            fetch_one=True
        )

        if existing_flight:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Flight number already exists"
            )

        # Prepare flight data
        flight_dict = flight_data.model_dump()
        flight_dict["created_at"] = datetime.utcnow()
        flight_dict["updated_at"] = datetime.utcnow()

        # Insert flight
        flight = await insert("flights", data=flight_dict, returning="*")

        if not flight:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create flight"
            )

        return FlightResponse(**flight)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create flight: {str(e)}"
        )


@router.patch("/{flight_number}", response_model=FlightResponse)
async def update_flight(flight_number: str, flight_data: FlightUpdate):
    """
    Update flight information (Admin only - add authentication later)

    Args:
        flight_number: Flight number
        flight_data: Flight update data

    Returns:
        FlightResponse: Updated flight

    Raises:
        HTTPException: If update fails
    """
    try:
        # Prepare update data (exclude None values)
        update_dict = {k: v for k, v in flight_data.model_dump().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()

        # Update flight
        flight = await update(
            "flights",
            data=update_dict,
            where={"flight_number": flight_number.upper()},
            returning="*"
        )

        if not flight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flight {flight_number} not found"
            )

        return FlightResponse(**flight)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update flight: {str(e)}"
        )
