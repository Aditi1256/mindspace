import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  ArrowRight,
  ArrowLeft,
  Brain,
  Zap,
  HeartHandshake,
  Check,
  Moon,
  BookOpen,
  Coffee,
  Activity,
  Smile,
  Meh,
  Frown,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import ConsentModal from './ConsentModal';
import WebcamCapture from './WebcamCapture';

const STRESS_LEVEL_INFO = [
  { val: 0, label: 'Completely Peaceful', desc: 'Mind is clear, zero anxiety, fully grounded.', emoji: '🧘', color: '#10b981' },
  { val: 1, label: 'Very Low Stress', desc: 'Relaxed and calm, smooth sailing.', emoji: '😌', color: '#10b981' },
  { val: 2, label: 'Low Stress', desc: 'Calm, in good control of priorities.', emoji: '🙂', color: '#10b981' },
  { val: 3, label: 'Mild Tension', desc: 'Slight to-do list pressure, manageable.', emoji: '🌱', color: '#34d399' },
  { val: 4, label: 'Noticeable Stress', desc: 'Academic workload is starting to weigh in.', emoji: '😐', color: '#fbbf24' },
  { val: 5, label: 'Moderate Stress', desc: 'Steady mental load, focusing takes deliberate effort.', emoji: '🤔', color: '#f59e0b' },
  { val: 6, label: 'Heightened Stress', desc: 'Feeling rushed, minor deadline anxiety.', emoji: '😬', color: '#f59e0b' },
  { val: 7, label: 'Significant Strain', desc: 'Feeling drained, hard to disconnect from studies.', emoji: '😟', color: '#fb923c' },
  { val: 8, label: 'High Stress', desc: 'Physical muscle tension, restlessness or worry.', emoji: '😰', color: '#f87171' },
  { val: 9, label: 'Very High Stress', desc: 'Overwhelmed, struggle to concentrate or sleep.', emoji: '😫', color: '#ef4444' },
  { val: 10, label: 'Extreme Burnout', desc: 'Exhausted, urgently needing rest and compassionate support.', emoji: '🤯', color: '#dc2626' },
];

const QUICK_TAGS = [
  { id: 'exam_week', label: '📚 Exam Week', icon: BookOpen },
  { id: 'all_nighter', label: '😴 Pulled All-Nighter', icon: Moon },
  { id: 'need_coffee', label: '☕ 3rd Coffee', icon: Coffee },
  { id: 'in_the_flow', label: '🎯 In The Flow', icon: Zap },
  { id: 'overwhelmed', label: '💆 Need A Break', icon: Sparkles },
  { id: 'worked_out', label: '🏃 Just Worked Out', icon: Activity },
  { id: 'with_friends', label: '🫂 Talked to a Friend', icon: HeartHandshake },
  { id: 'low_battery', label: '🔋 Low Battery', icon: Flame },
];

