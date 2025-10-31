# Migration from Supabase to PostgreSQL

This guide explains how AeroWay has been migrated from Supabase to self-hosted PostgreSQL with Docker.

## Why PostgreSQL Instead of Supabase?

**Benefits of using PostgreSQL with Docker:**
- ✅ **Full Control**: Complete control over your database
- ✅ **No External Dependencies**: Everything runs locally or on your server
- ✅ **Docker Compatible**: Easy to deploy with docker-compose
- ✅ **Cost Effective**: No cloud service fees
- ✅ **Portable**: Move your entire stack anywhere
- ✅ **Privacy**: Data stays on your infrastructure

## What Changed?

### 1. Database Client

**Before (Supabase):**
```python
from database.supabase_client import supabase

result = supabase.table("users").select("*").eq("email", email).execute()
user = result.data[0] if result.data else None
```

**After (PostgreSQL):**
```python
from database import select

user = await select("users", where={"email": email}, fetch_one=True)
```

### 2. Dependencies

**Removed:**
- supabase==2.11.1
- postgrest==0.19.0

**Added:**
- asyncpg==0.29.0 (async PostgreSQL driver)
- psycopg2-binary==2.9.10 (sync PostgreSQL driver)
- sqlalchemy==2.0.35 (ORM, optional)
- alembic==1.14.0 (database migrations)

### 3. Environment Variables

**Before (.env):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

**After (.env):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aeroway

# OR use individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aeroway
DB_USER=postgres
DB_PASSWORD=postgres
```

## Setup Instructions

### Option 1: Using Docker (Recommended)

This is the easiest way - everything runs in containers!

```bash
# 1. Navigate to project root
cd /path/to/aeroway

# 2. Create backend/.env file
cp backend/.env.example backend/.env

# 3. Edit backend/.env and set JWT_SECRET_KEY
# Generate a secret key:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 4. Start everything with Docker
docker-compose up --build

# That's it! The database, backend, and frontend will all start automatically
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Option 2: Local Development (Without Docker)

If you want to run without Docker:

#### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Start PostgreSQL service
net start postgresql
```

**macOS:**
```bash
# Using Homebrew:
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install postgresql-16

# Start service:
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aeroway;

# Exit psql
\q
```

#### Step 3: Run Migration SQL

```bash
# Run the init SQL script
psql -U postgres -d aeroway -f backend/database/init.sql
```

#### Step 4: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and configure:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aeroway
# JWT_SECRET_KEY=your-secret-key

# Run backend
python main.py
```

#### Step 5: Setup Frontend

```bash
# In a new terminal, go to project root
cd /path/to/aeroway

# Install dependencies
npm install

# Run frontend
npm run dev
```

## Database API Usage

The new PostgreSQL client provides simple async functions:

### SELECT - Fetch Data

```python
from database import select

# Get one user
user = await select(
    table="users",
    where={"email": "user@example.com"},
    fetch_one=True
)

# Get all flights
flights = await select(
    table="flights",
    columns="id, flight_number, status",
    where={"terminal": "A"},
    order_by="departure_time DESC",
    limit=10
)

# Get all (no filters)
all_users = await select("users")
```

### INSERT - Create Data

```python
from database import insert

# Insert a new user
new_user = await insert(
    table="users",
    data={
        "email": "user@example.com",
        "nom": "Doe",
        "prenom": "John",
        "password_hash": hashed_password,
        "telephone": "+1234567890",
        "role": "passenger",
        "created_at": datetime.utcnow()
    },
    returning="*"  # Returns the created row
)

print(new_user["id"])  # Access the UUID
```

### UPDATE - Modify Data

```python
from database import update

# Update user
updated_user = await update(
    table="users",
    data={
        "ticket_number": "AF1234",
        "updated_at": datetime.utcnow()
    },
    where={"id": user_id},
    returning="*"
)
```

### DELETE - Remove Data

```python
from database import delete

# Delete a user
success = await delete(
    table="users",
    where={"id": user_id}
)
```

### RAW SQL - Complex Queries

For complex queries (LIKE, ILIKE, JOIN, etc.):

```python
from database import execute_raw

# Search flights
flights = await execute_raw(
    "SELECT * FROM flights WHERE flight_number ILIKE $1 LIMIT 10",
    f"%{search_term}%"
)

# Join query
results = await execute_raw("""
    SELECT u.*, f.flight_number, f.departure_time
    FROM users u
    LEFT JOIN flights f ON u.ticket_number = f.flight_number
    WHERE u.role = $1
""", "passenger")
```

## Migrating Your Existing Routers

### Step-by-Step Migration

