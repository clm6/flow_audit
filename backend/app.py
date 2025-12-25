"""
Career Flow Diagnostic Tool - Backend API
Flask application handling assessment submission, Claude API integration, and report generation
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import anthropic
import json
import os
from io import BytesIO
from dotenv import load_dotenv
import threading

# Load environment variables from .env file
load_dotenv()

def get_database_url():
    """
    Get database URL from environment, converting postgres:// to postgresql:// 
    for SQLAlchemy 2.x compatibility (Railway uses postgres://)
    """
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Railway uses postgres:// but SQLAlchemy 2.x requires postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        return database_url
    # Fallback to SQLite for local development
    return 'sqlite:///career_flow.db'
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS configuration
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
# Support multiple origins separated by comma, strip trailing slashes
allowed_origins = [origin.strip().rstrip('/') for origin in cors_origins.split(',')]

# Apply CORS to all routes - Flask-CORS handles everything automatically
CORS(app, 
     origins=allowed_origins,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True,
     expose_headers=None,
     max_age=3600)

# Explicit CORS handler as backup - ensure headers are always set
@app.after_request
def add_cors_headers(response):
    """Explicitly add CORS headers to all responses"""
    origin = request.headers.get('Origin')
    if origin:
        # Check if origin is in allowed list (with flexible matching)
        origin_normalized = origin.rstrip('/')
        for allowed in allowed_origins:
            allowed_normalized = allowed.rstrip('/')
            if origin_normalized == allowed_normalized or origin == allowed:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
                if request.method == 'OPTIONS':
                    response.headers['Access-Control-Max-Age'] = '3600'
                break
    return response

# Global error handler to catch all exceptions and return with CORS headers
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all exceptions and return with CORS headers"""
    import traceback
    error_trace = traceback.format_exc()
    print(f"Unhandled exception: {error_trace}")
    
    # Create error response
    response = jsonify({
        'success': False,
        'error': str(e),
        'details': error_trace if os.environ.get('FLASK_ENV') == 'development' else None
    })
    
    # Add CORS headers to error response
    origin = request.headers.get('Origin') if request else None
    if origin:
        origin_normalized = origin.rstrip('/')
        for allowed in allowed_origins:
            allowed_normalized = allowed.rstrip('/')
            if origin_normalized == allowed_normalized or origin == allowed:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
                break
    
    return response, 500

db = SQLAlchemy(app)

# Database Models
class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Compensation Data
    current_salary = db.Column(db.Integer)
    years_experience = db.Column(db.Integer)
    role = db.Column(db.String(100))
    industry = db.Column(db.String(100))
    location = db.Column(db.String(100))
    last_raise_percent = db.Column(db.Float)
    
    # Technical Skills (JSON stored as text)
    technical_skills = db.Column(db.Text)
    certifications = db.Column(db.Text)
    education_level = db.Column(db.String(50))
    
    # Positioning & Communication
    role_description = db.Column(db.Text)
    value_articulation = db.Column(db.Text)
    negotiation_experience = db.Column(db.Text)
    visibility_rating = db.Column(db.Integer)  # 1-10 scale
    
    # Alignment Factors
    values_clarity = db.Column(db.Integer)  # 1-10 scale
    purpose_alignment = db.Column(db.Integer)  # 1-10 scale
    lifestyle_fit = db.Column(db.Integer)  # 1-10 scale
    energy_level = db.Column(db.Integer)  # 1-10 scale
    
    # Claude Analysis (stored as JSON)
    analysis_result = db.Column(db.Text)
    report_generated = db.Column(db.Boolean, default=False)
    report_sent = db.Column(db.Boolean, default=False)

# Create tables
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("This is normal if tables already exist or database is not yet available")

def generate_claude_analysis(assessment_data):
    """
    Use Claude API to analyze assessment and generate personalized report
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
    
    client = anthropic.Anthropic(api_key=api_key)
    
    prompt = f"""You are an expert STEM career strategist with a PhD in Bioengineering and experience leading utility operations. You're analyzing a career diagnostic assessment for a client who wants to increase their compensation by 10-30% through strategic positioning.

CLIENT DATA:
Name: {assessment_data['name']}
Current Role: {assessment_data['role']}
Industry: {assessment_data['industry']}
Location: {assessment_data['location']}
Current Salary: ${int(assessment_data['current_salary']):,}
Years Experience: {int(assessment_data['years_experience'])}
Last Raise: {float(assessment_data['last_raise_percent'])}%

TECHNICAL PROFILE:
Skills: {assessment_data['technical_skills']}
Certifications: {assessment_data['certifications']}
Education: {assessment_data['education_level']}

POSITIONING & COMMUNICATION:
How they describe their role: "{assessment_data['role_description']}"
How they articulate value: "{assessment_data['value_articulation']}"
Negotiation experience: "{assessment_data['negotiation_experience']}"
Work visibility (1-10): {assessment_data['visibility_rating']}

ALIGNMENT FACTORS:
Values clarity (1-10): {assessment_data['values_clarity']}
Purpose alignment (1-10): {assessment_data['purpose_alignment']}
Lifestyle fit (1-10): {assessment_data['lifestyle_fit']}
Energy level (1-10): {assessment_data['energy_level']}

Generate a comprehensive analysis following the Career Flow Framework. Structure your response as JSON with these sections:

{{
  "executive_summary": "2-3 sentence overview of their biggest opportunity",
  "compensation_gap": {{
    "market_salary_range": "Estimated market range for their experience/role",
    "gap_percentage": "Estimated % below market",
    "annual_opportunity": "Dollar amount leaving on table",
    "key_insight": "Why this gap exists"
  }},
  "leverage_points": [
    {{
      "area": "Highest leverage area (technical/positioning/alignment)",
      "current_state": "What's happening now",
      "impact": "Why this matters for compensation",
      "quick_win": "Specific action they can take this week"
    }},
    // 2 more leverage points
  ],
  "positioning_diagnosis": {{
    "language_gaps": "How their self-description undersells them",
    "visibility_issues": "Problems with how work is perceived",
    "narrative_coherence": "Strength of their career story",
    "specific_fixes": ["3-4 concrete positioning changes"]
  }},
  "alignment_assessment": {{
    "values_insight": "What their scores reveal about purpose/values",
    "energy_pattern": "Connection between alignment and engagement",
    "strategic_implication": "How alignment affects negotiation leverage"
  }},
  "ninety_day_roadmap": [
    {{
      "week_range": "Weeks 1-4",
      "focus": "Primary objective",
      "actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "success_metric": "How to know it's working"
    }},
    // 2 more phases (weeks 5-8, weeks 9-12)
  ],
  "next_step": "Clear call to action for working together"
}}

Be direct about gaps - they've completed this assessment because they know something's wrong. Use your PhD + utility leadership credibility. Tie every recommendation to compensation impact. Use Career Flow Framework language (alignment, positioning, strategic value)."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ],
            timeout=60.0  # 60 second timeout
        )
        
        # Parse Claude's response
        response_text = message.content[0].text
        
        # Extract JSON from response (Claude might wrap it in markdown)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        
        return json.loads(response_text)
    except anthropic.APIError as e:
        print(f"Anthropic API error: {e}")
        raise Exception(f"Failed to generate analysis: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text[:500] if 'response_text' in locals() else 'No response'}")
        raise Exception(f"Failed to parse analysis response: {str(e)}")
    except Exception as e:
        print(f"Unexpected error in generate_claude_analysis: {e}")
        raise

