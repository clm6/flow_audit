# Career Flow Diagnostic Tool - Project Structure

## 📁 Complete File Structure

```
career-flow-diagnostic/
│
├── 📄 README.md                    # Main documentation
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 setup.sh                     # Automated setup script
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 backend/                     # Python Flask Backend
│   ├── 📄 app.py                   # Main Flask application
│   ├── 📄 requirements.txt         # Python dependencies
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 Procfile                 # Heroku/Railway deployment
│   ├── 📄 runtime.txt              # Python version spec
│   └── 📄 career_flow.db           # SQLite database (auto-generated)
│
└── 📁 frontend/                    # React Frontend
    ├── 📄 package.json             # Node dependencies
    │
    ├── 📁 public/
    │   └── 📄 index.html           # HTML template
    │
    └── 📁 src/
        ├── 📄 index.js             # React entry point
        ├── 📄 App.js               # Main application component
        ├── 📄 App.css              # Main styles
        ├── 📄 Admin.js             # Admin dashboard component
        └── 📄 Admin.css            # Admin styles
```

## 🎯 Component Overview

### Backend (Flask)

**app.py** - Core backend application containing:
- Database models (Assessment table)
- API endpoints (submit, download, admin)
- Claude API integration
- PDF report generation
- Email delivery system

**Key Functions:**
- `generate_claude_analysis()` - Sends assessment to Claude API
- `generate_pdf_report()` - Creates professional PDF reports
- `send_report_email()` - Delivers reports via SMTP
- API routes for submission and admin access

### Frontend (React)

**App.js** - Main user interface with 8 steps:
1. Welcome - Hero page with benefits
2. Compensation - Salary and role data
3. Technical - Skills and certifications
4. Positioning - Communication assessment
5. Alignment - Values and purpose
6. Contact - Email for delivery
7. Processing - Analysis in progress
8. Complete - Success confirmation

**Admin.js** - Dashboard for viewing:
- All assessment submissions
- Detailed analysis results
- Report download capability
- Analytics and metrics

## 🔑 Key Features

### Assessment Flow
1. User completes multi-step form (~15-20 minutes)
2. Form validates input at each step
3. Contact info collected for report delivery
4. Progress bar shows completion status

### AI Analysis
1. Assessment data sent to Claude API
2. Claude analyzes across 4 dimensions:
   - Compensation gap vs market
   - Technical positioning
   - Communication effectiveness
   - Alignment factors
3. Generates structured JSON response
4. Creates personalized insights and roadmap

### Report Generation
1. JSON analysis converted to professional PDF
2. Sections include:
   - Executive summary
   - Compensation gap analysis
   - Top 3 leverage points
   - Positioning diagnosis
   - 90-day action roadmap
3. Branded with Career Flow design
4. Automatically emailed to user

### Admin Dashboard
1. View all submissions in table format
2. Click to see detailed analysis
3. Download PDF reports
4. Track key metrics:
   - Total assessments
   - Reports sent
   - Average salary data

## 🗄️ Database Schema

### Assessment Table

```sql
CREATE TABLE assessment (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    name VARCHAR(100) NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Compensation
    current_salary INTEGER,
    years_experience INTEGER,
    role VARCHAR(100),
    industry VARCHAR(100),
    location VARCHAR(100),
    last_raise_percent FLOAT,
    
    -- Technical
    technical_skills TEXT,           -- JSON array
    certifications TEXT,
    education_level VARCHAR(50),
    
    -- Positioning
    role_description TEXT,
    value_articulation TEXT,
    negotiation_experience TEXT,
    visibility_rating INTEGER,       -- 1-10
    
    -- Alignment
    values_clarity INTEGER,          -- 1-10
    purpose_alignment INTEGER,       -- 1-10
    lifestyle_fit INTEGER,           -- 1-10
    energy_level INTEGER,            -- 1-10
    
    -- Results
    analysis_result TEXT,            -- JSON
    report_generated BOOLEAN DEFAULT FALSE,
    report_sent BOOLEAN DEFAULT FALSE
);
```

## 🔌 API Endpoints

### Public Endpoints

**POST /api/submit-assessment**
- Accepts complete assessment data
- Triggers Claude analysis
- Generates PDF report
- Sends email
- Returns: `{ success: true, assessment_id: 123, email_sent: true }`

**GET /api/download-report/<id>**
- Downloads PDF for specific assessment
- Returns: PDF file

### Admin Endpoints

**GET /api/admin/assessments**
- Lists all assessments with summary data
- Returns: Array of assessment objects

**GET /api/admin/assessment/<id>**
- Full assessment details including analysis
- Returns: Complete assessment object with Claude analysis JSON

