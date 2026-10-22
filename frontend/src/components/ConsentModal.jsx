import React, { useEffect } from 'react';
import { Camera, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onAccept }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div className="modal-icon-badge">
            <Camera size={24} />
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close consent dialog"
          >
            <X size={20} />
          </button>
        </div>

        <h3 id="consent-title" className="modal-title">
          Webcam Expression Analysis Consent
        </h3>
        <p className="modal-subtitle">
          Please review how your facial frame is processed before enabling your camera.
        </p>

        <div className="consent-bullets">
          <div className="consent-bullet">
            <ShieldCheck className="bullet-icon" size={18} />
            <div>
              <strong>Privacy-First & Transient</strong>
              <p>Only a single still frame is sampled. It is analyzed in memory and immediately discarded. No video or photo is ever permanently stored or uploaded to third parties.</p>
            </div>
          </div>

          <div className="consent-bullet">
            <CheckCircle2 className="bullet-icon" size={18} />
            <div>
              <strong>Informational Only (Not a Diagnosis)</strong>
              <p>The model detects facial muscle patterns (FER-2013: 7 emotions). It does NOT measure your internal stress or mental health. Your questionnaire is always the primary signal.</p>
            </div>
          </div>

          <div className="consent-bullet">
            <CheckCircle2 className="bullet-icon" size={18} />
            <div>
              <strong>100% Voluntary</strong>
              <p>You can skip this step anytime and complete the check-in with the self-report questions alone.</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Skip Camera (Questionnaire Only)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAccept}
          >
            I Consent & Enable Camera
          </button>
        </div>
      </div>
    </div>
  );
}