def generate_pdf_report(assessment, analysis):
    """
    Generate professional PDF report from analysis
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#1a1a1a',
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor='#2c3e50',
        spaceAfter=12,
        spaceBefore=20
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=16,
        textColor='#333333'
    )
    
    # Title Page
    story.append(Paragraph("Career Flow Diagnostic Report", title_style))
    story.append(Paragraph(f"Prepared for: {assessment.name}", body_style))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", body_style))
    story.append(Spacer(1, 0.5*inch))
    
    # Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(analysis['executive_summary'], body_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Compensation Gap Analysis
    story.append(Paragraph("Compensation Gap Analysis", heading_style))
    comp_gap = analysis['compensation_gap']
    story.append(Paragraph(f"<b>Market Range:</b> {comp_gap['market_salary_range']}", body_style))
    story.append(Paragraph(f"<b>Gap:</b> {comp_gap['gap_percentage']}", body_style))
    story.append(Paragraph(f"<b>Annual Opportunity:</b> {comp_gap['annual_opportunity']}", body_style))
    story.append(Paragraph(f"<b>Key Insight:</b> {comp_gap['key_insight']}", body_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Leverage Points
    story.append(Paragraph("Top 3 Leverage Points for Fastest Impact", heading_style))
    for i, point in enumerate(analysis['leverage_points'], 1):
        story.append(Paragraph(f"<b>{i}. {point['area']}</b>", body_style))
        story.append(Paragraph(f"Current State: {point['current_state']}", body_style))
        story.append(Paragraph(f"Impact: {point['impact']}", body_style))
        story.append(Paragraph(f"Quick Win: {point['quick_win']}", body_style))
        story.append(Spacer(1, 0.2*inch))
    
    # Positioning Diagnosis
    story.append(PageBreak())
    story.append(Paragraph("Positioning Diagnosis", heading_style))
    pos = analysis['positioning_diagnosis']
    story.append(Paragraph(f"<b>Language Gaps:</b> {pos['language_gaps']}", body_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>Visibility Issues:</b> {pos['visibility_issues']}", body_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(f"<b>Narrative Coherence:</b> {pos['narrative_coherence']}", body_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("<b>Specific Fixes:</b>", body_style))
    for fix in pos['specific_fixes']:
        story.append(Paragraph(f"• {fix}", body_style))
    story.append(Spacer(1, 0.3*inch))
    
    # 90-Day Roadmap
    story.append(Paragraph("Your 90-Day Roadmap", heading_style))
    for phase in analysis['ninety_day_roadmap']:
        story.append(Paragraph(f"<b>{phase['week_range']}: {phase['focus']}</b>", body_style))
        story.append(Paragraph("Actions:", body_style))
        for action in phase['actions']:
            story.append(Paragraph(f"• {action}", body_style))
        story.append(Paragraph(f"<b>Success Metric:</b> {phase['success_metric']}", body_style))
        story.append(Spacer(1, 0.2*inch))
    
    # Next Steps
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Next Step", heading_style))
    story.append(Paragraph(analysis['next_step'], body_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

def send_report_email(assessment, pdf_buffer):
    """
    Send PDF report via email
    """
    # Email configuration (use environment variables in production)
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SENDER_EMAIL')
    sender_password = os.environ.get('SENDER_PASSWORD')
    
    if not all([sender_email, sender_password]):
        print("Email credentials not configured")
        return False
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = assessment.email
    msg['Subject'] = f"Your Career Flow Diagnostic Report - {assessment.name}"
    
    body = f"""Hi {assessment.name},

