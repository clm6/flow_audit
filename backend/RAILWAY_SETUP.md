# Railway Setup Checklist

## ✅ Verify These Settings in Railway

### 1. Root Directory
- Go to **Settings** → **Source**
- **Root Directory** must be: `backend`
- This tells Railway where your `requirements.txt` is located

### 2. Build Command
- Go to **Settings** → **Build**
- **Build Command** should be: `pip install -r requirements.txt`
- Or leave blank (Railway auto-detects Python projects)

### 3. Start Command
- Go to **Settings** → **Deploy**
- **Start Command** should be: `gunicorn app:app`
- Or leave blank if you have a `Procfile` (which you do!)

### 4. Check Build Logs
- Go to **Deployments** → Click latest deployment
- Click **Build** tab (not Runtime)
- Look for: `Collecting anthropic` and `Successfully installed anthropic`

### 5. If Build Fails
- Check Python version matches `runtime.txt` (python-3.11)
- Verify `requirements.txt` is in `backend/` folder
- Check for any syntax errors in requirements.txt

## Current requirements.txt Location
✅ `backend/requirements.txt` (correct location)

## Current requirements.txt Contents
```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
anthropic>=0.18.0
reportlab==4.0.7
python-dotenv==1.0.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
```

## Manual Build Command (if needed)
If Railway isn't auto-detecting, manually set:
```
pip install --upgrade pip && pip install -r requirements.txt
```

