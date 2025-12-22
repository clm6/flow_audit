# Career Flow Diagnostic Tool

A full-stack web application for assessing STEM professionals' career positioning and generating AI-powered compensation analysis reports.

## 🎯 Overview

The Career Flow Diagnostic Tool helps STEM professionals discover opportunities to increase their compensation by 10-30% through strategic positioning. It features:

- **Multi-step assessment** covering compensation, technical skills, positioning, and alignment
- **AI-powered analysis** using Claude API to generate personalized insights
- **Professional PDF reports** with compensation gap analysis and 90-day roadmaps
- **Email delivery** of reports directly to users
- **Admin dashboard** for viewing submissions and analytics
- **Lead generation** system for career coaching services

## 🏗️ Architecture

### Backend (Python/Flask)
- RESTful API endpoints
- SQLite database (easily upgradable to PostgreSQL)
- Claude API integration for report generation
- PDF creation with ReportLab
- Email delivery system
- Admin analytics

### Frontend (React)
- Progressive multi-step form
- Real-time validation
- Responsive design
- Professional UI with animations
- Admin dashboard for managing submissions

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
- Anthropic API key
- Email account for SMTP (Gmail recommended)

## 🚀 Quick Start

### 1. Clone and Setup Backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_specific_password
FLASK_ENV=development
SECRET_KEY=your_secret_key_here
```

**Important:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### 3. Initialize Database and Start Backend

```bash
# Database will be created automatically on first run
python app.py
```

Backend runs on `http://localhost:5000`

### 4. Setup and Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### 5. Access the Application

- **User Assessment**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (add routing in production)
- **API Health Check**: http://localhost:5000/health

## 📊 API Endpoints

### Public Endpoints

**POST** `/api/submit-assessment`
- Submit completed assessment
- Triggers Claude analysis, PDF generation, and email delivery
- Returns success confirmation and assessment ID

**GET** `/api/download-report/<assessment_id>`
- Download PDF report for specific assessment
- Returns PDF file

### Admin Endpoints

**GET** `/api/admin/assessments`
- List all assessments with summary data
- Returns array of assessment objects

**GET** `/api/admin/assessment/<assessment_id>`
- Get detailed assessment including full analysis
- Returns complete assessment object with Claude analysis

## 🎨 Customization

### Branding
Edit these files to customize branding:
- `frontend/src/App.js` - Update logo, tagline, and copy
- `frontend/src/App.css` - Modify colors in CSS variables
- `backend/app.py` - Update email templates and sender info

### Assessment Questions
Modify assessment structure in `frontend/src/App.js`:
- Add/remove questions in each step component
- Update database schema in `backend/app.py` if adding fields

### Claude Analysis
Customize analysis prompt in `backend/app.py` > `generate_claude_analysis()`:
- Adjust analysis focus areas
- Modify report structure
- Change tone and positioning

### PDF Report Design
Edit report layout in `backend/app.py` > `generate_pdf_report()`:
- Modify sections and formatting
- Adjust styles and colors
- Add company logo/branding

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (16 characters) as `SENDER_PASSWORD` in .env

### Other SMTP Providers
Update `.env` with your provider's settings:
```env
SMTP_SERVER=smtp.yourprovider.com
SMTP_PORT=587
SENDER_EMAIL=your_email@domain.com
SENDER_PASSWORD=your_password
```

## 🗄️ Database

### SQLite (Development)
- Automatically created as `career_flow.db`
- No additional setup required
- Perfect for development and testing

### PostgreSQL (Production)
Update connection string in `app.py`:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/career_flow'
```

## 🚢 Deployment

### Backend Deployment (Heroku, Railway, Render)

1. **Add Procfile**:
```
web: gunicorn app:app
```

2. **Set Environment Variables** in platform dashboard:
- All variables from `.env` file
- `FLASK_ENV=production`

3. **Deploy**:
```bash
git push heroku main
```

### Frontend Deployment (Vercel, Netlify, CloudFlare Pages)

1. **Build for production**:
```bash
npm run build
```

2. **Update API endpoint** in `App.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

3. **Set environment variable**:
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Full-Stack Deployment Options

**Option 1: Separate Hosting**
- Backend: Railway, Render, or Heroku
- Frontend: Vercel or Netlify
- Database: Managed PostgreSQL (Railway, Render, or Supabase)

