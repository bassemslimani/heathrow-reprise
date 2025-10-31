# 🚀 AeroWay VPS Deployment Guide

**Project:** AeroWay - Airport Navigation System
**Date:** November 1, 2025
**Deployment Status:** Production-Ready

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Provider Selection](#vps-provider-selection)
3. [Server Setup](#server-setup)
4. [Application Deployment](#application-deployment)
5. [Domain Configuration](#domain-configuration)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Production Environment](#production-environment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### What You Need Before Starting

- ✅ VPS account (DigitalOcean, Linode, AWS EC2, Vultr, etc.)
- ✅ Domain name (optional but recommended)
- ✅ SSH client (PuTTY for Windows, Terminal for Mac/Linux)
- ✅ Git installed on your local machine
- ✅ This AeroWay project ready to deploy

### Recommended VPS Specifications

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 50 GB SSD storage
- Ubuntu 22.04 LTS

**Recommended:**
- 2-4 CPU cores
- 8 GB RAM
- 100 GB SSD storage
- Ubuntu 22.04 LTS

**Estimated Cost:** $12-24/month (DigitalOcean, Linode)

---

## 2. VPS Provider Selection

### Option A: DigitalOcean (Recommended)

**Pros:**
- Easy to use
- Good documentation
- Predictable pricing
- Excellent performance

**Steps:**
1. Go to https://www.digitalocean.com
2. Create account
3. Create a Droplet:
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic ($12/month - 2GB RAM)
   - Datacenter: Choose closest to your users
   - Authentication: SSH Key (more secure) or Password
4. Note your Droplet IP address (e.g., 142.93.xxx.xxx)

### Option B: Linode

**Pros:**
- Competitive pricing
- Excellent performance
- Good support

**Steps:**
1. Go to https://www.linode.com
2. Create account
3. Create a Linode:
   - Distribution: Ubuntu 22.04 LTS
   - Plan: Nanode 2GB ($12/month)
   - Region: Choose closest location
4. Note your Linode IP address

### Option C: AWS EC2

**Pros:**
- Free tier (12 months)
- Highly scalable
- Enterprise-grade

**Cons:**
- More complex
- Variable pricing

**Steps:**
1. Go to https://aws.amazon.com
2. Create AWS account
3. Launch EC2 instance:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.small or t2.medium
   - Configure security groups (ports 22, 80, 443, 8000)
4. Note your EC2 public IP

### Option D: Vultr

**Pros:**
- Affordable
- Good performance
- Simple interface

**Steps:**
1. Go to https://www.vultr.com
2. Create account
3. Deploy server:
   - OS: Ubuntu 22.04
   - Plan: Regular Performance ($12/month)
4. Note your server IP

---

## 3. Server Setup

### Step 1: Connect to Your VPS

**Windows (using PuTTY):**
1. Download PuTTY from https://www.putty.org
2. Open PuTTY
3. Enter your VPS IP address
4. Port: 22
5. Click "Open"
6. Login as: root
7. Enter password

**Mac/Linux (using Terminal):**
```bash
ssh root@YOUR_VPS_IP
# Example: ssh root@142.93.123.456
```

### Step 2: Update System

```bash
# Update package lists
apt update

# Upgrade installed packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git vim ufw
```

### Step 3: Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser aeroway
# Enter password when prompted

# Add to sudo group
usermod -aG sudo aeroway

# Switch to new user
su - aeroway
```

### Step 4: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow backend API (temporary, will be proxied later)
sudo ufw allow 8000/tcp

# Check status
sudo ufw status
```

### Step 5: Install Docker

```bash
# Install Docker dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (avoid using sudo with docker)
sudo usermod -aG docker ${USER}

# Log out and back in for group changes to take effect
exit
# SSH back in: ssh aeroway@YOUR_VPS_IP
```

### Step 6: Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
# Should output: Docker Compose version v2.x.x
```

---

## 4. Application Deployment

### Step 1: Clone Your Repository

**Option A: From GitHub/GitLab (if you have remote repo)**
```bash
# Create application directory
cd ~
mkdir -p apps
cd apps

# Clone repository
git clone https://github.com/YOUR_USERNAME/aeroway.git
cd aeroway
```

**Option B: Upload from Local Machine (if no remote repo)**

**On your local machine:**
```bash
# Navigate to your project
cd C:\xampp\htdocs\aeronav\aerway\heathrow-reprise-main

# Create archive (excluding node_modules and venv)
tar -czf aeroway.tar.gz --exclude='node_modules' --exclude='venv' --exclude='.git' .
```

**Upload to VPS:**
```bash
# On your local machine
scp aeroway.tar.gz aeroway@YOUR_VPS_IP:~/apps/

# On VPS
ssh aeroway@YOUR_VPS_IP
cd ~/apps
mkdir aeroway
cd aeroway
tar -xzf ../aeroway.tar.gz
```

**Option C: Use Git manually**
```bash
# On your local machine, initialize git if not done
cd C:\xampp\htdocs\aeronav\aerway\heathrow-reprise-main
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub/GitLab, then:
git remote add origin https://github.com/YOUR_USERNAME/aeroway.git
git push -u origin main

# On VPS
cd ~/apps
git clone https://github.com/YOUR_USERNAME/aeroway.git
cd aeroway
```

### Step 2: Configure Environment Variables

```bash
# Navigate to backend
cd ~/apps/aeroway/backend

# Create .env file
nano .env
```

**Add the following (update values for production):**
```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=aeroway
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_123

# JWT Configuration
JWT_SECRET_KEY=CHANGE_THIS_TO_RANDOM_STRING_min_32_chars_xyz789
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server Configuration
HOST=0.0.0.0
PORT=8000
RELOAD=False
DEBUG=False

# CORS Configuration (update with your actual domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://YOUR_VPS_IP

# Database URL (for convenience)
DATABASE_URL=postgresql://postgres:CHANGE_THIS_STRONG_PASSWORD_123@postgres:5432/aeroway
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Generate a secure JWT secret:**
```bash
# Generate random secret key
openssl rand -hex 32
# Copy the output and use it for JWT_SECRET_KEY
```

### Step 3: Update Docker Compose for Production

```bash
# Edit docker-compose.yml
cd ~/apps/aeroway
nano docker-compose.yml
```

**Update the following sections:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: aeroway-postgres
    restart: always  # Changed from unless-stopped
    environment:
      - POSTGRES_DB=aeroway
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}  # Use environment variable
    ports:
      - "127.0.0.1:5432:5432"  # Only allow local connections
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - aeroway-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aeroway-backend
    restart: always  # Changed from unless-stopped
    ports:
      - "127.0.0.1:8000:8000"  # Only allow local connections
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - aeroway-network
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: aeroway-frontend
    restart: always  # Changed from unless-stopped
    ports:
      - "127.0.0.1:5173:5173"  # Only allow local connections
    environment:
      - VITE_API_URL=https://yourdomain.com/api  # Update with your domain
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    depends_on:
      - backend
    networks:
      - aeroway-network

networks:
  aeroway-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Build and Start Application

```bash
# Navigate to project root
cd ~/apps/aeroway

# Build and start containers
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# You should see:
# aeroway-postgres   Up (healthy)
# aeroway-backend    Up
# aeroway-frontend   Up

# Check logs
docker-compose logs -f

# Press Ctrl+C to stop viewing logs
```

### Step 5: Verify Application is Running

```bash
# Test backend
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"AeroWay API","version":"1.0.0"}

# Test frontend
curl http://localhost:5173
# Should return HTML content

# Check database
docker exec -it aeroway-postgres psql -U postgres -d aeroway -c "SELECT COUNT(*) FROM users;"
# Should show table exists
```

---

## 5. Domain Configuration (Optional but Recommended)

### Step 1: Purchase Domain Name

- **Namecheap:** https://www.namecheap.com (~$10/year)
- **GoDaddy:** https://www.godaddy.com
- **Google Domains:** https://domains.google
- **Cloudflare:** https://www.cloudflare.com/products/registrar/

### Step 2: Configure DNS Records

**Add these DNS records in your domain provider's panel:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_VPS_IP | 3600 |
| A | www | YOUR_VPS_IP | 3600 |
| CNAME | api | yourdomain.com | 3600 |

**Example:**
- Domain: aeroway.com
- VPS IP: 142.93.123.456

```
A     @      142.93.123.456    3600
A     www    142.93.123.456    3600
CNAME api    aeroway.com       3600
```

**Wait 5-60 minutes for DNS propagation.**

**Verify DNS:**
```bash
# On your local machine or VPS
ping yourdomain.com
# Should return your VPS IP

nslookup yourdomain.com
# Should show your VPS IP
```

---

## 6. SSL Certificate Setup (Let's Encrypt - Free)

### Step 1: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 2: Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 3: Obtain SSL Certificate

```bash
# Replace with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# 1. Enter email address
# 2. Agree to terms
# 3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Step 4: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aeroway
```

**Add the following configuration:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - React Application
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # API Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Client Max Body Size (for file uploads if needed)
    client_max_body_size 10M;
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/aeroway /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
# Should output: "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Update Frontend API URL

```bash
# Edit frontend Dockerfile to use production API URL
cd ~/apps/aeroway
nano Dockerfile.frontend
```

**Update environment variable:**
```dockerfile
ENV VITE_API_URL=https://yourdomain.com
```

**Rebuild frontend:**
```bash
docker-compose up -d --build frontend
```

---

## 7. Production Environment

### Step 1: Database Backup Setup

**Create backup script:**
```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
nano ~/backups/backup-database.sh
```

**Add the following:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=aeroway
CONTAINER_NAME=aeroway-postgres

# Create backup
docker exec $CONTAINER_NAME pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/aeroway_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "aeroway_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: aeroway_backup_$DATE.sql.gz"
```

**Make executable:**
```bash
chmod +x ~/backups/backup-database.sh
```

**Schedule daily backups:**
```bash
# Open crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * ~/backups/backup-database.sh >> ~/backups/backup.log 2>&1
```

### Step 2: Auto-Restart on Reboot

```bash
# Docker containers already have restart: always in docker-compose.yml
# Verify with:
docker inspect aeroway-backend | grep -A 3 RestartPolicy
```

### Step 3: Log Management

```bash
# Create log rotation configuration
sudo nano /etc/logrotate.d/aeroway
```

**Add:**
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### Step 4: Monitoring Setup

**Install monitoring tools:**
```bash
# Install htop for resource monitoring
sudo apt install -y htop

# Install Docker stats
# Already included with Docker

# Monitor containers
docker stats

# Monitor system resources
htop
```

---

## 8. Monitoring & Maintenance

### Daily Checks

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50

# Check disk space
df -h

# Check memory usage
free -h
```

### Weekly Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean Docker resources
docker system prune -af

# Check backup status
ls -lh ~/backups/
```

### Monthly Tasks

```bash
# Renew SSL certificate (Certbot does this automatically, but verify)
sudo certbot renew --dry-run

# Review application logs
docker-compose logs --since 720h > monthly_logs.txt

# Database optimization
docker exec -it aeroway-postgres psql -U postgres -d aeroway -c "VACUUM ANALYZE;"
```

---

## 9. Troubleshooting

### Application Not Starting

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart containers
docker-compose restart

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it aeroway-postgres psql -U postgres -d aeroway -c "SELECT 1;"

# Verify environment variables
docker exec aeroway-backend printenv | grep DB
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### High Memory Usage

```bash
# Check memory usage
docker stats --no-stream

# Restart specific container
docker-compose restart backend

# Increase VPS RAM if needed
```

### Cannot Access Application

```bash
# Check if containers are running
docker-compose ps

# Check Nginx status
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check if ports are open
sudo netstat -tulpn | grep -E ':(80|443|8000|5173)'

# Test backend directly
curl http://localhost:8000/health

# Test frontend directly
curl http://localhost:5173
```

### 502 Bad Gateway

```bash
# Backend container might be down
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Quick Deployment Checklist

- [ ] VPS created and accessible via SSH
- [ ] Docker and Docker Compose installed
- [ ] Application code uploaded to VPS
- [ ] Environment variables configured in backend/.env
- [ ] JWT secret key generated and set
- [ ] Database password changed from default
- [ ] Docker containers built and running
- [ ] Domain name purchased (optional)
- [ ] DNS records configured (if using domain)
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (if using domain)
- [ ] Firewall configured (UFW)
- [ ] Application accessible via domain or IP
- [ ] Database backup script created
- [ ] Cron job for daily backups configured
- [ ] Application tested end-to-end

---

## 📞 Support & Resources

### Documentation
- **Docker:** https://docs.docker.com
- **Nginx:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **FastAPI:** https://fastapi.tiangolo.com
- **PostgreSQL:** https://www.postgresql.org/docs/

### Community Help
- **DigitalOcean Community:** https://www.digitalocean.com/community
- **Stack Overflow:** https://stackoverflow.com
- **Docker Forums:** https://forums.docker.com

---

## 🎉 Post-Deployment

### After successful deployment:

1. **Test all features:**
   - User registration
   - User login
   - Ticket validation
   - Flight information
   - Chatbot
   - Services browsing

2. **Share with client:**
   - Frontend URL: https://yourdomain.com
   - API Documentation: https://yourdomain.com/docs
   - Admin credentials (if created)

3. **Monitor for 24-48 hours:**
   - Check logs regularly
   - Monitor resource usage
   - Verify backups are working

4. **Create documentation:**
   - Admin guide
   - User guide
   - API documentation for developers

---

**Deployment Guide Prepared by:** Claude Code
**Date:** November 1, 2025
**Project:** AeroWay - Airport Navigation System
**Status:** Ready for Production Deployment

**Estimated Deployment Time:** 2-4 hours (depending on experience level)
**Estimated Monthly Cost:** $12-24 (VPS) + $10/year (domain) + $0 (SSL)

---

## Next Steps

1. Choose your VPS provider
2. Follow this guide step-by-step
3. Test thoroughly before going live
4. Set up monitoring and backups
5. Share with your client!

Good luck with your deployment! 🚀
