# CORS Troubleshooting Guide

## ✅ Check These in Railway

### 1. Verify Latest Deployment
- Go to **Railway Dashboard** → Your Service → **Deployments**
- Check the **latest deployment commit hash**
- Should match: `179d651` (Fix CORS configuration)
- If not, wait 1-2 minutes for auto-deploy

### 2. Check CORS_ORIGINS Variable
- Go to **Railway** → Your Service → **Variables**
- Verify `CORS_ORIGINS` is set to: `https://flow-audit.vercel.app`
- **NO trailing slash** - must be exactly: `https://flow-audit.vercel.app`
- **NOT**: `https://flow-audit.vercel.app/` ❌

### 3. Check Build Logs
- Railway → Deployments → Latest → **Build** tab
- Look for: `Successfully installed anthropic`
- Should show successful build

### 4. Check Runtime Logs
- Railway → Deployments → Latest → **Logs** tab
- When you submit the form, do you see:
  - `OPTIONS /api/submit-assessment` requests?
  - Any error messages?
  - Nothing at all? (means request isn't reaching server)

### 5. Test CORS Debug Endpoint
Visit in browser:
```
https://flowaudit-production.up.railway.app/api/cors-debug
```

Should show:
```json
{
  "cors_origins_env": "https://flow-audit.vercel.app",
  "allowed_origins": ["https://flow-audit.vercel.app"],
  "request_origin": "https://flow-audit.vercel.app"
}
```

## 🔧 Quick Fixes

### Fix 1: Update CORS_ORIGINS
1. Railway → Variables
2. Edit `CORS_ORIGINS`
3. Set to: `https://flow-audit.vercel.app` (no trailing slash)
4. Save and wait for redeploy

### Fix 2: Force Redeploy
1. Railway → Deployments
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

### Fix 3: Check Service Name
- Make sure you're checking the **backend service** logs
- Not the PostgreSQL service logs

## 🧪 Manual Test

Test CORS with this command (in Git Bash or WSL):
```bash
curl -X OPTIONS https://flowaudit-production.up.railway.app/api/submit-assessment \
  -H "Origin: https://flow-audit.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Look for these headers in response:
- `Access-Control-Allow-Origin: https://flow-audit.vercel.app`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`

## 📋 Current Configuration

**Code:** `backend/app.py` lines 47-75
- Uses Flask-CORS with `origins=allowed_origins`
- Has `after_request` handler as backup
- Supports multiple origins from `CORS_ORIGINS` env var

**Expected Railway Variable:**
```
CORS_ORIGINS=https://flow-audit.vercel.app
```