export default function Questionnaire({ onSubmit, isSubmitting }) {
  // Wizard steps: 1: Mind/Academic, 2: Body/Vitality, 3: Social/Tags, 'webcam': optional camera
  const [activeTab, setActiveTab] = useState(1);
  const [isWebcamStep, setIsWebcamStep] = useState(false);

  // Core Metrics
  const [stressLevel, setStressLevel] = useState(5);
  const [workloadScore, setWorkloadScore] = useState(3);
  const [pressureScore, setPressureScore] = useState(3);

  // New Lifestyle & Vitality Metrics (Phase 6 Enhancement)
  const [sleepScore, setSleepScore] = useState(3);
  const [energyScore, setEnergyScore] = useState(3);
  const [movementScore, setMovementScore] = useState(3);
  const [socialScore, setSocialScore] = useState(3);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');

  // Camera state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState(null);

  const currentStressInfo = STRESS_LEVEL_INFO[stressLevel] || STRESS_LEVEL_INFO[5];

  const toggleTag = (tagLabel) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleNextToWebcam = () => {
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    setIsWebcamStep(true);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setIsWebcamStep(false);
    handleFinalSubmit(null);
  };

  const handleFinalSubmit = (imageToUse) => {
    const finalImage = imageToUse !== undefined ? imageToUse : capturedImageData;
    onSubmit({
      stressLevel: Number(stressLevel),
      workloadScore: Number(workloadScore),
      sleepScore: Number(sleepScore),
      pressureScore: Number(pressureScore),
      energyScore: Number(energyScore),
      socialScore: Number(socialScore),
      movementScore: Number(movementScore),
      tags: selectedTags,
      note: note.trim(),
      imageData: finalImage,
    });
  };

  return (
    <div className="checkin-container" style={{ maxWidth: '780px', margin: '0 auto', padding: '1rem' }}>
      {/* Non-clinical Ethical Disclaimer Banner */}
      <div
        className="reflection-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(240, 253, 250, 0.95), rgba(224, 242, 254, 0.95))',
          border: '1px solid #ccfbf1',
          borderRadius: '1rem',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(13, 148, 136, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Sparkles size={20} color="#0d9488" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.45 }}>
          <strong>Self-Reflection Sanctuary:</strong> Your self-report is 100% your own private ground truth. Camera input is purely optional and transient.
        </p>
      </div>

      {!isWebcamStep ? (
        <div
          className="questionnaire-card"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 25px rgba(99, 102, 241, 0.05)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Lighting Background Accents */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: currentStressInfo.color,
              opacity: 0.12,
              filter: 'blur(50px)',
              pointerEvents: 'none',
              transition: 'background 0.4s ease',
            }}
          />

          {/* Stepper Header / Category Progress Tabs */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6366f1' }}>
                Step {activeTab} of 3
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {activeTab === 1 && 'Mental & Academic Load'}
                {activeTab === 2 && 'Body, Sleep & Vitality'}
                {activeTab === 3 && 'Support, Mindset & Tags'}
              </span>
            </div>

            {/* Visual Step Indicator Bar */}
            <div style={{ display: 'flex', gap: '0.4rem', height: '6px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(activeTab / 3) * 100}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  borderRadius: '9999px',
                  transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            {/* Quick Step Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.75rem',
                  border: activeTab === 1 ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 1 ? '#eef2ff' : '#ffffff',
                  color: activeTab === 1 ? '#4338ca' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Brain size={15} />
                <span>1. Mind</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.75rem',
                  border: activeTab === 2 ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 2 ? '#eef2ff' : '#ffffff',
                  color: activeTab === 2 ? '#4338ca' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Zap size={15} />
                <span>2. Body</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(3)}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.75rem',
                  border: activeTab === 3 ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 3 ? '#eef2ff' : '#ffffff',
                  color: activeTab === 3 ? '#4338ca' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <HeartHandshake size={15} />
                <span>3. Support</span>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: MIND & ACADEMIC LOAD */}
          {/* ==================================================== */}
          {activeTab === 1 && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              {/* Dynamic Interactive Stress Aura Card */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '1.25rem',
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  border: `1.5px solid ${currentStressInfo.color}40`,
                  boxShadow: `0 10px 25px -5px ${currentStressInfo.color}25`,
                  marginBottom: '1.75rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Glowing Breathing Pulse Orb */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: currentStressInfo.color,
                        boxShadow: `0 0 20px ${currentStressInfo.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        animation: 'pulseAura 3s infinite ease-in-out',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {currentStressInfo.emoji}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        1. Overall Stress Level
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: currentStressInfo.color, fontWeight: 600 }}>
                        {currentStressInfo.label}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.85rem',
                      borderRadius: '0.75rem',
                      backgroundColor: `${currentStressInfo.color}15`,
                      color: currentStressInfo.color,
                      border: `1px solid ${currentStressInfo.color}35`,
                    }}
                  >
                    {stressLevel} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>/ 10</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                  {currentStressInfo.desc}
                </p>

                {/* Range Slider */}
                <input
                  id="stress-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    accentColor: currentStressInfo.color,
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 }}>
                  <span>0 (Grounded)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Overwhelmed)</span>
                </div>
              </div>

              {/* Question 2: Workload Manageability */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  2. Academic Workload Manageability
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  How easily can you manage current assignments, homework, and exam prep?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Crushing', emoji: '😫' },
                    { val: 2, label: 'Heavy', emoji: '📚' },
                    { val: 3, label: 'Manageable', emoji: '⚖️' },
                    { val: 4, label: 'Steady', emoji: '👍' },
                    { val: 5, label: 'Very Easy', emoji: '✨' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setWorkloadScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: workloadScore === item.val ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        backgroundColor: workloadScore === item.val ? '#eef2ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: workloadScore === item.val ? '#4338ca' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Academic Deadline Pressure */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  3. Upcoming Deadline Pressure
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Are pending submissions or exam dates causing racing thoughts?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Minimal', emoji: '🏖️' },
                    { val: 2, label: 'Mild', emoji: '☕' },
                    { val: 3, label: 'Moderate', emoji: '🗓️' },
                    { val: 4, label: 'High', emoji: '⏳' },
                    { val: 5, label: 'Intense', emoji: '🚨' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setPressureScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: pressureScore === item.val ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        backgroundColor: pressureScore === item.val ? '#eef2ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: pressureScore === item.val ? '#4338ca' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  style={{
                    padding: '0.8rem 1.6rem',
                    borderRadius: '0.85rem',
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <span>Next: Body & Vitality</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: BODY, SLEEP & VITALITY */}
          {/* ==================================================== */}
          {activeTab === 2 && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              {/* Question 4: Sleep Quality */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  4. Last Night's Sleep Quality
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  How refreshed and rested do you feel today?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Exhausted', emoji: '😵' },
                    { val: 2, label: 'Restless', emoji: '🥱' },
                    { val: 3, label: 'Fair (5-6h)', emoji: '😴' },
                    { val: 4, label: 'Good Rest', emoji: '🔋' },
                    { val: 5, label: 'Deeply Restful', emoji: '🛌' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setSleepScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: sleepScore === item.val ? '2px solid #06b6d4' : '1px solid #e2e8f0',
                        backgroundColor: sleepScore === item.val ? '#ecfeff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: sleepScore === item.val ? '#0e7490' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Physical Energy & Focus */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  5. Physical Energy & Mental Focus (New)
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Are you experiencing brain fog or feeling sharp and productive?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Severe Fog', emoji: '🌫️' },
                    { val: 2, label: 'Drowsy', emoji: '📉' },
                    { val: 3, label: 'Average', emoji: '⚡' },
                    { val: 4, label: 'Sharp & Alert', emoji: '💡' },
                    { val: 5, label: 'Super Charged', emoji: '🚀' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setEnergyScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: energyScore === item.val ? '2px solid #06b6d4' : '1px solid #e2e8f0',
                        backgroundColor: energyScore === item.val ? '#ecfeff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: energyScore === item.val ? '#0e7490' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 6: Movement & Screen Time Balance */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  6. Screen Time & Movement Balance (New)
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Have you stepped outside, stretched, or been glued to a laptop?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Desk Bound', emoji: '💻' },
                    { val: 2, label: 'Barely Moved', emoji: '🪑' },
                    { val: 3, label: 'Short Break', emoji: '🚶' },
                    { val: 4, label: 'Good Walks', emoji: '👟' },
                    { val: 5, label: 'Active & Fresh', emoji: '🏃' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setMovementScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: movementScore === item.val ? '2px solid #06b6d4' : '1px solid #e2e8f0',
                        backgroundColor: movementScore === item.val ? '#ecfeff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: movementScore === item.val ? '#0e7490' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.85rem',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  style={{
                    padding: '0.8rem 1.6rem',
                    borderRadius: '0.85rem',
                    backgroundColor: '#0891b2',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)',
                  }}
                >
                  <span>Next: Support & Tags</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: SOCIAL, MOOD TAGS & NOTES */}
          {/* ==================================================== */}
          {activeTab === 3 && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              {/* Question 7: Social Connection & Support */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  7. Social Connection & Peer Support (New)
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Do you feel supported by your friends, study group, or family right now?
                </p>
                <div className="rating-buttons-grid">
                  {[
                    { val: 1, label: 'Isolated', emoji: '🥀' },
                    { val: 2, label: 'On My Own', emoji: '👤' },
                    { val: 3, label: 'Occasional', emoji: '💬' },
                    { val: 4, label: 'Connected', emoji: '🤝' },
                    { val: 5, label: 'Surrounded', emoji: '❤️' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className="rating-option-btn"
                      onClick={() => setSocialScore(item.val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '0.85rem',
                        border: socialScore === item.val ? '2px solid #10b981' : '1px solid #e2e8f0',
                        backgroundColor: socialScore === item.val ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="rating-emoji" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                      <div className="rating-label-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: socialScore === item.val ? '#047857' : '#334155' }}>
                        {item.val} - {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick-Tap Mood & Context Tags */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                  Quick Context Chips (Tap to Add)
                </label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  Quickly tag your circumstances today for your weekly charts:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.label);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.label)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '9999px',
                          border: isSelected ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#6366f1' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <Check size={13} />}
                        <span>{tag.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflection Note */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label htmlFor="checkin-note" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                    Private Reflection Note
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{note.length} / 500</span>
                </div>
                <textarea
                  id="checkin-note"
                  rows={3}
                  maxLength={500}
                  placeholder="What is specifically on your mind today? (e.g. Physics midterm prep, felt great after talking to Mom, need to sleep earlier...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.88rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Final Submit Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.85rem',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(null)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.8rem 1.25rem',
                      borderRadius: '0.85rem',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Submit Self-Report Only
                  </button>

                  <button
                    type="button"
                    onClick={handleNextToWebcam}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.8rem 1.5rem',
                      borderRadius: '0.85rem',
                      background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)',
                    }}
                  >
                    <Camera size={18} />
                    <span>Optional Facial Check</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Webcam Step */
        <div
          className="questionnaire-card"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Optional Facial Expression Analysis
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Hold a natural expression. A single snapshot is taken, analyzed in memory, and immediately discarded.
            </p>
          </div>

          <WebcamCapture
            onCapture={(dataUrl) => setCapturedImageData(dataUrl)}
            onSkip={() => handleFinalSubmit(null)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsWebcamStep(false)}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.85rem',
                backgroundColor: '#ffffff',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ArrowLeft size={16} /> Back to Questions
            </button>
            <button
              type="button"
              onClick={() => handleFinalSubmit(capturedImageData)}
              disabled={!capturedImageData || isSubmitting}
              style={{
                padding: '0.8rem 1.75rem',
                borderRadius: '0.85rem',
                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                cursor: !capturedImageData || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
              }}
            >
              {isSubmitting ? 'Analyzing In-Memory...' : 'Complete Check-In'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Consent Dialog */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentDecline}
        onAccept={handleConsentAccept}
      />
    </div>
  );
}
