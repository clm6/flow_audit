import React, { useState, useEffect } from 'react';
import './Admin.css';

function Admin() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/assessments');
      const data = await response.json();
      setAssessments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setLoading(false);
    }
  };

  const fetchAssessmentDetail = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/assessment/${id}`);
      const data = await response.json();
      setSelectedAssessment(data);
      setView('detail');
    } catch (error) {
      console.error('Error fetching assessment detail:', error);
    }
  };

  const downloadReport = (id) => {
    window.open(`http://localhost:5000/api/download-report/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Career Flow Diagnostic - Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{assessments.length}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assessments.filter(a => a.report_sent).length}
            </div>
            <div className="stat-label">Reports Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              ${Math.round(assessments.reduce((sum, a) => sum + (a.current_salary || 0), 0) / assessments.length || 0).toLocaleString()}
            </div>
            <div className="stat-label">Avg Current Salary</div>
          </div>
        </div>
      </header>

      {view === 'list' ? (
        <div className="assessments-list">
          <div className="list-header">
            <h2>Recent Assessments</h2>
            <button className="btn-refresh" onClick={fetchAssessments}>
              ↻ Refresh
            </button>
          </div>

          <div className="table-container">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Current Salary</th>
                  <th>Report Sent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(assessment => (
                  <tr key={assessment.id}>
                    <td>{new Date(assessment.submitted_at).toLocaleDateString()}</td>
                    <td className="name-cell">{assessment.name}</td>
                    <td>{assessment.email}</td>
                    <td>{assessment.role}</td>
                    <td>${assessment.current_salary?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${assessment.report_sent ? 'sent' : 'pending'}`}>
                        {assessment.report_sent ? '✓ Sent' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => fetchAssessmentDetail(assessment.id)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-download"
                        onClick={() => downloadReport(assessment.id)}
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assessments.length === 0 && (
            <div className="empty-state">
              <p>No assessments yet. Share your diagnostic tool to get started!</p>
            </div>
          )}
        </div>
      ) : (
        <AssessmentDetail 
          assessment={selectedAssessment}
          onBack={() => setView('list')}
          onDownload={() => downloadReport(selectedAssessment.id)}
        />
      )}
    </div>
  );
}

function AssessmentDetail({ assessment, onBack, onDownload }) {
  if (!assessment) return null;

  const analysis = assessment.analysis;

  return (
    <div className="assessment-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Back to List</button>
        <button className="btn-download" onClick={onDownload}>
          Download PDF Report
        </button>
      </div>

      <div className="detail-sections">
        {/* Basic Info */}
        <section className="detail-section">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{assessment.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{assessment.email}</span>
            </div>
            <div className="info-item">
              <label>Submitted:</label>
              <span>{new Date(assessment.submitted_at).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Compensation Data */}
        <section className="detail-section">
          <h3>Compensation Profile</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Current Salary:</label>
              <span>${assessment.compensation.current_salary?.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Years Experience:</label>
              <span>{assessment.compensation.years_experience}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span>{assessment.compensation.role}</span>
            </div>
            <div className="info-item">
              <label>Industry:</label>
              <span>{assessment.compensation.industry}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{assessment.compensation.location}</span>
            </div>
          </div>
        </section>

        {/* Claude Analysis */}
        {analysis && (
          <>
            <section className="detail-section highlight">
              <h3>Executive Summary</h3>
              <p>{analysis.executive_summary}</p>
            </section>

            <section className="detail-section">
              <h3>Compensation Gap Analysis</h3>
              <div className="gap-analysis">
                <div className="gap-stat">
                  <label>Market Range:</label>
                  <span>{analysis.compensation_gap.market_salary_range}</span>
                </div>
                <div className="gap-stat">
                  <label>Gap:</label>
                  <span className="gap-value">{analysis.compensation_gap.gap_percentage}</span>
                </div>
                <div className="gap-stat">
                  <label>Annual Opportunity:</label>
                  <span className="opportunity-value">{analysis.compensation_gap.annual_opportunity}</span>
                </div>
                <div className="gap-insight">
                  <strong>Key Insight:</strong> {analysis.compensation_gap.key_insight}
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3>Top Leverage Points</h3>
              {analysis.leverage_points.map((point, index) => (
                <div key={index} className="leverage-point">
                  <h4>{index + 1}. {point.area}</h4>
                  <p><strong>Current State:</strong> {point.current_state}</p>
                  <p><strong>Impact:</strong> {point.impact}</p>
                  <p><strong>Quick Win:</strong> {point.quick_win}</p>
                </div>
              ))}
            </section>

            <section className="detail-section">
              <h3>Positioning Diagnosis</h3>
              <div className="positioning">
                <p><strong>Language Gaps:</strong> {analysis.positioning_diagnosis.language_gaps}</p>
                <p><strong>Visibility Issues:</strong> {analysis.positioning_diagnosis.visibility_issues}</p>
                <p><strong>Narrative Coherence:</strong> {analysis.positioning_diagnosis.narrative_coherence}</p>
                <div className="fixes-list">
                  <strong>Specific Fixes:</strong>
                  <ul>
                    {analysis.positioning_diagnosis.specific_fixes.map((fix, i) => (
                      <li key={i}>{fix}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3>90-Day Roadmap</h3>
              {analysis.ninety_day_roadmap.map((phase, index) => (
                <div key={index} className="roadmap-phase">
                  <h4>{phase.week_range}: {phase.focus}</h4>
                  <ul>
                    {phase.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                  <p className="success-metric">
                    <strong>Success Metric:</strong> {phase.success_metric}
                  </p>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