1. **Update imports:**

```python
# OLD
from database.supabase_client import supabase

# NEW
from database import select, insert, update, delete, execute_raw
```

2. **Replace SELECT queries:**

```python
# OLD
result = supabase.table("users").select("*").eq("email", email).execute()
user = result.data[0] if result.data else None

# NEW
user = await select("users", where={"email": email}, fetch_one=True)
```

3. **Replace INSERT queries:**

```python
# OLD
result = supabase.table("users").insert(user_data).execute()
created_user = result.data[0]

# NEW
created_user = await insert("users", data=user_data, returning="*")
```

4. **Replace UPDATE queries:**

```python
# OLD
result = supabase.table("users").update(data).eq("id", user_id).execute()
updated_user = result.data[0]

# NEW
updated_user = await update("users", data=data, where={"id": user_id}, returning="*")
```

5. **Replace DELETE queries:**

```python
# OLD
supabase.table("users").delete().eq("id", user_id).execute()

# NEW
await delete("users", where={"id": user_id})
```

### Example: Full Router Migration

See `backend/routers/auth_postgres_example.py` for a complete example of how the auth router has been migrated.

## Updating Existing Routers

You need to update these files to use the new database client:

- ✅ `routers/auth.py` - Example provided in `auth_postgres_example.py`
- ⏳ `routers/flights.py` - Needs migration
- ⏳ `routers/chatbot.py` - Needs migration
- ⏳ `routers/services.py` - Needs migration

**Quick migration template:**

```python
# At the top of each router file, replace:
from database.supabase_client import supabase

# With:
from database import select, insert, update, delete, execute_raw

# Then update all database calls using the examples above
```

## Testing Your Migration

### 1. Test Database Connection

```bash
# Start backend
cd backend
python main.py

# You should see:
# ✅ Database connection pool initialized
```

### 2. Test API Endpoints

```bash
# Test user registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "nom": "Test",
    "prenom": "User",
    "password": "password123",
    "telephone": "+1234567890",
    "role": "passenger"
  }'
```

### 3. Check Database

```bash
# Connect to PostgreSQL
docker exec -it aeroway-postgres psql -U postgres -d aeroway

# Or if running locally:
psql -U postgres -d aeroway

# Query users
SELECT * FROM users;

# Query flights
SELECT * FROM flights;

# Exit
\q
```

## Troubleshooting

### Issue: "Connection refused" to PostgreSQL

**Solution:**
- Check PostgreSQL is running: `docker ps` or `systemctl status postgresql`
- Verify DATABASE_URL in .env matches your setup
- Check firewall isn't blocking port 5432

### Issue: "relation does not exist"

**Solution:**
- Run the migration SQL: `psql -U postgres -d aeroway -f backend/database/init.sql`
- Or if using Docker: Restart containers: `docker-compose down -v && docker-compose up`

### Issue: "asyncpg.exceptions.InvalidPasswordError"

**Solution:**
- Check DB_USER and DB_PASSWORD in .env
- Verify PostgreSQL user password: `ALTER USER postgres PASSWORD 'postgres';`

### Issue: Import errors in routers

**Solution:**
- Make sure all database imports are updated from Supabase to PostgreSQL
- Run `pip install -r requirements.txt` to ensure all dependencies are installed

## Docker Commands Reference

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Execute commands in container
docker-compose exec backend python
docker-compose exec postgres psql -U postgres -d aeroway

# Restart a service
docker-compose restart backend
```

## Database Backup & Restore

### Backup

```bash
# Using Docker
docker-compose exec postgres pg_dump -U postgres aeroway > backup.sql

# Locally
pg_dump -U postgres aeroway > backup.sql
```

### Restore

```bash
# Using Docker
docker-compose exec -T postgres psql -U postgres aeroway < backup.sql

# Locally
psql -U postgres aeroway < backup.sql
```

## Next Steps

1. ✅ Migrate remaining routers (`flights.py`, `chatbot.py`, `services.py`)
2. ✅ Test all API endpoints
3. ✅ Update frontend if needed (should work without changes)
4. ✅ Run full integration tests
5. ✅ Deploy to production with Docker

## Production Deployment Tips

- Use strong passwords in production (not "postgres")
- Set `DB_PASSWORD` via environment variables, not in .env
- Use PostgreSQL SSL connections for remote databases
- Set up automated database backups
- Use a volume mount for persistent data
- Monitor database performance and connections
- Consider using a connection pooler like PgBouncer for high traffic

---

**You're now running AeroWay with self-hosted PostgreSQL! 🎉**

For questions, check the main README.md or API documentation at `/docs`.