**GET /health**
- Health check endpoint
- Returns: `{ status: "healthy" }`

## 🎨 Design System

### Colors
- Primary: `#0f172a` (Dark slate)
- Accent: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Background: `#f8fafc` (Light gray)

### Typography
- Display: Manrope (800 weight)
- Body: Manrope (400-600 weight)
- Code: Space Mono

### Components
- Multi-step form with validation
- Progress bar with animation
- Skill chips (toggle selection)
- Range sliders (1-10 scale)
- Professional buttons
- Loading states
- Success/error messages

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` file
- Use different keys for dev/prod
- Rotate secrets regularly

### Input Validation
- Email format validation
- Numeric range checks
- Text length limits
- SQL injection prevention (SQLAlchemy handles)

### API Security
- CORS configured for specific origins
- Rate limiting recommended for production
- Admin routes need authentication (add in production)

### Data Privacy
- No logging of sensitive data
- GDPR compliance considerations
- Data retention policy needed
- User data deletion capability

## 📊 Cost Analysis

### Development (Local)
- $0 for infrastructure
- ~$0.003 per assessment (Claude API)

### Production (Monthly)
Assuming 1,000 assessments/month:

**Infrastructure:**
- Backend hosting: $5-20 (Railway/Render)
- Database: $7-15 (PostgreSQL)
- Frontend: Free (Vercel/Netlify)
- Email: Free (up to 100/day via Gmail)

**API Costs:**
- Claude API: ~$3 (1,000 assessments × $0.003)

**Total: $15-40/month**

### Scaling (10K assessments/month)
- Infrastructure: $30-50
- Claude API: ~$30
- Database: $15-25
- Email service: $10-20 (SendGrid/Mailgun)
**Total: $85-125/month**

## 🚀 Performance Optimization

### Backend
- Database indexing on email, submitted_at
- Connection pooling for database
- Caching frequently accessed data
- Async task queue for email sending
- Rate limiting on API endpoints

### Frontend
- Code splitting for faster initial load
- Image optimization
- Lazy loading components
- Service worker for offline capability
- CDN for static assets

### Database
- Index on frequently queried columns
- Regular vacuum/analyze (PostgreSQL)
- Archive old assessments
- Read replicas for scaling

## 📈 Analytics & Metrics

### User Metrics
- Assessment start rate
- Completion rate by step
- Average time to complete
- Drop-off points
- Email open rates

### Business Metrics
- Total assessments submitted
- Compensation gap distribution
- Most common positioning issues
- Lead quality indicators
- Conversion to strategy sessions

### Technical Metrics
- API response times
- Error rates
- Email delivery success
- Database query performance
- Server resource usage

## 🔄 Future Enhancements

### Phase 2 Features
- [ ] User accounts and login
- [ ] Assessment history
- [ ] Progress save/resume
- [ ] Multiple language support
- [ ] Industry-specific analysis
- [ ] Salary benchmarking API integration
- [ ] LinkedIn profile import
- [ ] Calendar integration for bookings

### Phase 3 Features
- [ ] Team assessments
- [ ] Comparison with peers
- [ ] Career path recommendations
- [ ] Skill gap analysis with courses
- [ ] Networking recommendations
- [ ] Job matching engine
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] WebSocket for real-time updates
- [ ] Background job processing (Celery)
- [ ] Advanced caching (Redis)
- [ ] GraphQL API option
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] A/B testing framework
- [ ] Advanced analytics dashboard

## 📚 Learning Resources

### Technologies Used
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **React**: Frontend library
- **Anthropic Claude**: AI analysis
- **ReportLab**: PDF generation

### Recommended Reading
- Flask documentation
- React hooks guide
- Anthropic prompt engineering
- SQL optimization techniques
- REST API best practices

## 🤝 Contributing

### Code Style
- Python: PEP 8
- JavaScript: ESLint with Airbnb config
- Formatting: Black (Python), Prettier (JS)

### Git Workflow
1. Feature branches from `main`
2. Pull request with description
3. Code review required
4. Merge to `main` after approval

### Testing
- Backend: pytest
- Frontend: Jest + React Testing Library
- E2E: Playwright or Cypress

## 📞 Support

### Common Issues
1. **Email not sending**: Check SMTP credentials and port access
2. **Claude API errors**: Verify API key and rate limits
3. **Database errors**: Check connection string and migrations
4. **Build failures**: Clear node_modules and reinstall

### Getting Help
1. Check documentation in README.md
2. Review error logs
3. Test with minimal reproduction
4. Search GitHub issues

---

**Built for Career Flow Framework**
**Version: 1.0.0**
**Last Updated: December 2024**
