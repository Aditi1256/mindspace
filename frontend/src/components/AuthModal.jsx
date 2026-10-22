import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';

export default function AuthModal({ isOpen, onClose, onSuccess, guestCheckinIds = [] }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveExpressions, setSaveExpressions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (tab === 'login') {
        const data = await apiClient.login(email, password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 600);
      } else {
        // Register
        const data = await apiClient.register(email, password, saveExpressions);
        
        // If guest check-ins exist, automatically migrate them!
        if (guestCheckinIds.length > 0) {
          try {
            await apiClient.upgradeGuest(guestCheckinIds);
          } catch (migErr) {
            console.warn('Guest migration notice:', migErr);
          }
        }

        setSuccessMsg('Account created! Your guest data has been linked.');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '440px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            padding: '0.25rem',
            borderRadius: '50%',
            display: 'flex',
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '1rem',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            marginBottom: '0.75rem',
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            {tab === 'login' ? 'Welcome Back' : 'Create Student Account'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            {tab === 'login'
              ? 'Access your private check-in history & trends'
              : 'Save and sync your wellness reflections across devices'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          borderRadius: '0.75rem',
          padding: '0.25rem',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: '0.55rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: tab === 'login' ? '#ffffff' : 'transparent',
              color: tab === 'login' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: '0.55rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: tab === 'register' ? '#ffffff' : 'transparent',
              color: tab === 'register' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Guest Migration Notice */}
        {tab === 'register' && guestCheckinIds.length > 0 && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.82rem',
            color: '#166534',
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>{guestCheckinIds.length} guest check-in{guestCheckinIds.length > 1 ? 's' : ''}</strong> found in this session. Creating an account will automatically link them!
            </span>
          </div>
        )}

        {/* Error / Success Feedback */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Student Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@university.edu"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  fontSize: '0.9rem',
                  borderRadius: '0.65rem',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '0.7rem 2.4rem 0.7rem 2.4rem',
                  fontSize: '0.9rem',
                  borderRadius: '0.65rem',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.82rem', color: '#475569', cursor: 'pointer', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={saveExpressions}
                onChange={(e) => setSaveExpressions(e.target.checked)}
                style={{ marginTop: '0.15rem' }}
              />
              <span>
                Save my facial expression observations alongside check-ins for trend insights (you can change this anytime).
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            {isLoading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In to MindSpace' : 'Create My Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Privacy Note */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          🔒 Passwords are encrypted with Bcrypt. No camera footage is ever uploaded or stored.
        </div>
      </div>
    </div>
  );
}
