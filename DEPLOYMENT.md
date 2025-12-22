# Deployment Guide - Career Flow Diagnostic Tool

Complete step-by-step deployment instructions for various hosting platforms.

## 🚀 Recommended Stack

**Best for Quick Launch:**
- Backend: Railway (free tier available)
- Frontend: Vercel (free)
- Database: Railway PostgreSQL (included)
- Total Cost: Free to start, ~$5/month when scaling

## Option 1: Railway (Recommended - Easiest)

Railway provides everything you need in one platform with zero configuration.

### Backend Deployment

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Configure Backend Service**
   ```bash
   # Railway will auto-detect Flask, but add these files:
   ```
   
   Create `Procfile` in `/backend`:
   ```
   web: gunicorn app:app
   ```
   
   Create `runtime.txt` in `/backend`:
   ```
   python-3.11
   ```

4. **Add Environment Variables**
   In Railway dashboard → Variables:
   ```
   ANTHROPIC_API_KEY=your_key_here
   FLASK_ENV=production
   SECRET_KEY=generate_random_32_char_string
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SENDER_EMAIL=your_email@gmail.com
   SENDER_PASSWORD=your_app_password
   ```

5. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway auto-creates `DATABASE_URL` variable
   
   Update `app.py` to use it:
   ```python
   import os
   
   database_url = os.environ.get('DATABASE_URL')
   if database_url and database_url.startswith('postgres://'):
       database_url = database_url.replace('postgres://', 'postgresql://', 1)
   
   app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///career_flow.db'
   ```

6. **Deploy**
   - Railway auto-deploys on push to main branch
   - Get your public URL from Railway dashboard

### Frontend Deployment

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select `/frontend` as root directory

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variable**
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app
   ```

5. **Deploy**
   - Vercel auto-deploys on push
   - Your app will be live at `your-app.vercel.app`

### Total Time: ~15 minutes

---

## Option 2: Render (Good Alternative)

Similar to Railway but with slightly different interface.

### Backend on Render

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Name: career-flow-api
   - Root Directory: backend
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

3. **Add Environment Variables**
   Same as Railway list above

4. **Add PostgreSQL**
   - Click "New" → "PostgreSQL"
   - Create database
   - Copy internal database URL
   - Add as `DATABASE_URL` env variable

### Frontend on Render

1. **Create Static Site**
   - Click "New" → "Static Site"
   - Connect repository
   - Root Directory: frontend
   - Build Command: `npm install && npm run build`
   - Publish Directory: build

2. **Add Environment Variable**
   ```
   REACT_APP_API_URL=https://career-flow-api.onrender.com
   ```

### Total Time: ~20 minutes

---

## Option 3: DigitalOcean App Platform

### Backend + Frontend Together

1. **Sign up at [digitalocean.com](https://digitalocean.com)**

2. **Create New App**
   - Apps → Create App
   - Select GitHub repository
   - DigitalOcean auto-detects components

3. **Configure Backend Component**
   ```
   Type: Web Service
   Source Directory: /backend
   Build Command: pip install -r requirements.txt
   Run Command: gunicorn app:app
   HTTP Port: 5000
   ```

4. **Configure Frontend Component**
   ```
   Type: Static Site
   Source Directory: /frontend
   Build Command: npm install && npm run build
   Output Directory: build
   ```

5. **Add Database**
   - Add Component → Database
   - Select PostgreSQL
   - DigitalOcean handles DATABASE_URL automatically

6. **Set Environment Variables**
   - Add all backend env vars
   - Add `REACT_APP_API_URL` for frontend

### Cost: ~$12/month (includes database)

---

## Option 4: Heroku (Classic Choice)

### Backend

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from heroku.com
   ```

2. **Login and Create App**
   ```bash
   cd backend
   heroku login
   heroku create career-flow-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set FLASK_ENV=production
   heroku config:set SECRET_KEY=your_secret
   heroku config:set SMTP_SERVER=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SENDER_EMAIL=your_email
   heroku config:set SENDER_PASSWORD=your_password
   ```

5. **Deploy**
   ```bash
   git push heroku main
   heroku open
   ```

### Frontend on Vercel
Follow Vercel instructions from Option 1

### Cost: ~$7/month (Heroku Eco Dynos)

---

## Option 5: AWS (Advanced - Most Scalable)

### Backend on Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   cd backend
   eb init -p python-3.11 career-flow-api
   eb create career-flow-api-prod
   ```

3. **Configure Database**
   - Create RDS PostgreSQL instance
   - Add DATABASE_URL to EB environment

4. **Set Environment Variables**
   ```bash
   eb setenv ANTHROPIC_API_KEY=xxx FLASK_ENV=production ...
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync build/ s3://your-bucket-name
   ```

3. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Enable HTTPS
   - Configure custom domain

### Cost: ~$20-50/month (depends on usage)

---

## Post-Deployment Checklist

### 1. Test Complete Flow
```bash
# Test backend health
curl https://your-backend-url.com/health

