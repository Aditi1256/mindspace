import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind, CheckCircle2 } from 'lucide-react';

const PHASES = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', scale: 1.35 },
  { name: 'Hold', duration: 4, instruction: 'Gently hold your breath, relax shoulders...', scale: 1.35 },
  { name: 'Exhale', duration: 4, instruction: 'Slowly release breath through your mouth...', scale: 0.85 },
  { name: 'Rest', duration: 4, instruction: 'Pause naturally before the next cycle...', scale: 0.85 },
];

export default function BreathingExercise({ onComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(PHASES[0].duration);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const currentPhase = PHASES[currentPhaseIndex];

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next phase
            const nextIndex = (currentPhaseIndex + 1) % PHASES.length;
            setCurrentPhaseIndex(nextIndex);
            if (nextIndex === 0) {
              setCyclesCompleted((c) => c + 1);
            }
            return PHASES[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, currentPhaseIndex]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(PHASES[0].duration);
    setCyclesCompleted(0);
  };

  return (
    <div className="breathing-container">
      <div className="breathing-card">
        <div className="breathing-header">
          <div className="breathing-icon-wrap">
            <Wind size={22} />
          </div>
          <h2>4-4-4 Box Breathing Session</h2>
          <p className="breathing-subtitle">
            A scientifically grounded technique used to deactivate the sympathetic nervous system and rapidly alleviate acute academic anxiety.
          </p>
        </div>

        {/* Visual Breathing Ring */}
        <div className="breathing-ring-wrapper">
          <div
            className={`breathing-circle-outer ${isActive ? 'animating' : ''}`}
            style={{
              transform: isActive ? `scale(${currentPhase.scale})` : 'scale(1)',
              transition: `transform ${currentPhase.duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            <div className="breathing-circle-inner">
              <span className="phase-title">{currentPhase.name}</span>
              <span className="phase-timer">{secondsRemaining}s</span>
            </div>
          </div>
        </div>

        <p className="breathing-instruction">{currentPhase.instruction}</p>

        {/* Progress & Stats */}
        <div className="breathing-stats">
          <div className="stat-pill">
            <CheckCircle2 size={16} />
            <span>Completed Cycles: <strong>{cyclesCompleted}</strong></span>
          </div>
          <div className="stat-pill">
            <span>Target: 4 Cycles (~2 mins)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="breathing-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              type="button"
              className={`btn ${isActive ? 'btn-warning' : 'btn-primary'}`}
              onClick={handleToggle}
            >
              {isActive ? (
                <>
                  <Pause size={18} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} /> Begin Breathing
                </>
              )}
            </button>
          </div>

          {cyclesCompleted >= 1 && (
            <button
              type="button"
              className="btn btn-success"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                setIsActive(false);
                if (onComplete) onComplete(cyclesCompleted);
              }}
            >
              <CheckCircle2 size={18} /> Log {cyclesCompleted} Cycles to Wellness History
            </button>
          )}
        </div>
      </div>
    </div>

  );
}