**Option 2: Single Platform**
- Deploy both on Railway or Render
- Use platform's built-in database
- Configure routing for SPA

**Option 3: VPS**
- Use DigitalOcean, Linode, or AWS EC2
- Setup nginx as reverse proxy
- Configure SSL with Let's Encrypt

## 🔧 Production Checklist

### Security
- [ ] Change `SECRET_KEY` to strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Add rate limiting to API endpoints
- [ ] Implement authentication for admin routes
- [ ] Sanitize user inputs
- [ ] Add CORS restrictions

### Performance
- [ ] Enable database connection pooling
- [ ] Add caching for frequently accessed data
- [ ] Optimize PDF generation
- [ ] Implement request queuing for Claude API
- [ ] Add CDN for static assets
- [ ] Enable gzip compression

### Monitoring
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Add analytics tracking
- [ ] Monitor API response times
- [ ] Track email delivery rates
- [ ] Setup uptime monitoring
- [ ] Create backup strategy for database

### Legal
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement GDPR compliance (if applicable)
- [ ] Add cookie consent (if using analytics)
- [ ] Create data retention policy

## 💰 Cost Estimation

### Development (Free Tier)
- Anthropic API: ~$0.003 per assessment
- Email: Free (Gmail)
- Hosting: Free (Render, Railway free tiers)

### Production (Monthly)
- Anthropic API: ~$3 per 1,000 assessments
- Database: $7-15 (managed PostgreSQL)
- Backend hosting: $7-20
- Frontend hosting: Free (Vercel/Netlify)
- Email service: Free up to 100/day (SendGrid, Mailgun)

**Total: ~$15-40/month for 1,000 assessments**

## 🎯 Marketing Integration

### Lead Capture
- Assessment data automatically stored
- Email addresses collected for follow-up
- Segment leads by compensation gap size

### CRM Integration
Add to `backend/app.py` after successful submission:
```python
# Example: HubSpot integration
import requests
hubspot_url = "https://api.hubapi.com/contacts/v1/contact"
requests.post(hubspot_url, json={
    "email": assessment.email,
    "properties": {
        "compensation_gap": gap_amount,
        "role": assessment.role
    }
})
```

### Calendar Integration
Add Calendly link in `CompleteStep` component:
```javascript
<a href="https://calendly.com/your-link/strategy-session">
  Schedule Strategy Session
</a>
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Complete full assessment flow
- [ ] Verify PDF report generation
- [ ] Check email delivery
- [ ] Test admin dashboard
- [ ] Verify mobile responsiveness
- [ ] Test with various input data
- [ ] Check error handling

## 📈 Analytics & Metrics

Track these KPIs:
- Assessment completion rate
- Average time to complete
- Most common positioning gaps
- Compensation gap distribution
- Email open rates
- Strategy session conversion rate

## 🐛 Troubleshooting

### Email Not Sending
1. Check SMTP credentials
2. Verify firewall/port access
3. Check spam folder
4. Review error logs
5. Test with different email provider

### Claude API Errors
1. Verify API key is valid
2. Check rate limits
3. Review prompt length
4. Monitor API status page
5. Implement retry logic

### PDF Generation Issues
1. Check ReportLab installation
2. Verify font availability
3. Test with minimal data
4. Review error logs
5. Check file permissions

### Database Connection Errors
1. Verify database file permissions
2. Check connection string
3. Ensure SQLAlchemy version compatibility
4. Review migration status
5. Test with SQLite browser

## 📚 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Flask Documentation](https://flask.palletsprojects.com)
- [React Documentation](https://react.dev)
- [ReportLab Documentation](https://docs.reportlab.com)

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review error logs
3. Test in isolation
4. Create minimal reproduction case

## 📄 License

Proprietary - All rights reserved

## 🎉 Next Steps

1. **Test the complete flow**: Submit a test assessment and verify email delivery
2. **Customize branding**: Update colors, copy, and logo to match your brand
3. **Configure analytics**: Add tracking to measure conversion rates
4. **Deploy to production**: Choose hosting platform and deploy
5. **Market your tool**: Share on social media and engineering communities

---

Built with ❤️ for Career Flow Framework by Craig