Thank you for completing the Career Flow Diagnostic assessment!

Your personalized report is attached. This analysis identifies specific opportunities to increase your compensation by 10-30% through strategic positioning.

Key highlights from your assessment:
• Compensation gap analysis with market benchmarking
• Top 3 leverage points for fastest impact
• Specific positioning improvements
• Your customized 90-day roadmap

Ready to discuss how to implement these strategies? Schedule a strategy session: [CALENDAR LINK]

Best regards,
Craig
Career Flow Framework
"""
    
    msg.attach(MIMEText(body, 'plain'))
    
    # Attach PDF
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(pdf_buffer.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', f'attachment; filename=Career_Flow_Report_{assessment.name.replace(" ", "_")}.pdf')
    msg.attach(part)
    
    # Send email
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False

# API Endpoints
@app.route('/api/submit-assessment', methods=['POST', 'OPTIONS'])
def submit_assessment():
    """
    Accept assessment submission, generate Claude analysis, create PDF, send email
    """
    if request.method == 'OPTIONS':
        # Handle CORS preflight with explicit headers
        origin = request.headers.get('Origin')
        response = jsonify({})
        # Only set CORS headers if origin is in allowed list
        if origin:
            origin_normalized = origin.rstrip('/')
            for allowed in allowed_origins:
                allowed_normalized = allowed.rstrip('/')
                if origin_normalized == allowed_normalized or origin == allowed:
                    response.headers['Access-Control-Allow-Origin'] = origin
                    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
                    response.headers['Access-Control-Allow-Credentials'] = 'true'
                    response.headers['Access-Control-Max-Age'] = '3600'
                    break
        return response, 200
    
    try:
        # Quick validation first
        if not request.json:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        data = request.json
        
        # Validate required fields quickly
        required_fields = ['email', 'name', 'current_salary', 'years_experience', 'role']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing)}'}), 400
        
        # Check API key early
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return jsonify({'success': False, 'error': 'ANTHROPIC_API_KEY not configured'}), 500
        
        # Create assessment record
        assessment = Assessment(
            email=data['email'],
            name=data['name'],
            current_salary=data['current_salary'],
            years_experience=data['years_experience'],
            role=data['role'],
            industry=data['industry'],
            location=data['location'],
            last_raise_percent=data['last_raise_percent'],
            technical_skills=json.dumps(data['technical_skills']),
            certifications=data['certifications'],
            education_level=data['education_level'],
            role_description=data['role_description'],
            value_articulation=data['value_articulation'],
            negotiation_experience=data['negotiation_experience'],
            visibility_rating=data['visibility_rating'],
            values_clarity=data['values_clarity'],
            purpose_alignment=data['purpose_alignment'],
            lifestyle_fit=data['lifestyle_fit'],
            energy_level=data['energy_level']
        )
        
        db.session.add(assessment)
        db.session.commit()
        
        # Get assessment ID before starting background processing
        assessment_id = assessment.id
        
        # Process analysis in background to avoid timeout
        def process_analysis_background(assessment_id, assessment_data):
            """Process Claude analysis, PDF generation, and email in background"""
            with app.app_context():
                try:
                    assessment = Assessment.query.get(assessment_id)
                    if not assessment:
                        print(f"Assessment {assessment_id} not found")
                        return
                    
                    print(f"Starting Claude analysis for assessment {assessment_id}...")
                    analysis = generate_claude_analysis(assessment_data)
                    print(f"Claude analysis completed for assessment {assessment_id}")
                    
                    assessment.analysis_result = json.dumps(analysis)
                    assessment.report_generated = True
                    db.session.commit()
                    
                    # Generate PDF report
                    pdf_buffer = generate_pdf_report(assessment, analysis)
                    
                    # Send email
                    email_sent = send_report_email(assessment, pdf_buffer)
                    assessment.report_sent = email_sent
                    db.session.commit()
                    
                    print(f"Background processing completed for assessment {assessment_id}")
                except Exception as e:
                    import traceback
                    error_trace = traceback.format_exc()
                    print(f"Error in background processing for assessment {assessment_id}: {error_trace}")
                    # Update assessment with error status
                    try:
                        assessment = Assessment.query.get(assessment_id)
                        if assessment:
                            assessment.analysis_result = json.dumps({'error': str(e)})
                            db.session.commit()
                    except:
                        pass
        
        # Start background thread
        thread = threading.Thread(target=process_analysis_background, args=(assessment_id, data))
        thread.daemon = True
        thread.start()
        
        # Return immediately with assessment ID
        return jsonify({
            'success': True,
            'message': 'Assessment submitted successfully! Your analysis is being processed. You will receive an email when it\'s ready.',
            'assessment_id': assessment_id,
            'status': 'processing'
        })
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in submit_assessment: {error_trace}")  # Log to Railway logs
        
        # Return error response with CORS headers
        response = jsonify({
            'success': False,
            'error': str(e),
            'details': error_trace if os.environ.get('FLASK_ENV') == 'development' else None
        })
        
        # Ensure CORS headers are on error response too
        origin = request.headers.get('Origin')
        if origin:
            origin_normalized = origin.rstrip('/')
            for allowed in allowed_origins:
                allowed_normalized = allowed.rstrip('/')
                if origin_normalized == allowed_normalized or origin == allowed:
                    response.headers['Access-Control-Allow-Origin'] = origin
                    response.headers['Access-Control-Allow-Credentials'] = 'true'
                    break
        
        return response, 500

@app.route('/api/download-report/<int:assessment_id>', methods=['GET'])
def download_report(assessment_id):
    """
    Download PDF report for a specific assessment
    """
    assessment = Assessment.query.get_or_404(assessment_id)
    
    if not assessment.analysis_result:
        return jsonify({'error': 'Report not generated yet'}), 404
    
    analysis = json.loads(assessment.analysis_result)
    pdf_buffer = generate_pdf_report(assessment, analysis)
    
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'Career_Flow_Report_{assessment.name.replace(" ", "_")}.pdf'
    )

@app.route('/api/admin/assessments', methods=['GET'])
def get_assessments():
    """
    Admin endpoint: Get all assessments with summary data
    """
    assessments = Assessment.query.order_by(Assessment.submitted_at.desc()).all()
    
    return jsonify([{
        'id': a.id,
        'name': a.name,
        'email': a.email,
        'role': a.role,
        'current_salary': a.current_salary,
        'submitted_at': a.submitted_at.isoformat(),
        'report_sent': a.report_sent
    } for a in assessments])

@app.route('/api/admin/assessment/<int:assessment_id>', methods=['GET'])
def get_assessment_detail(assessment_id):
    """
    Admin endpoint: Get full assessment details including analysis
    """
    assessment = Assessment.query.get_or_404(assessment_id)
    
    return jsonify({
        'id': assessment.id,
        'name': assessment.name,
        'email': assessment.email,
        'submitted_at': assessment.submitted_at.isoformat(),
        'compensation': {
            'current_salary': assessment.current_salary,
            'years_experience': assessment.years_experience,
            'role': assessment.role,
            'industry': assessment.industry,
            'location': assessment.location
        },
        'analysis': json.loads(assessment.analysis_result) if assessment.analysis_result else None,
        'report_sent': assessment.report_sent
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/api/cors-debug', methods=['GET'])
def cors_debug():
    """Debug endpoint to check CORS configuration"""
    return jsonify({
        'cors_origins_env': os.environ.get('CORS_ORIGINS', 'NOT SET'),
        'allowed_origins': allowed_origins,
        'request_origin': request.headers.get('Origin', 'NOT PROVIDED')
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
