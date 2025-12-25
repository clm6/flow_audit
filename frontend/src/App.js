import React, { useState } from 'react';
import './App.css';

// Assessment steps configuration
const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'compensation', title: 'Compensation Reality', component: CompensationStep },
  { id: 'technical', title: 'Technical Foundation', component: TechnicalStep },
  { id: 'positioning', title: 'Positioning & Communication', component: PositioningStep },
  { id: 'alignment', title: 'Alignment Assessment', component: AlignmentStep },
  { id: 'contact', title: 'Contact Information', component: ContactStep },
  { id: 'processing', title: 'Processing', component: ProcessingStep },
  { id: 'complete', title: 'Complete', component: CompleteStep }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    // Contact
    name: '',
    email: '',
    // Compensation
    current_salary: '',
    years_experience: '',
    role: '',
    industry: '',
    location: '',
    last_raise_percent: '',
    // Technical
    technical_skills: [],
    certifications: '',
    education_level: '',
    // Positioning
    role_description: '',
    value_articulation: '',
    negotiation_experience: '',
    visibility_rating: 5,
    // Alignment
    values_clarity: 5,
    purpose_alignment: 5,
    lifestyle_fit: 5,
    energy_level: 5
  });
  const [submissionResult, setSubmissionResult] = useState(null);

  const updateData = (newData) => {
    setAssessmentData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/submit-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      });

      const result = await response.json();
      setSubmissionResult(result);
      nextStep(); // Move to complete step
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({ success: false, error: error.message });
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Career Flow</h1>
          <div className="tagline">Diagnostic Tool</div>
        </div>
      </header>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="main-content">
        <div className="step-container">
          <CurrentStepComponent
            data={assessmentData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            submitAssessment={submitAssessment}
            submissionResult={submissionResult}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        </div>
      </main>

      <footer className="footer">
        <p>© 2024 Career Flow Framework | Confidential Assessment</p>
      </footer>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ nextStep }) {
  return (
    <div className="step-content welcome-step">
      <div className="welcome-hero">
        <h1>Discover Your Career Flow</h1>
        <p className="subtitle">Are you leaving 10-30% on the table?</p>
      </div>

      <div className="welcome-description">
        <p>
          Most STEM professionals are significantly underpaid—not because they lack skills, 
          but because they haven't mastered strategic positioning.
        </p>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Compensation Gap Analysis</h3>
            <p>See exactly where you stand vs. market rates</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Highest-Leverage Improvements</h3>
            <p>Focus on what moves the needle fastest</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3>Custom 90-Day Roadmap</h3>
            <p>Concrete steps tailored to your situation</p>
          </div>
        </div>

        <div className="time-commitment">
          <strong>⏱️ Time commitment:</strong> 15-20 minutes
        </div>
      </div>

      <button className="btn-primary" onClick={nextStep}>
        Start Your Assessment
      </button>
    </div>
  );
}

