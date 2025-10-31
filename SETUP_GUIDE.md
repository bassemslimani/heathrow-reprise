# AeroWay Setup Guide

Quick step-by-step guide to get AeroWay running locally.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Supabase account created
- [ ] Git installed

## Step 1: Supabase Database Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to **Project Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key)

5. Go to **SQL Editor** in the left sidebar
6. Open the file `backend/database/migration.sql` from your project
7. Copy the entire content and paste it in the SQL Editor
8. Click **Run** to create all tables and sample data
9. You should see "Success. No rows returned" - this is correct!

## Step 2: Backend Setup

Open a terminal and run:

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# Create .env file from template
# On Windows:
copy .env.example .env
# On macOS/Linux:
cp .env.example .env
```

Now edit the `backend/.env` file:

```env
SUPABASE_URL=paste_your_project_url_here
SUPABASE_KEY=paste_your_anon_key_here
JWT_SECRET_KEY=change_this_to_something_random_and_secure
```

To generate a secure JWT secret key, run:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Start the backend server:
```bash
python main.py
```

You should see:
```
🚀 AeroWay API starting...
📝 Documentation available at: /docs
```

**Test it:** Open `http://localhost:8000/docs` in your browser - you should see the API documentation!

## Step 3: Frontend Setup

Open a NEW terminal (keep backend running) and run:

```bash
# Navigate to project root (if you're in backend folder)
cd ..

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Test it:** Open `http://localhost:5173` in your browser - you should see the AeroWay welcome page!

## Step 4: Test the Integration

1. Open `http://localhost:5173`
2. Click "Get Started"
3. Click "Register" to create a new account
4. Fill in the registration form
5. If registration succeeds, you'll be logged in automatically!
6. Try the passenger or visitor interface

## Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Frontend loads without errors
- [ ] Can register a new user
- [ ] Can login
- [ ] Can see flight information

## Common Issues & Solutions

### Issue: "Supabase connection error"
**Solution:**
- Check that SUPABASE_URL and SUPABASE_KEY are correct in `backend/.env`
- Make sure there are no extra spaces or quotes
- Verify the URL starts with `https://` and ends with `.supabase.co`

### Issue: "Module not found" in Python
**Solution:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: "Cannot connect to backend" in frontend
**Solution:**
- Make sure backend is running (check terminal)
- Verify `VITE_API_URL=http://localhost:8000` in frontend `.env`
- Check browser console for CORS errors

### Issue: "Port already in use"
**Solution:**
- Backend (port 8000): Kill the process using that port
- Frontend (port 5173): Vite will ask to use another port automatically

### Issue: Tables not created in Supabase
**Solution:**
- Go to Supabase SQL Editor
- Click on "History" to see if the migration ran
- If failed, check error message
- Try running the migration SQL again

## Next Steps

After successful setup:

1. **Explore the API**: Visit `http://localhost:8000/docs` to see all endpoints
2. **Test features**:
   - Register as a passenger
   - Validate a ticket (use flight numbers from sample data: AF1234, BA567, EK123, LH890)
   - Generate a Meet & Greet code
   - Try the chatbot
3. **Check the database**: Go to Supabase → Table Editor to see your data
4. **Customize**: Start modifying the frontend components or add new API endpoints

## Sample Data

The migration includes sample data you can use for testing:

**Sample Flights:**
- AF1234 - Paris to Heathrow (Terminal A, Gate A5)
- BA567 - Heathrow to New York (Terminal B, Gate B12)
- EK123 - Dubai to Heathrow (Terminal B, Gate B8)
- LH890 - Frankfurt to Heathrow (Terminal A, Gate A10)

**Sample Services:**
- Duty Free World - Terminal A
- Starbucks Coffee - Terminal B
- Executive Lounge - Terminal A
- The Grain Store - Terminal B

## Development Tips

1. **Backend Changes:** The backend auto-reloads when you save Python files
2. **Frontend Changes:** Vite hot-reloads automatically
3. **Database Changes:** Run new SQL in Supabase SQL Editor
4. **API Testing:** Use the Swagger UI at `/docs` to test endpoints
5. **Debugging:** Check terminal logs for both frontend and backend

## Getting Help

- Check the main README.md for detailed documentation
- API documentation: http://localhost:8000/docs
- Supabase logs: Supabase Dashboard → Logs
- Browser console: F12 → Console tab

## Docker Alternative (Optional)

If you prefer using Docker:

```bash
# Make sure backend/.env is configured
# Then run:
docker-compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

---

Happy coding! 🚀
