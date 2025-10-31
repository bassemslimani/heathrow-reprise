"""
PostgreSQL database client configuration using asyncpg
"""
import os
import asyncpg
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Build from individual components if DATABASE_URL not provided
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "aeroway")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Connection pool
_pool: Optional[asyncpg.Pool] = None


async def init_db():
    """Initialize database connection pool"""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
    return _pool


async def close_db():
    """Close database connection pool"""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def get_pool() -> asyncpg.Pool:
    """Get database connection pool"""
    if _pool is None:
        await init_db()
    return _pool


@asynccontextmanager
async def get_db_connection():
    """Get a database connection from the pool"""
    pool = await get_pool()
    async with pool.acquire() as connection:
        yield connection


# Helper functions for database operations

async def execute_query(
    query: str,
    *args,
    fetch_one: bool = False,
    fetch_all: bool = False
) -> Optional[Any]:
    """
    Execute a database query

    Args:
        query: SQL query string
        *args: Query parameters
        fetch_one: Return single row
        fetch_all: Return all rows

    Returns:
        Query result or None
    """
    async with get_db_connection() as conn:
        if fetch_one:
            return await conn.fetchrow(query, *args)
        elif fetch_all:
            return await conn.fetch(query, *args)
        else:
            return await conn.execute(query, *args)


async def insert(table: str, data: Dict[str, Any], returning: str = "*") -> Optional[Dict]:
    """
    Insert a row into a table

    Args:
        table: Table name
        data: Dictionary of column:value pairs
        returning: Columns to return (default: *)

    Returns:
        Inserted row as dictionary
    """
    columns = ", ".join(data.keys())
    placeholders = ", ".join(f"${i+1}" for i in range(len(data)))
    values = list(data.values())

    query = f"""
        INSERT INTO {table} ({columns})
        VALUES ({placeholders})
        RETURNING {returning}
    """

    row = await execute_query(query, *values, fetch_one=True)
    return dict(row) if row else None


async def select(
    table: str,
    columns: str = "*",
    where: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
    fetch_one: bool = False
) -> Optional[Any]:
    """
    Select rows from a table

    Args:
        table: Table name
        columns: Columns to select (default: *)
        where: Dictionary of column:value pairs for WHERE clause
        order_by: ORDER BY clause
        limit: LIMIT value
        fetch_one: Return only one row

    Returns:
        List of rows as dictionaries or single row
    """
    query = f"SELECT {columns} FROM {table}"
    values = []

    if where:
        where_clauses = []
        for i, (key, value) in enumerate(where.items(), 1):
            where_clauses.append(f"{key} = ${i}")
            values.append(value)
        query += f" WHERE {' AND '.join(where_clauses)}"

    if order_by:
        query += f" ORDER BY {order_by}"

    if limit:
        query += f" LIMIT {limit}"

    if fetch_one:
        row = await execute_query(query, *values, fetch_one=True)
        return dict(row) if row else None
    else:
        rows = await execute_query(query, *values, fetch_all=True)
        return [dict(row) for row in rows]


async def update(
    table: str,
    data: Dict[str, Any],
    where: Dict[str, Any],
    returning: str = "*"
) -> Optional[Dict]:
    """
    Update rows in a table

    Args:
        table: Table name
        data: Dictionary of column:value pairs to update
        where: Dictionary of column:value pairs for WHERE clause
        returning: Columns to return (default: *)

    Returns:
        Updated row as dictionary
    """
    set_clauses = []
    values = []

    for i, (key, value) in enumerate(data.items(), 1):
        set_clauses.append(f"{key} = ${i}")
        values.append(value)

    where_clauses = []
    for key, value in where.items():
        where_clauses.append(f"{key} = ${len(values) + 1}")
        values.append(value)

    query = f"""
        UPDATE {table}
        SET {', '.join(set_clauses)}
        WHERE {' AND '.join(where_clauses)}
        RETURNING {returning}
    """

    row = await execute_query(query, *values, fetch_one=True)
    return dict(row) if row else None


async def delete(table: str, where: Dict[str, Any]) -> bool:
    """
    Delete rows from a table

    Args:
        table: Table name
        where: Dictionary of column:value pairs for WHERE clause

    Returns:
        True if rows were deleted
    """
    where_clauses = []
    values = []

    for i, (key, value) in enumerate(where.items(), 1):
        where_clauses.append(f"{key} = ${i}")
        values.append(value)

    query = f"DELETE FROM {table} WHERE {' AND '.join(where_clauses)}"

    result = await execute_query(query, *values)
    return result is not None


async def execute_raw(query: str, *args) -> Any:
    """
    Execute a raw SQL query

    Args:
        query: SQL query string
        *args: Query parameters

    Returns:
        Query result
    """
    return await execute_query(query, *args, fetch_all=True)


# Transaction support
@asynccontextmanager
async def transaction():
    """Context manager for database transactions"""
    async with get_db_connection() as conn:
        async with conn.transaction():
            yield conn
