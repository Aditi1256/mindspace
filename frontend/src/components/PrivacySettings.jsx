import React, { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Download,
  AlertTriangle,
  Lock,
  EyeOff,
  CheckCircle2,
  FileCheck,
  UserX,
  User,
} from 'lucide-react';

export default function PrivacySettings({
  preferences,
  onUpdatePreferences,
  onClearAllData,
  onExportData,
  checkinsCount = 0,
  currentUser = null,
  onDeleteAccount = null,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleToggleExpressionStorage = (e) => {
    onUpdatePreferences({ saveExpressionResults: e.target.checked });
  };

  const handleExportJson = async () => {
    let data;
    if (onExportData) {
      data = await onExportData();
    } else {
      data = {
        exported_at: new Date().toISOString(),
        student_preferences: preferences,
        checkins: JSON.parse(localStorage.getItem('student_stress_checkins') || '[]'),
      };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_wellness_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="privacy-settings-container">
      <div className="settings-header-card">
        <div className="settings-icon-wrap">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2>Privacy Controls & Data Ownership</h2>
          <p className="card-subtitle">
            You own 100% of your wellness data. Here you can inspect privacy policies, configure expression storage, export your logs, or permanently delete everything.
          </p>
        </div>
      </div>

      {/* Account Info (if authenticated) */}
      {currentUser && (
        <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#14532d', display: 'block' }}>Authenticated Student Profile</strong>
                <span style={{ fontSize: '0.85rem', color: '#166534' }}>{currentUser.email}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803d', backgroundColor: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
              Data Isolated & Password Protected
            </div>
          </div>
        </div>
      )}

      {/* Consent & Audit Record (PRD FR-PRIV-1) */}
      <div className="card consent-audit-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileCheck size={20} color="#0d9488" />
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Consent & Compliance Audit Log</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>DISCLOSURE VERSION</span>
            <strong>PRD v1.0 (Oct 2026)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>WEBCAM CONSENT MODEL</span>
            <strong style={{ color: '#166534' }}>Explicit Session-by-Session Opt-In</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>FRAME STORAGE</span>
            <strong>0 Images (RAM transient buffer only)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>THIRD-PARTY SHARING</span>
            <strong>0% (Self-contained system)</strong>
          </div>
        </div>
      </div>

      {/* Principles Summary */}
      <div className="card privacy-card">
        <h3>Our Core Privacy Guarantees</h3>
        <div className="privacy-guarantee-grid">
          <div className="guarantee-item">
            <Lock size={18} className="g-icon" />
            <div>
              <strong>Transient In-Memory Processing</strong>
              <p>When you enable your camera, single frames are analyzed in system RAM and immediately discarded. No video or photo is ever written to disk.</p>
            </div>
          </div>

          <div className="guarantee-item">
            <EyeOff size={18} className="g-icon" />
            <div>
              <strong>No Third-Party Trackers</strong>
              <p>We do not use surveillance cookies, marketing pixels, or third-party behavioral trackers. Your data remains yours.</p>
            </div>
          </div>

          <div className="guarantee-item">
            <CheckCircle2 size={18} className="g-icon" />
            <div>
              <strong>Self-Report Sovereignty</strong>
              <p>Your self-reported stress is the single source of truth. The facial expression model never overrides your words or diagnoses you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Controls */}
      <div className="card settings-controls-card">
        <h3>Storage Preferences</h3>

        <div className="setting-toggle-row">
          <div>
            <span className="toggle-title">Save Facial Expression Labels in Check-In Records</span>
            <p className="toggle-sub">
              When checked, detected emotion labels (e.g. "neutral", 78%) are attached to your saved check-in history. If unchecked, check-ins only retain your numeric questionnaire answers.
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={preferences.saveExpressionResults}
              onChange={handleToggleExpressionStorage}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-status-row">
          <span className="status-label">Current Data Footprint:</span>
          <span className="status-val">{checkinsCount} check-in entries stored in database.</span>
        </div>
      </div>

      {/* Export & Deletion Section */}
      <div className="card actions-danger-card">
        <h3>Data Export & Right to Erasure</h3>
        <p className="card-subtitle">
          Export your complete check-in dataset as a portable JSON file, or permanently wipe your local records.
        </p>

        <div className="danger-actions-row">
          <button type="button" className="btn btn-secondary" onClick={handleExportJson}>
            <Download size={16} /> Export All Data (JSON)
          </button>
          {exportNotice && <span className="export-toast">JSON file downloaded!</span>}

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} /> Delete Check-In Data
          </button>

          {currentUser && onDeleteAccount && (
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: '#7f1d1d', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowAccountDeleteConfirm(true)}
            >
              <UserX size={16} /> Delete Account Permanently
            </button>
          )}
        </div>

        {/* Confirmation Modal for Data Wipe */}
        {showDeleteConfirm && (
          <div className="delete-confirm-box">
            <AlertTriangle size={20} className="warning-icon" />
            <div>
              <h4>Are you sure you want to delete all check-in data?</h4>
              <p>
                This will wipe your check-in records, expressions, and completed activity logs. This action cannot be undone.
              </p>
              <div className="confirm-btns">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    onClearAllData();
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, Wipe Data
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Permanent Account Deletion */}
        {showAccountDeleteConfirm && (
          <div className="delete-confirm-box" style={{ borderLeftColor: '#7f1d1d', backgroundColor: '#fef2f2' }}>
            <AlertTriangle size={20} style={{ color: '#991b1b', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: '#991b1b' }}>Permanently Delete Student Account?</h4>
              <p style={{ color: '#7f1d1d' }}>
                This will delete your credentials and all associated check-ins, expression logs, and activity records via ON DELETE CASCADE. Your account cannot be recovered.
              </p>
              <div className="confirm-btns">
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#991b1b', color: '#ffffff' }}
                  onClick={() => {
                    if (onDeleteAccount) onDeleteAccount();
                    setShowAccountDeleteConfirm(false);
                  }}
                >
                  Yes, Delete My Account
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowAccountDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
