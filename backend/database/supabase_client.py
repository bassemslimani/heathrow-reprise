"""
Supabase database client configuration
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate environment variables
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase_client() -> Client:
    """
    Get the Supabase client instance

    Returns:
        Client: Supabase client
    """
    return supabase


# Database helper functions
async def execute_query(table: str, operation: str, **kwargs):
    """
    Execute a database query

    Args:
        table: Table name
        operation: Operation type (select, insert, update, delete)
        **kwargs: Additional parameters for the operation

    Returns:
        Query result
    """
    try:
        query = supabase.table(table)

        if operation == "select":
            result = query.select(kwargs.get("columns", "*"))
            if "filters" in kwargs:
                for key, value in kwargs["filters"].items():
                    result = result.eq(key, value)
            return result.execute()

        elif operation == "insert":
            return query.insert(kwargs.get("data", {})).execute()

        elif operation == "update":
            result = query.update(kwargs.get("data", {}))
            if "filters" in kwargs:
                for key, value in kwargs["filters"].items():
                    result = result.eq(key, value)
            return result.execute()

        elif operation == "delete":
            result = query.delete()
            if "filters" in kwargs:
                for key, value in kwargs["filters"].items():
                    result = result.eq(key, value)
            return result.execute()

        else:
            raise ValueError(f"Unknown operation: {operation}")

    except Exception as e:
        raise Exception(f"Database operation failed: {str(e)}")