# Test frontend
curl https://your-frontend-url.com
```

### 2. Verify Email Delivery
- Submit test assessment
- Check email inbox and spam
- Verify PDF attachment

### 3. Test Admin Dashboard
- Access /admin route
- Verify assessment list loads
- Download sample report

### 4. Configure Custom Domain

**For Vercel (Frontend):**
```bash
# In Vercel dashboard
Settings → Domains → Add Domain
# Follow DNS configuration steps
```

**For Railway (Backend):**
```bash
# In Railway dashboard
Settings → Domains → Add Domain
# Update DNS records
```

### 5. Setup SSL/HTTPS
Most platforms (Vercel, Railway, Render) provide automatic SSL.
If using custom setup, use [Let's Encrypt](https://letsencrypt.org/).

### 6. Configure CORS
Update `app.py`:
```python
from flask_cors import CORS

# Production domains
ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]

CORS(app, origins=ALLOWED_ORIGINS)
```

### 7. Enable Monitoring

**Sentry (Error Tracking):**
```bash
pip install sentry-sdk[flask]
```

```python
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production"
)
```

**LogRocket (Session Replay):**
```javascript
// In frontend App.js
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### 8. Setup Analytics

**Google Analytics:**
```javascript
// In frontend public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Plausible (Privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## Environment-Specific Configs

### Development
```env
FLASK_ENV=development
DEBUG=True
ANTHROPIC_API_KEY=test_key
DATABASE_URL=sqlite:///career_flow.db
```

### Staging
```env
FLASK_ENV=staging
DEBUG=False
ANTHROPIC_API_KEY=prod_key
DATABASE_URL=postgresql://staging-db
```

### Production
```env
FLASK_ENV=production
DEBUG=False
ANTHROPIC_API_KEY=prod_key
DATABASE_URL=postgresql://prod-db
SENTRY_DSN=your_sentry_dsn
```

---

## Backup Strategy

### Database Backups

**Railway/Render:**
- Automated daily backups included
- Manual backup: Download from dashboard

**DigitalOcean:**
```bash
# Setup automatic backups in dashboard
# Cost: +20% of database cost
```

**AWS RDS:**
```bash
# Enable automated backups
# Retention: 7-35 days
# Point-in-time recovery available
```

### Manual Backup
```bash
# PostgreSQL
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# SQLite
sqlite3 career_flow.db .dump > backup_$(date +%Y%m%d).sql
```

---

## Scaling Considerations

### When to Scale

**Triggers:**
- Response time > 2 seconds
- Database queries > 1 second
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 80%

### Scaling Options

**Vertical (More Power):**
- Upgrade dyno/instance size
- Cost: Linear increase

**Horizontal (More Instances):**
- Add load balancer
- Multiple backend instances
- Cost: Per instance

**Database Scaling:**
- Connection pooling
- Read replicas
- Caching layer (Redis)

### CDN for Static Assets
- Use Cloudflare for frontend
- Reduces server load
- Improves global performance

---

## Troubleshooting Deployment

### Build Fails
```bash
# Check logs
heroku logs --tail  # Heroku
railway logs  # Railway
```

### Database Connection Issues
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### CORS Errors
```python
# Add to backend app.py
CORS(app, origins=['https://your-frontend-domain.com'])
```

### 502 Bad Gateway
- Check backend is running
- Verify correct port binding
- Check environment variables
- Review application logs

---

## Cost Optimization

### Free Tier Strategy
- Railway: Free for first project
- Vercel: Free for personal projects
- Anthropic API: Pay per use (~$3/1000 assessments)
- **Total: ~$3/month for 1000 assessments**

### Budget-Conscious ($10-15/month)
- Railway: $5 (includes database)
- Vercel: Free
- Email: Free (Gmail/SendGrid free tier)
- Anthropic API: ~$3-10
- **Total: ~$8-15/month**

### Production Scale ($50-100/month)
- Railway/Render: $20-30
- Database: $15-25
- CDN: Free (Cloudflare)
- Monitoring: Free tier (Sentry/LogRocket)
- Anthropic API: ~$10-30
- **Total: ~$50-100/month for 10K+ assessments**

---

## Next Steps After Deployment

1. ✅ Test complete user flow
2. ✅ Configure custom domain
3. ✅ Setup SSL/HTTPS
4. ✅ Enable monitoring
5. ✅ Configure analytics
6. ✅ Setup automated backups
7. ✅ Create status page
8. ✅ Document admin procedures
9. ✅ Plan scaling strategy
10. ✅ Launch marketing campaign!

---

## Support Resources

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)

---

**Ready to deploy? Start with Railway + Vercel for the fastest path to production!**