// Step 2: Compensation
function CompensationStep({ data, updateData, nextStep, prevStep }) {
  const canProceed = data.current_salary && data.years_experience && 
                     data.role && data.industry && data.location;

  return (
    <div className="step-content">
      <h2>Compensation Reality Check</h2>
      <p className="step-description">
        Let's establish your baseline. This helps us calculate your exact market gap.
      </p>

      <div className="form-group">
        <label>Current Annual Salary (Total Comp) *</label>
        <input
          type="number"
          className="input-field"
          placeholder="e.g., 95000"
          value={data.current_salary}
          onChange={(e) => updateData({ current_salary: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Years of Experience *</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g., 7"
            value={data.years_experience}
            onChange={(e) => updateData({ years_experience: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Last Raise Percentage</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g., 3.5"
            step="0.1"
            value={data.last_raise_percent}
            onChange={(e) => updateData({ last_raise_percent: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Current Role/Title *</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g., Senior Mechanical Engineer"
          value={data.role}
          onChange={(e) => updateData({ role: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Industry *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Aerospace"
            value={data.industry}
            onChange={(e) => updateData({ industry: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Seattle, WA"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-secondary" onClick={prevStep}>Back</button>
        <button 
          className="btn-primary" 
          onClick={nextStep}
          disabled={!canProceed}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Step 3: Technical Foundation
function TechnicalStep({ data, updateData, nextStep, prevStep }) {
  const [customSkill, setCustomSkill] = useState('');

  const commonSkills = [
    'Python', 'C++', 'MATLAB', 'CAD', 'FEA', 'Machine Learning',
    'Data Analysis', 'Project Management', 'System Design', 'Testing/QA'
  ];

  const toggleSkill = (skill) => {
    const skills = data.technical_skills || [];
    if (skills.includes(skill)) {
      updateData({ technical_skills: skills.filter(s => s !== skill) });
    } else {
      updateData({ technical_skills: [...skills, skill] });
    }
  };

  const addCustomSkill = () => {
    if (customSkill && !data.technical_skills.includes(customSkill)) {
      updateData({ technical_skills: [...data.technical_skills, customSkill] });
      setCustomSkill('');
    }
  };

  return (
    <div className="step-content">
      <h2>Technical Foundation</h2>
      <p className="step-description">
        Your technical skills are the foundation—but positioning determines how they're valued.
      </p>

      <div className="form-group">
        <label>Core Technical Skills (select all that apply)</label>
        <div className="skills-grid">
          {commonSkills.map(skill => (
            <button
              key={skill}
              className={`skill-chip ${data.technical_skills?.includes(skill) ? 'active' : ''}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
        <div className="custom-skill-input">
          <input
            type="text"
            className="input-field"
            placeholder="Add custom skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
          />
          <button className="btn-secondary" onClick={addCustomSkill}>Add</button>
        </div>
      </div>

      <div className="form-group">
        <label>Certifications & Licenses</label>
        <textarea
          className="textarea-field"
          placeholder="e.g., PE License, PMP, AWS Certified Solutions Architect..."
          rows="3"
          value={data.certifications}
          onChange={(e) => updateData({ certifications: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Highest Education Level</label>
        <select
          className="select-field"
          value={data.education_level}
          onChange={(e) => updateData({ education_level: e.target.value })}
        >
          <option value="">Select...</option>
          <option value="Bachelor's">Bachelor's Degree</option>
          <option value="Master's">Master's Degree</option>
          <option value="PhD">PhD</option>
          <option value="Other">Other Advanced Degree</option>
        </select>
      </div>

      <div className="step-nav">
        <button className="btn-secondary" onClick={prevStep}>Back</button>
        <button className="btn-primary" onClick={nextStep}>Continue</button>
      </div>
    </div>
  );
}

// Step 4: Positioning & Communication
function PositioningStep({ data, updateData, nextStep, prevStep }) {
  return (
    <div className="step-content">
      <h2>Positioning & Communication</h2>
      <p className="step-description">
        This is where most STEM professionals lose 20-30% of their potential compensation.
      </p>

      <div className="form-group">
        <label>How do you typically describe what you do? *</label>
        <textarea
          className="textarea-field"
          placeholder="Example: 'I'm a mechanical engineer. I design components and run simulations.'"
          rows="4"
          value={data.role_description}
          onChange={(e) => updateData({ role_description: e.target.value })}
        />
        <small className="hint">Don't overthink it—just write what you'd naturally say.</small>
      </div>

      <div className="form-group">
        <label>In your last performance review or when discussing accomplishments, how did you articulate your value? *</label>
        <textarea
          className="textarea-field"
          placeholder="Example: 'I completed my projects on time and helped with some cross-functional work.'"
          rows="4"
          value={data.value_articulation}
          onChange={(e) => updateData({ value_articulation: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Tell us about your most recent salary negotiation or raise conversation *</label>
        <textarea
          className="textarea-field"
          placeholder="What happened? How did you approach it? What was the outcome?"
          rows="4"
          value={data.negotiation_experience}
          onChange={(e) => updateData({ negotiation_experience: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>How visible is your work to decision-makers? (1 = invisible, 10 = highly visible)</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="10"
            value={data.visibility_rating}
            onChange={(e) => updateData({ visibility_rating: parseInt(e.target.value) })}
            className="slider"
          />
          <span className="slider-value">{data.visibility_rating}</span>
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-secondary" onClick={prevStep}>Back</button>
        <button 
          className="btn-primary" 
          onClick={nextStep}
          disabled={!data.role_description || !data.value_articulation || !data.negotiation_experience}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Step 5: Alignment Assessment
function AlignmentStep({ data, updateData, nextStep, prevStep }) {
  const sliderQuestions = [
    {
      key: 'values_clarity',
      label: 'How clear are you on your core values and what matters most in your career?',
      low: 'Very unclear',
      high: 'Crystal clear'
    },
    {
      key: 'purpose_alignment',
      label: 'How aligned is your current work with your sense of purpose?',
      low: 'Not aligned',
      high: 'Perfectly aligned'
    },
    {
      key: 'lifestyle_fit',
      label: 'How well does your current role fit your desired lifestyle?',
      low: 'Poor fit',
      high: 'Perfect fit'
    },
    {
      key: 'energy_level',
      label: 'How energized do you feel about your work?',
      low: 'Drained',
      high: 'Energized'
    }
  ];

  return (
    <div className="step-content">
      <h2>Alignment Assessment</h2>
      <p className="step-description">
        Alignment isn't just about happiness—it directly affects your negotiation leverage.
      </p>

      {sliderQuestions.map(question => (
        <div key={question.key} className="form-group">
          <label>{question.label}</label>
          <div className="slider-container">
            <span className="slider-label">{question.low}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={data[question.key]}
              onChange={(e) => updateData({ [question.key]: parseInt(e.target.value) })}
              className="slider"
            />
            <span className="slider-label">{question.high}</span>
            <span className="slider-value">{data[question.key]}</span>
          </div>
        </div>
      ))}

      <div className="step-nav">
        <button className="btn-secondary" onClick={prevStep}>Back</button>
        <button className="btn-primary" onClick={nextStep}>Continue</button>
      </div>
    </div>
  );
}

// Step 6: Contact Information
function ContactStep({ data, updateData, nextStep, prevStep }) {
  const canProceed = data.name && data.email;

  return (
    <div className="step-content">
      <h2>Where Should We Send Your Report?</h2>
      <p className="step-description">
        Your personalized Career Flow Diagnostic Report will be generated instantly and sent to your email.
      </p>

      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          className="input-field"
          placeholder="John Smith"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Email Address *</label>
        <input
          type="email"
          className="input-field"
          placeholder="john@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
        />
      </div>

      <div className="privacy-notice">
        <p>🔒 Your information is confidential and will never be shared.</p>
      </div>

      <div className="step-nav">
        <button className="btn-secondary" onClick={prevStep}>Back</button>
        <button 
          className="btn-primary" 
          onClick={nextStep}
          disabled={!canProceed}
        >
          Generate My Report
        </button>
      </div>
    </div>
  );
}

// Step 7: Processing
function ProcessingStep({ submitAssessment }) {
  React.useEffect(() => {
    submitAssessment();
  }, []);

  return (
    <div className="step-content processing-step">
      <div className="processing-animation">
        <div className="spinner"></div>
      </div>
      <h2>Analyzing Your Assessment...</h2>
      <p className="processing-text">
        Our AI is analyzing your responses and generating your personalized report.
      </p>
      <ul className="processing-steps">
        <li>✓ Calculating compensation gap</li>
        <li>✓ Identifying leverage points</li>
        <li>✓ Analyzing positioning</li>
        <li>✓ Creating your roadmap</li>
      </ul>
    </div>
  );
}

// Step 8: Complete
function CompleteStep({ submissionResult }) {
  const isProcessing = submissionResult?.status === 'processing';
  const analysis = submissionResult?.analysis;
  const calendlyUrl = submissionResult?.schedule_call_url || 'https://calendly.com/drcraigmiller-careerflowframework/strategy-call';

  // Beautiful results view
  if (submissionResult?.success && analysis) {
    return (
      <div className="step-content complete-step" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="success-icon" style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }}>✓</div>
        <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#1a1a1a' }}>Your Career Flow Diagnostic Report</h2>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
          Your personalized analysis is ready. Here's your comprehensive assessment:
        </p>

        {/* Executive Summary */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '15px', fontWeight: '600' }}>Executive Summary</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{analysis.executive_summary}</p>
        </div>

        {/* Compensation Gap */}
        {analysis.compensation_gap && (
          <div style={{ 
            background: '#fff', 
            border: '2px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '30px', 
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a1a1a' }}>💰 Compensation Gap Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Market Range</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{analysis.compensation_gap.market_salary_range}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Gap</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>{analysis.compensation_gap.gap_percentage}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Annual Opportunity</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>{analysis.compensation_gap.annual_opportunity}</div>
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Key Insight</div>
              <div style={{ fontSize: '16px', color: '#1a1a1a' }}>{analysis.compensation_gap.key_insight}</div>
            </div>
          </div>
        )}

        {/* Leverage Points */}
        {analysis.leverage_points && analysis.leverage_points.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a1a1a' }}>🎯 Top Leverage Points</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {analysis.leverage_points.map((point, index) => (
                <div key={index} style={{ 
                  background: '#fff', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '25px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea', marginBottom: '15px' }}>
                    {index + 1}. {point.area}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Current State</div>
                    <div style={{ fontSize: '16px', color: '#1a1a1a' }}>{point.current_state}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Impact</div>
                    <div style={{ fontSize: '16px', color: '#1a1a1a' }}>{point.impact}</div>
                  </div>
                  <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669', marginBottom: '5px' }}>Quick Win</div>
                    <div style={{ fontSize: '16px', color: '#1a1a1a' }}>{point.quick_win}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positioning Diagnosis */}
        {analysis.positioning_diagnosis && (
          <div style={{ 
            background: '#fff', 
            border: '2px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '30px', 
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a1a1a' }}>💬 Positioning Diagnosis</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>Language Gaps</div>
              <div style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>{analysis.positioning_diagnosis.language_gaps}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>Visibility Issues</div>
              <div style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>{analysis.positioning_diagnosis.visibility_issues}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>Narrative Coherence</div>
              <div style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>{analysis.positioning_diagnosis.narrative_coherence}</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>Specific Fixes</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {analysis.positioning_diagnosis.specific_fixes?.map((fix, index) => (
                  <li key={index} style={{ 
                    padding: '12px', 
                    marginBottom: '8px', 
                    background: '#f9fafb', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#1a1a1a'
                  }}>
                    ✓ {fix}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 90-Day Roadmap */}
        {analysis.ninety_day_roadmap && analysis.ninety_day_roadmap.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a1a1a' }}>🗓️ Your 90-Day Roadmap</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {analysis.ninety_day_roadmap.map((phase, index) => (
                <div key={index} style={{ 
                  background: '#fff', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '25px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea', marginBottom: '10px' }}>
                    {phase.week_range}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1a1a1a' }}>
                    {phase.focus}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#666' }}>Actions:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {phase.actions?.map((action, i) => (
                        <li key={i} style={{ fontSize: '16px', color: '#4b5563', marginBottom: '5px', lineHeight: '1.6' }}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '5px' }}>Success Metric</div>
                    <div style={{ fontSize: '16px', color: '#1a1a1a' }}>{phase.success_metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps CTA */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          color: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          textAlign: 'center',
          marginTop: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '28px', marginBottom: '15px', fontWeight: '600' }}>Ready to Implement These Strategies?</h3>
          <p style={{ fontSize: '18px', marginBottom: '25px', opacity: 0.95 }}>
            Schedule a free 30-minute strategy session to discuss your specific situation.
          </p>
          <a 
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-large"
            style={{ 
              display: 'inline-block', 
              textDecoration: 'none',
              background: 'white',
              color: '#f5576c',
              padding: '15px 40px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '18px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Schedule Strategy Session
          </a>
        </div>
      </div>
    );
  }

  // Processing or error states
  return (
    <div className="step-content complete-step">
      {submissionResult?.success && isProcessing ? (
        <>
          <div className="success-icon">✓</div>
          <h2>Your Assessment is Being Processed!</h2>
          <p className="success-message">
            Your comprehensive Career Flow Diagnostic Report is being generated. 
            This usually takes 30-60 seconds...
          </p>
          <div className="processing-note" style={{ margin: '20px 0', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <p>⏳ Please wait while we analyze your responses...</p>
          </div>
        </>
      ) : (
        <>
          <div className="error-icon">⚠️</div>
          <h2>Something Went Wrong</h2>
          <p className="error-message">
            {submissionResult?.error || 'We encountered an error generating your report. Please try again or contact support.'}
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Start Over
          </button>
        </>
      )}
    </div>
  );
}

export default App;
