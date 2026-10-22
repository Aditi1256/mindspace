import React, { useState } from 'react';
import { Sparkles, Camera, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import ConsentModal from './ConsentModal';
import WebcamCapture from './WebcamCapture';

const STRESS_LEVEL_LABELS = {
  0: 'Zero Stress - Completely peaceful & grounded',
  1: 'Very Low - Relaxed, mind is clear',
  2: 'Low - Calm, in good control',
  3: 'Mild - Minor daily to-do tension',
  4: 'Noticeable - Feeling modest academic pressure',
  5: 'Moderate - Steady stress, focusing takes extra effort',
  6: 'Heightened - Feeling strained, beginning to feel rushed',
  7: 'Significant - Feeling drained, hard to step back',
  8: 'High - Heavy pressure, physical tension or worry',
  9: 'Very High - Overwhelmed, struggle to concentrate',
  10: 'Extreme - Exhausted, urgently needing rest & support',
};

export default function Questionnaire({ onSubmit, isSubmitting }) {
  const [step, setStep] = useState('questions'); // 'questions' -> 'webcam'
  const [stressLevel, setStressLevel] = useState(5);
  const [workloadScore, setWorkloadScore] = useState(3);
  const [sleepScore, setSleepScore] = useState(3);
  const [pressureScore, setPressureScore] = useState(3);
  const [note, setNote] = useState('');

  // Webcam state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState(null);

  const handleNextToWebcam = (e) => {
    e.preventDefault();
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    setWebcamEnabled(true);
    setStep('webcam');
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setWebcamEnabled(false);
    // Submit directly with questionnaire responses
    handleFinalSubmit(null);
  };

  const handleFrameCaptured = (dataUrl) => {
    setCapturedImageData(dataUrl);
  };

  const handleFinalSubmit = (imageToUse) => {
    const finalImage = imageToUse !== undefined ? imageToUse : capturedImageData;
    onSubmit({
      stressLevel: Number(stressLevel),
      workloadScore: Number(workloadScore),
      sleepScore: Number(sleepScore),
      pressureScore: Number(pressureScore),
      note: note.trim(),
      imageData: finalImage,
    });
  };

  return (
    <div className="checkin-container">
      {/* Ethical self-reflection notice */}
      <div className="reflection-banner">
        <Sparkles size={18} className="banner-icon" />
        <p>
          <strong>Self-Reflection Tool:</strong> This check-in is designed to help you pause and reflect on your semester. It is strictly non-clinical and private.
        </p>
      </div>

      {step === 'questions' ? (
        <form onSubmit={handleNextToWebcam} className="questionnaire-card">
          <div className="card-header">
            <h2>How are you feeling right now?</h2>
            <p className="card-subtitle">
              Answer honestly. Your self-report is always the ground truth for your insights.
            </p>
          </div>

          {/* Question 1: Stress Level 0-10 */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="stress-slider" className="form-label">
                1. Overall Stress Level (0 - 10)
              </label>
              <span className={`stress-badge badge-val-${stressLevel}`}>
                {stressLevel} / 10
              </span>
            </div>
            <p className="field-hint">{STRESS_LEVEL_LABELS[stressLevel]}</p>
            <input
              id="stress-slider"
              type="range"
              min="0"
              max="10"
              step="1"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="stress-range-slider"
            />
            <div className="slider-ticks">
              <span>0 (Peaceful)</span>
              <span>5 (Moderate)</span>
              <span>10 (Overwhelmed)</span>
            </div>
          </div>

          {/* Question 2: Workload Manageability 1-5 */}
          <div className="form-group">
            <label className="form-label">
              2. Workload Manageability (1: Overwhelming - 5: Very Manageable)
            </label>
            <p className="field-hint">How easily can you manage your current deadlines and tasks?</p>
            <div className="scale-options" role="radiogroup" aria-label="Workload Manageability">
              {[
                { val: 1, label: '1 - Overwhelming' },
                { val: 2, label: '2 - Heavy' },
                { val: 3, label: '3 - Manageable' },
                { val: 4, label: '4 - Good' },
                { val: 5, label: '5 - Very Easy' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`scale-btn ${workloadScore === opt.val ? 'selected' : ''}`}
                  onClick={() => setWorkloadScore(opt.val)}
                >
                  <span className="scale-num">{opt.val}</span>
                  <span className="scale-text">{opt.label.split(' - ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Sleep Quality 1-5 */}
          <div className="form-group">
            <label className="form-label">
              3. Recent Sleep Quality (1: Very Poor - 5: Deeply Restful)
            </label>
            <p className="field-hint">How refreshed do you feel when waking up?</p>
            <div className="scale-options" role="radiogroup" aria-label="Sleep Quality">
              {[
                { val: 1, label: '1 - Exhausted' },
                { val: 2, label: '2 - Restless' },
                { val: 3, label: '3 - Fair' },
                { val: 4, label: '4 - Good' },
                { val: 5, label: '5 - Restful' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`scale-btn ${sleepScore === opt.val ? 'selected' : ''}`}
                  onClick={() => setSleepScore(opt.val)}
                >
                  <span className="scale-num">{opt.val}</span>
                  <span className="scale-text">{opt.label.split(' - ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Academic Pressure Impact 1-5 */}
          <div className="form-group">
            <label className="form-label">
              4. Academic Pressure Impact (1: Minimal - 5: Intense)
            </label>
            <p className="field-hint">How much are exams, projects, or placements weighing on your thoughts?</p>
            <div className="scale-options" role="radiogroup" aria-label="Academic Pressure">
              {[
                { val: 1, label: '1 - Minimal' },
                { val: 2, label: '2 - Mild' },
                { val: 3, label: '3 - Moderate' },
                { val: 4, label: '4 - Heavy' },
                { val: 5, label: '5 - Intense' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`scale-btn ${pressureScore === opt.val ? 'selected' : ''}`}
                  onClick={() => setPressureScore(opt.val)}
                >
                  <span className="scale-num">{opt.val}</span>
                  <span className="scale-text">{opt.label.split(' - ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="checkin-note" className="form-label">
                Optional Reflection Note (Private)
              </label>
              <span className="char-count">{note.length} / 500</span>
            </div>
            <textarea
              id="checkin-note"
              rows={3}
              maxLength={500}
              placeholder="What specific tasks or thoughts are on your mind right now?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleFinalSubmit(null)}
              disabled={isSubmitting}
            >
              Submit Without Camera
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <span>Optional Facial Expression Check</span>
              <Camera size={18} />
            </button>
          </div>
        </form>
      ) : (
        /* Webcam Step */
        <div className="questionnaire-card">
          <div className="card-header">
            <h2>Optional Facial Expression Analysis</h2>
            <p className="card-subtitle">
              Hold a natural expression. A single snapshot is taken, analyzed in memory, and immediately discarded.
            </p>
          </div>

          <WebcamCapture
            onCapture={handleFrameCaptured}
            onSkip={() => handleFinalSubmit(null)}
          />

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep('questions')}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} /> Back to Questions
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleFinalSubmit(capturedImageData)}
              disabled={!capturedImageData || isSubmitting}
            >
              {isSubmitting ? 'Analyzing In-Memory...' : 'Complete Check-In'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Camera Consent Dialog */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentDecline}
        onAccept={handleConsentAccept}
      />
    </div>
  );
}
