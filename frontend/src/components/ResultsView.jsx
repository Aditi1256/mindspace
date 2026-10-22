import React, { useState } from 'react';
import {
  HeartPulse,
  Smile,
  AlertTriangle,
  LifeBuoy,
  Wind,
  CheckCircle,
  Save,
  ArrowRight,
  Info,
  Sparkles,
  Coffee,
  CheckSquare,
  EyeOff,
  Layers,
  Calendar,
  Moon,
  Users,
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Coffee,
  CheckSquare,
  Wind,
  EyeOff,
  Layers,
  Calendar,
  Moon,
  Users,
  Smile,
};

export default function ResultsView({
  checkinData,
  expressionResult,
  suggestions,
  onSaveCheckin,
  onStartBreathing,
  onGoHome,
  onLogActivity,
}) {
  const [saved, setSaved] = useState(false);
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const stress = checkinData.stressLevel;
  const isHighStress = stress >= 8;

  const handleSave = () => {
    if (onSaveCheckin) {
      onSaveCheckin();
      setSaved(true);
    }
  };

  const handleMarkActivityDone = (item) => {
    setCompletedActivities((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    if (onLogActivity) {
      onLogActivity(item.id);
    }
  };


  return (
    <div className="results-container">
      {/* High Stress Supportive Escalation Panel (PRD FR-RES-4) */}
      {isHighStress && (
        <div className="crisis-support-panel" role="alert">
          <div className="crisis-header">
            <LifeBuoy size={24} className="support-icon" />
            <div>
              <h3>Supportive Care & Resources</h3>
              <p>
                You reported a stress level of <strong>{stress}/10</strong>. When academic pressure reaches this intensity, taking a gentle pause and connecting with someone you trust can make a real difference.
              </p>
            </div>
          </div>
          <div className="crisis-resources-grid">
            <div className="resource-card">
              <h4>Campus Counseling Service</h4>
              <p>Confidential, free student wellness sessions and walk-in hours.</p>
              <span className="contact-pill">Student Health Center &bull; Bldg 4</span>
            </div>
            <div className="resource-card">
              <h4>National Student Support Helpline</h4>
              <p>24/7 free, confidential listening and emotional support.</p>
              <span className="contact-pill">Call or Text: 988 (or AASRA: 91-9820466726)</span>
            </div>
            <div className="resource-card">
              <h4>Peer Mentoring Network</h4>
              <p>Talk to a senior student who has navigated similar course pressures.</p>
              <span className="contact-pill">Available via Student Portal</span>
            </div>
          </div>
        </div>
      )}

      <div className="results-grid">
        {/* Card 1: Self-Reported Stress (Primary Signal) */}
        <div className="card result-card">
          <div className="card-badge primary-badge">
            <HeartPulse size={16} />
            <span>Primary Signal (Your Self-Report)</span>
          </div>

          <h3 className="result-metric-title">Self-Reported Wellness</h3>

          <div className="stress-gauge-display">
            <div className="gauge-number">{stress}</div>
            <div className="gauge-details">
              <span className="gauge-max">/ 10</span>
              <span className="gauge-category">
                {stress <= 3 ? 'Low Tension' : stress <= 6 ? 'Moderate Stress' : 'Elevated Strain'}
              </span>
            </div>
          </div>

          <div className="scores-summary-list">
            <div className="summary-row">
              <span className="row-label">Workload Manageability</span>
              <span className="row-val">{checkinData.workloadScore} / 5</span>
            </div>
            <div className="summary-row">
              <span className="row-label">Sleep Quality</span>
              <span className="row-val">{checkinData.sleepScore} / 5</span>
            </div>
            <div className="summary-row">
              <span className="row-label">Academic Pressure</span>
              <span className="row-val">{checkinData.pressureScore} / 5</span>
            </div>
            {checkinData.note && (
              <div className="note-preview-box">
                <span className="note-preview-label">Your Note:</span>
                <p className="note-preview-text">"{checkinData.note}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Facial Expression Analysis (Secondary Informational Signal) */}
        <div className="card result-card expression-result-card">
          <div className="card-badge secondary-badge">
            <Smile size={16} />
            <span>Secondary Signal (Informational)</span>
          </div>

          <h3 className="result-metric-title">Observed Facial Features</h3>

          {expressionResult ? (
            <div className="expression-details">
              <div className="top-expr-highlight">
                <div className="expr-emoji">
                  {expressionResult.top_expression === 'happy' && '😊'}
                  {expressionResult.top_expression === 'sad' && '😔'}
                  {expressionResult.top_expression === 'neutral' && '😐'}
                  {expressionResult.top_expression === 'surprise' && '😲'}
                  {expressionResult.top_expression === 'fear' && '😨'}
                  {expressionResult.top_expression === 'angry' && '😠'}
                  {expressionResult.top_expression === 'disgust' && '😣'}
                </div>
                <div className="expr-text-meta">
                  <span className="expr-name">{expressionResult.top_expression}</span>
                  <span className="expr-conf">
                    {Math.round(expressionResult.confidence * 100)}% Model Confidence
                  </span>
                </div>
              </div>

              {/* 7-Emotion Probability Breakdown */}
              <div className="probabilities-breakdown">
                <span className="breakdown-title">FER-2013 Class Distribution:</span>
                {Object.entries(expressionResult.probabilities || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([emotion, prob]) => (
                    <div key={emotion} className="prob-bar-row">
                      <span className="prob-name">{emotion}</span>
                      <div className="prob-track">
                        <div
                          className="prob-fill"
                          style={{ width: `${Math.round(prob * 100)}%` }}
                        ></div>
                      </div>
                      <span className="prob-pct">{Math.round(prob * 100)}%</span>
                    </div>
                  ))}
              </div>

              {/* Mandatory Responsible AI Limitations Notice (PRD FR-EXP-6, FR-RES-1) */}
              <div className="limitations-alert">
                <Info size={16} className="alert-icon" />
                <p>
                  <strong>Limitations Notice:</strong> This shows a visible facial expression in one frame. It does not measure how you feel or your stress level.
                </p>
              </div>
            </div>
          ) : (
            <div className="no-camera-state">
              <p>Camera analysis was skipped or not enabled for this check-in.</p>
              <p className="no-camera-sub">
                Your check-in is complete using your self-reported inputs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Actionable Suggestions */}
      <div className="card suggestions-section">
        <div className="suggestions-header">
          <Sparkles className="section-icon" size={20} />
          <div>
            <h3>Actionable Next Steps</h3>
            <p className="section-sub">
              Personalized, non-clinical practices based on your self-reported inputs.
            </p>
          </div>
        </div>

        <div className="suggestions-cards-grid">
          {suggestions.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Sparkles;
            return (
              <div key={item.id} className="suggestion-card">
                <div className="sug-header">
                  <div className="sug-icon-box">
                    <IconComponent size={18} />
                  </div>
                  <span className="sug-category">{item.category}</span>
                </div>
                <h4 className="sug-title">{item.title}</h4>
                <p className="sug-desc">{item.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  {item.actionType === 'breathing' && (
                    <button
                      type="button"
                      className="btn btn-outline-primary sug-action-btn"
                      onClick={onStartBreathing}
                    >
                      <Wind size={15} /> Start Guided Breathing Tool
                    </button>
                  )}
                  {item.actionType !== 'info' && (
                    <button
                      type="button"
                      className={`btn btn-sm ${completedActivities.has(item.id) ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => handleMarkActivityDone(item)}
                      disabled={completedActivities.has(item.id)}
                    >
                      {completedActivities.has(item.id) ? (
                        <>
                          <CheckCircle size={14} /> Completed Practice
                        </>
                      ) : (
                        'Mark as Done'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Bottom Save & Navigation Actions */}
      <div className="results-footer-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onGoHome}
        >
          Return to Dashboard
        </button>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onStartBreathing}
        >
          <Wind size={16} /> 2-Min Calming Breathing
        </button>

        <button
          type="button"
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <>
              <CheckCircle size={18} /> Saved to History
            </>
          ) : (
            <>
              <Save size={18} /> Save Check-In to History
            </>
          )}
        </button>
      </div>
    </div>
  );
}
