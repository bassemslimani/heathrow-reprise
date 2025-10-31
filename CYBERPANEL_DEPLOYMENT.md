# 🚀 AeroWay Deployment Guide for CyberPanel VPS

**Project:** AeroWay - Airport Navigation System
**Control Panel:** CyberPanel
**Date:** November 1, 2025

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare Local Repository](#prepare-local-repository)
3. [CyberPanel Initial Setup](#cyberpanel-initial-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [SSL Certificate](#ssl-certificate)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### What You Need

- ✅ VPS with CyberPanel installed
- ✅ CyberPanel admin access (https://your-vps-ip:8090)
- ✅ SSH access to your VPS
- ✅ Domain name (optional but recommended)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ This AeroWay project

### VPS Requirements

- **OS:** CentOS/Ubuntu (CyberPanel compatible)
- **RAM:** Minimum 2GB (Recommended 4GB)
- **Storage:** 50GB+
- **CyberPanel:** Latest version
- **Python:** 3.9+ (usually pre-installed)
- **Node.js:** 18+ (need to install)

---

## 2. Prepare Local Repository

### Step 1: Initialize Git Repository

Open Command Prompt or PowerShell on your Windows machine:

```bash
# Navigate to your project
cd C:\xampp\htdocs\aeronav\aerway\heathrow-reprise-main

# Initialize Git repository
git init

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit - AeroWay complete application"
```

### Step 2: Create GitHub Repository

**Option A: Using GitHub Website**

1. Go to https://github.com
2. Click "New repository" (+ icon, top-right)
3. Repository name: `aeroway`
4. Description: "AeroWay Airport Navigation System"
5. Choose: **Private** (recommended) or Public
6. **DO NOT** initialize with README (you already have code)
7. Click "Create repository"

**Option B: Using GitHub CLI** (if installed)

```bash
gh repo create aeroway --private --source=. --remote=origin --push
```

### Step 3: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aeroway.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

### Step 4: Verify Upload

Go to https://github.com/YOUR_USERNAME/aeroway and verify all files are there.

---

## 3. CyberPanel Initial Setup

### Step 1: Access CyberPanel

Open browser and go to:
```
https://YOUR_VPS_IP:8090
```

Login with your CyberPanel credentials.

### Step 2: Create Website

1. Click **"Websites"** in left menu
2. Click **"Create Website"**
3. Fill in details:
   - **Domain Name:** `yourdomain.com` (or subdomain like `aeroway.yourdomain.com`)
   - **Email:** your@email.com
   - **Package:** Default
   - **Owner:** admin
   - **PHP:** Select latest version (not required, but good to have)
4. Click **"Create Website"**

### Step 3: Setup SSL Certificate (Free Let's Encrypt)

1. Go to **"SSL"** → **"Manage SSL"**
2. Select your domain from dropdown
3. Click **"Issue SSL"**
4. Wait 1-2 minutes for certificate to be issued
5. Verify SSL is active (https:// should work)

### Step 4: Install Required Software via SSH

Connect to your VPS via SSH:

**Windows (using PuTTY or Windows Terminal):**
```bash
ssh root@YOUR_VPS_IP
```

**Install Node.js 18+ and PM2:**
```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -   # CentOS/AlmaLinux
# OR
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -   # Ubuntu/Debian

# Install Node.js
yum install -y nodejs   # CentOS/AlmaLinux
# OR
apt install -y nodejs   # Ubuntu/Debian

# Verify installation
node --version   # Should show v18.x or higher
npm --version

# Install PM2 (process manager for Node.js)
npm install -g pm2

# Install Python packages
yum install -y python3-pip python3-devel postgresql-devel gcc   # CentOS
# OR
apt install -y python3-pip python3-dev libpq-dev gcc   # Ubuntu
```

**Install PostgreSQL:**
```bash
# CentOS/AlmaLinux
yum install -y postgresql-server postgresql-contrib
postgresql-setup --initdb
systemctl start postgresql
systemctl enable postgresql

# Ubuntu/Debian
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

---

## 4. Database Setup

### Step 1: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console, run these commands:
```

```sql
-- Create database
CREATE DATABASE aeroway;

-- Create user with password (CHANGE THE PASSWORD!)
CREATE USER aeroway_user WITH PASSWORD 'YourStrongPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aeroway TO aeroway_user;

-- Grant schema privileges
\c aeroway
GRANT ALL ON SCHEMA public TO aeroway_user;

-- Exit PostgreSQL
\q
```

### Step 2: Configure PostgreSQL Authentication

```bash
# Edit pg_hba.conf
nano /var/lib/pgsql/data/pg_hba.conf   # CentOS
# OR
nano /etc/postgresql/*/main/pg_hba.conf   # Ubuntu

# Add this line BEFORE other entries (around line 80):
# local   aeroway         aeroway_user                            md5

# Save and exit (Ctrl+X, Y, Enter)

# Restart PostgreSQL
systemctl restart postgresql
```

### Step 3: Initialize Database Schema

```bash
# Download init.sql from your repo
cd /home/YOUR_DOMAIN/public_html
mkdir -p database
cd database

# If you have the file locally, upload it via CyberPanel File Manager
# OR download from GitHub:
wget https://raw.githubusercontent.com/YOUR_USERNAME/aeroway/main/backend/database/init.sql

# Run the SQL file
psql -U aeroway_user -d aeroway -f init.sql
# Enter password when prompted: YourStrongPassword123!

# Verify tables were created
psql -U aeroway_user -d aeroway -c "\dt"
# Should show: users, flights, messages, services, spaces, notifications, meet_greet
```

---

## 5. Backend Deployment

### Step 1: Clone Repository

```bash
# Navigate to website root
cd /home/YOUR_DOMAIN/public_html

# Create backend directory
mkdir -p backend
cd backend

# Clone repository (you can clone the entire repo first)
cd /home/YOUR_DOMAIN
git clone https://github.com/YOUR_USERNAME/aeroway.git temp_repo

# Copy backend files
cp -r temp_repo/backend/* /home/YOUR_DOMAIN/public_html/backend/
cp -r temp_repo/backend/database /home/YOUR_DOMAIN/public_html/backend/
cp -r temp_repo/backend/routers /home/YOUR_DOMAIN/public_html/backend/
cp -r temp_repo/backend/models /home/YOUR_DOMAIN/public_html/backend/

# Remove temp repo
rm -rf temp_repo
```

### Step 2: Create Python Virtual Environment

```bash
# Navigate to backend
cd /home/YOUR_DOMAIN/public_html/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

```bash
# Create .env file
nano /home/YOUR_DOMAIN/public_html/backend/.env
```

**Add the following (UPDATE WITH YOUR VALUES):**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aeroway
DB_USER=aeroway_user
DB_PASSWORD=YourStrongPassword123!

# JWT Configuration (GENERATE A RANDOM SECRET!)
JWT_SECRET_KEY=YOUR_RANDOM_SECRET_KEY_CHANGE_THIS_TO_SOMETHING_SECURE_32_CHARS_MIN
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server Configuration
HOST=0.0.0.0
PORT=8000
RELOAD=False
DEBUG=False

# CORS Configuration (UPDATE WITH YOUR DOMAIN!)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database URL
DATABASE_URL=postgresql://aeroway_user:YourStrongPassword123!@localhost:5432/aeroway
```

**Save:** Ctrl+X, Y, Enter

**Generate a secure JWT secret key:**
```bash
# Generate random 32-character secret
openssl rand -hex 32
# Copy the output and paste it as JWT_SECRET_KEY in .env
```

### Step 4: Start Backend with PM2

```bash
# Make sure you're in backend directory
cd /home/YOUR_DOMAIN/public_html/backend

# Start backend with PM2
pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2" --name aeroway-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you

# Check status
pm2 status

# View logs
pm2 logs aeroway-backend
```

**Backend should now be running on port 8000!**

Test it:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"AeroWay API","version":"1.0.0"}
```

---

## 6. Frontend Deployment

### Step 1: Clone Frontend Files

```bash
# Navigate to website root
cd /home/YOUR_DOMAIN

# Clone repository if not already done
git clone https://github.com/YOUR_USERNAME/aeroway.git

# This will create /home/YOUR_DOMAIN/aeroway directory
```

### Step 2: Update Frontend API URL

```bash
# Navigate to frontend source
cd /home/YOUR_DOMAIN/aeroway/src/services

# Edit api.ts to use production URL
nano api.ts
```

Find the line with `baseURL` and change it to:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://yourdomain.com/api';
```

**OR** create environment file:
```bash
cd /home/YOUR_DOMAIN/aeroway
nano .env.production
```

Add:
```env
VITE_API_URL=https://yourdomain.com/api
```

### Step 3: Build Frontend

```bash
# Navigate to project root
cd /home/YOUR_DOMAIN/aeroway

# Install dependencies
npm install

# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 4: Deploy Frontend to Public Directory

```bash
# Remove default CyberPanel files
rm -rf /home/YOUR_DOMAIN/public_html/*

# Copy built files to public_html
cp -r /home/YOUR_DOMAIN/aeroway/dist/* /home/YOUR_DOMAIN/public_html/

# Set correct permissions
chown -R YOUR_DOMAIN:YOUR_DOMAIN /home/YOUR_DOMAIN/public_html
chmod -R 755 /home/YOUR_DOMAIN/public_html
```

### Step 5: Configure OpenLiteSpeed for SPA

CyberPanel uses OpenLiteSpeed. We need to configure it for React Router:

**Create .htaccess file:**
```bash
nano /home/YOUR_DOMAIN/public_html/.htaccess
```

**Add:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>
```

**Save:** Ctrl+X, Y, Enter

---

## 7. Configure Reverse Proxy for Backend API

We need to configure OpenLiteSpeed to proxy `/api` requests to the backend on port 8000.

### Option 1: Using CyberPanel Interface (Easier)

1. Login to CyberPanel
2. Go to **"Websites"** → **"List Websites"**
3. Click **"Manage"** next to your domain
4. Click **"Rewrite Rules"**
5. Add this configuration:

```
RewriteEngine On

# Proxy API requests to backend
RewriteCond %{REQUEST_URI} ^/api(.*)$ [OR]
RewriteCond %{REQUEST_URI} ^/docs(.*)$ [OR]
RewriteCond %{REQUEST_URI} ^/redoc(.*)$ [OR]
RewriteCond %{REQUEST_URI} ^/health(.*)$
RewriteRule ^(.*)$ http://127.0.0.1:8000/$1 [P,L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

6. Click **"Save Rewrite Rules"**

### Option 2: Manual Configuration (Advanced)

```bash
# Find your website's vhost config
nano /usr/local/lsws/conf/vhosts/YOUR_DOMAIN/vhost.conf
```

Add this context before the closing `</virtualHost>`:

```
context /api {
  type                    proxy
  handler                 http://127.0.0.1:8000
  addDefaultCharset       off
}

context /docs {
  type                    proxy
  handler                 http://127.0.0.1:8000
  addDefaultCharset       off
}

context /health {
  type                    proxy
  handler                 http://127.0.0.1:8000
  addDefaultCharset       off
}
```

**Restart OpenLiteSpeed:**
```bash
systemctl restart lsws
```

---

## 8. Testing & Verification

### Step 1: Test Backend API

```bash
# From SSH
curl https://yourdomain.com/api
# Should return API information

curl https://yourdomain.com/health
# Should return: {"status":"healthy"...}

# Test API docs
# Open browser: https://yourdomain.com/docs
```

### Step 2: Test Frontend

Open browser and go to:
```
https://yourdomain.com
```

You should see the AeroWay application!

### Step 3: Test Full User Flow

1. **Register a user:**
   - Click "Register" / "S'inscrire"
   - Fill in form and submit
   - Should receive success message

2. **Login:**
   - Use registered credentials
   - Should redirect to dashboard

3. **Validate ticket:**
   - Choose "Passenger" mode
   - Enter ticket: `AF1234` or `BA567` or `EK123` or `LH890`
   - Should show flight information

4. **Test Chatbot:**
   - Click chatbot icon
   - Send message: "Where is the cafe?"
   - Should receive response

5. **Browse Services:**
   - Click "Services" or category buttons
   - Should display services from database

### Step 4: Check Database

```bash
# Connect to database
psql -U aeroway_user -d aeroway

# Check if user was created
SELECT email, nom, prenom, role FROM users;

# Check messages
SELECT COUNT(*) FROM messages;

# Exit
\q
```

---

## 9. Troubleshooting

### Frontend shows "Cannot reach backend"

**Check backend is running:**
```bash
pm2 status
pm2 logs aeroway-backend
```

**Restart backend:**
```bash
pm2 restart aeroway-backend
```

**Check if port 8000 is accessible:**
```bash
curl http://localhost:8000/health
```

### Backend not starting

**Check logs:**
```bash
pm2 logs aeroway-backend --lines 100
```

**Common issues:**
- Database connection failed → Check credentials in `.env`
- Port 8000 in use → Change to different port (8001, 8002)
- Import errors → Reinstall dependencies: `pip install -r requirements.txt`

**Manual test:**
```bash
cd /home/YOUR_DOMAIN/public_html/backend
source venv/bin/activate
python main.py
# Check for errors
```

### Database connection errors

**Test database connection:**
```bash
psql -U aeroway_user -d aeroway -c "SELECT 1;"
```

**If fails:**
- Check password in `.env` matches database password
- Check pg_hba.conf allows md5 authentication
- Restart PostgreSQL: `systemctl restart postgresql`

### 404 errors on frontend routes

This means the rewrite rules aren't working.

**Check .htaccess:**
```bash
cat /home/YOUR_DOMAIN/public_html/.htaccess
```

**Ensure OpenLiteSpeed rewrite is enabled in CyberPanel.**

### SSL not working

**Reissue certificate:**
1. CyberPanel → SSL → Manage SSL
2. Select domain
3. Click "Issue SSL"

**Or via command line:**
```bash
/root/.acme.sh/acme.sh --issue -d yourdomain.com --webroot /home/YOUR_DOMAIN/public_html
```

---

## 10. Maintenance Commands

### View Backend Logs
```bash
pm2 logs aeroway-backend
pm2 logs aeroway-backend --lines 100
```

### Restart Backend
```bash
pm2 restart aeroway-backend
```

### Stop Backend
```bash
pm2 stop aeroway-backend
```

### Update Application
```bash
# Pull latest changes
cd /home/YOUR_DOMAIN/aeroway
git pull origin main

# Rebuild frontend
npm install
npm run build
cp -r dist/* /home/YOUR_DOMAIN/public_html/

# Restart backend
pm2 restart aeroway-backend
```

### Database Backup
```bash
# Create backup
pg_dump -U aeroway_user -d aeroway > /home/YOUR_DOMAIN/backup_$(date +%Y%m%d).sql

# Restore backup
psql -U aeroway_user -d aeroway < /home/YOUR_DOMAIN/backup_20250101.sql
```

### Setup Automated Backups
```bash
# Create backup script
nano /home/YOUR_DOMAIN/backup.sh
```

**Add:**
```bash
#!/bin/bash
BACKUP_DIR="/home/YOUR_DOMAIN/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U aeroway_user aeroway > $BACKUP_DIR/aeroway_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "aeroway_*.sql" -mtime +7 -delete

echo "Backup completed: aeroway_$DATE.sql"
```

**Make executable:**
```bash
chmod +x /home/YOUR_DOMAIN/backup.sh
```

**Add to crontab (daily at 2 AM):**
```bash
crontab -e

# Add line:
0 2 * * * /home/YOUR_DOMAIN/backup.sh >> /home/YOUR_DOMAIN/backup.log 2>&1
```

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] VPS with CyberPanel accessible
- [ ] Domain added in CyberPanel
- [ ] SSL certificate issued
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Database created and initialized
- [ ] Backend files deployed
- [ ] Backend .env configured with correct credentials
- [ ] Backend running via PM2
- [ ] Backend accessible at http://localhost:8000
- [ ] Frontend built (`npm run build`)
- [ ] Frontend deployed to public_html
- [ ] Rewrite rules configured (API proxy + SPA routing)
- [ ] Application accessible at https://yourdomain.com
- [ ] User registration tested
- [ ] User login tested
- [ ] Ticket validation tested
- [ ] Chatbot tested
- [ ] Database backup configured

---

## 📊 Architecture Overview

```
Internet
   ↓
OpenLiteSpeed (Port 443 - HTTPS)
   ↓
   ├─→ / → Frontend (React SPA from /public_html)
   └─→ /api → Reverse Proxy → Backend (Python FastAPI on port 8000)
                                  ↓
                            PostgreSQL (port 5432)
```

---

## 🎉 Success!

After following this guide, your AeroWay application should be:

✅ Live at https://yourdomain.com
✅ Backend API at https://yourdomain.com/api
✅ API docs at https://yourdomain.com/docs
✅ SSL secured
✅ Database-backed
✅ Auto-restarting on crashes (PM2)
✅ Automated backups configured

---

**Estimated Deployment Time:** 1-3 hours (depending on experience)
**Monthly Cost:** $10-30 (VPS with CyberPanel) + $10/year (domain)

---

## Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs aeroway-backend`
2. Check OpenLiteSpeed error log: `/usr/local/lsws/logs/error.log`
3. Test backend directly: `curl http://localhost:8000/health`
4. Check database connection: `psql -U aeroway_user -d aeroway`

**Prepared by:** Claude Code
**Date:** November 1, 2025
**Project:** AeroWay - Airport Navigation System
