# 📤 How to Push AeroWay to GitHub

## Quick Start - Step by Step

### Step 1: Open Command Prompt

Press `Windows + R`, type `cmd`, press Enter

### Step 2: Navigate to Your Project

```bash
cd C:\xampp\htdocs\aeronav\aerway\heathrow-reprise-main
```

### Step 3: Initialize Git (if not already done)

```bash
git init
```

### Step 4: Add All Files

```bash
git add .
```

### Step 5: Create First Commit

```bash
git commit -m "Initial commit - AeroWay complete application with backend and frontend"
```

### Step 6: Create GitHub Repository

**Go to GitHub:**
1. Open browser: https://github.com
2. Login to your account
3. Click the **+** icon (top right)
4. Click **"New repository"**
5. Repository name: **`aeroway`**
6. Description: **"AeroWay Airport Navigation System - Full Stack Application"**
7. Choose: **Private** (recommended) or **Public**
8. **DO NOT** check "Add a README file" (we already have code)
9. Click **"Create repository"**

### Step 7: Connect Local Repository to GitHub

**After creating the repo, GitHub shows you commands. Use these:**

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/aeroway.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**You'll be asked for credentials:**
- Username: Your GitHub username
- Password: Use **Personal Access Token** (not your GitHub password)

### Step 8: Create Personal Access Token (if needed)

If GitHub asks for password and it doesn't work:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: "AeroWay deployment"
4. Expiration: 90 days (or longer)
5. Select scopes: Check **"repo"** (all sub-items)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)
8. Use this token as your password when pushing

### Step 9: Verify Upload

Go to https://github.com/YOUR_USERNAME/aeroway

You should see all your files!

---

## What Gets Uploaded (and what doesn't)

### ✅ WILL be uploaded:
- All source code (`src/`, `backend/`)
- Configuration files (`package.json`, `requirements.txt`, etc.)
- Documentation files (`.md` files)
- Database schema (`backend/database/init.sql`)

### ❌ WON'T be uploaded (thanks to .gitignore):
- `node_modules/` (too large, can be reinstalled)
- `backend/venv/` (Python virtual env, can be recreated)
- `.env` files (secrets - NEVER upload these!)
- `dist/` (build output)
- `__pycache__/` (Python cache)

This is correct! You'll reinstall dependencies on the server.

---

## Updating Code Later

After making changes:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

---

## Example with YOUR Details

**Replace these placeholders:**
- `YOUR_USERNAME` → Your GitHub username (e.g., `johndoe`)
- `aeroway` → Your repository name (can be different)

**Full example:**
```bash
cd C:\xampp\htdocs\aeronav\aerway\heathrow-reprise-main
git init
git add .
git commit -m "Initial commit - AeroWay complete application"
git remote add origin https://github.com/johndoe/aeroway.git
git branch -M main
git push -u origin main
```

---

## Troubleshooting

### Error: "git: command not found"

**Install Git:**
1. Download: https://git-scm.com/download/win
2. Install with default settings
3. Restart Command Prompt
4. Try again

### Error: "remote origin already exists"

```bash
# Remove old remote
git remote remove origin

# Add new one
git remote add origin https://github.com/YOUR_USERNAME/aeroway.git
```

### Error: "failed to push some refs"

```bash
# Force push (only if this is a new repo)
git push -u origin main --force
```

### Authentication Failed

Use **Personal Access Token** instead of password (see Step 8 above).

---

## Next Steps After Pushing

1. ✅ Code is on GitHub
2. 📖 Read `CYBERPANEL_DEPLOYMENT.md`
3. 🚀 Deploy to your VPS following the guide
4. 🎉 Your app will be live!

---

**Created by:** Claude Code
**Date:** November 1, 2025
