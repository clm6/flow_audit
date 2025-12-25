# Ollama Service for Railway

This service runs Ollama on Railway to provide AI analysis for the Career Flow Diagnostic Tool.

## 🚀 Deployment on Railway

### Step 1: Create Ollama Service

1. **Go to your Railway project dashboard**
2. **Click "+ New"** → **"Empty Service"**
3. **Name it:** `ollama-service` (or any name you prefer)
4. **Connect to GitHub:**
   - Click "Deploy from GitHub repo"
   - Select your repository: `clm6/flow_audit`
   - Set **Root Directory** to: `ollama`
5. **Railway will auto-detect the Dockerfile and deploy**

### Step 2: Configure Environment Variables

In the **ollama-service** → **Variables** tab, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `OLLAMA_MODEL` | `llama3.2` | Model to use (default: llama3.2) |

**Optional models:**
- `llama3.2` - Fast, good quality (recommended, ~2GB)
- `llama3` - Better quality, slower (~4.7GB)
- `mistral` - Fast and efficient (~4GB)
- `codellama` - Good for technical content (~3.8GB)

### Step 3: Wait for Model Download

- The startup script will automatically pull the model
- Check **Deploy Logs** to see progress
- First deployment takes 5-10 minutes (model download)
- Subsequent deployments are faster

### Step 4: Connect Backend to Ollama

1. **Go to your backend service** → **Variables**
2. **Add/Update:**
   - `OLLAMA_API_URL` = `http://ollama-service:11434`
     - Replace `ollama-service` with your actual service name if different
   - `OLLAMA_MODEL` = `llama3.2` (should match what you set in Ollama service)

### Step 5: Verify Connection

1. **Check Ollama service logs** - should show "Ollama is ready!"
2. **Test backend** - submit a form and check if it connects

## 🔧 Railway Internal Service URLs

Railway services can communicate internally using service names:
- Format: `http://SERVICE_NAME:PORT`
- Example: `http://ollama-service:11434`
- No need for public URLs - services are on the same network

## 📊 Resource Requirements

Ollama needs:
- **Memory:** At least 4GB RAM (8GB recommended)
- **Storage:** 5-10GB for models
- **CPU:** 2+ cores recommended

Railway will auto-scale, but monitor usage in the **Metrics** tab.

## 🐛 Troubleshooting

**Model not downloading?**
- Check Deploy Logs for errors
- Verify `OLLAMA_MODEL` variable is set correctly
- Try a smaller model first (llama3.2)

**Backend can't connect?**
- Verify service name matches in `OLLAMA_API_URL`
- Check both services are in the same Railway project
- Look for connection errors in backend logs

**Out of memory?**
- Use a smaller model (llama3.2 instead of llama3)
- Upgrade Railway plan if needed

