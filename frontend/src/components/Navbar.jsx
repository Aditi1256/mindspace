import React from 'react';
import { HeartPulse, PlusCircle, Wind, History, Shield, User, Cpu, LogIn, LogOut } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser = null,
  onOpenAuth = () => {},
  onLogout = () => {},
  serverHealth = { status: 'checking', model_loaded: false, model_version: 'cnn-v1.0' },
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HeartPulse },
    { id: 'checkin', label: 'New Check-In', icon: PlusCircle },
    { id: 'breathing', label: 'Breathing Tool', icon: Wind },
    { id: 'history', label: 'History & Trends', icon: History },
    { id: 'privacy', label: 'Privacy & Settings', icon: Shield },
  ];

  const isServerOnline = serverHealth.status === 'healthy';

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-wrap">
            <HeartPulse className="brand-icon" size={24} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">MindSpace</span>
            <span className="brand-tagline">Student Stress Check-In</span>
          </div>
        </div>

        <nav className="navbar-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="navbar-right-group" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Live Backend & ML Status Badge */}
          <div
            className="navbar-api-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: isServerOnline ? '#f0fdf4' : '#fef2f2',
              color: isServerOnline ? '#166534' : '#991b1b',
              border: `1px solid ${isServerOnline ? '#bbf7d0' : '#fecaca'}`,
            }}
            title={isServerOnline ? `FastAPI Server Connected with Model: ${serverHealth.model_version}` : 'Connecting to local backend...'}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isServerOnline ? '#22c55e' : '#ef4444',
              }}
            />
            <Cpu size={13} />
            <span>{isServerOnline ? `API • ${serverHealth.model_version}` : 'Offline Mode'}</span>
          </div>

          {/* User Account Controls */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div
                className="navbar-user-chip"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
                title={`Logged in as ${currentUser.email}`}
              >
                <User size={14} />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Log out"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="navbar-user-chip">
                <div className="chip-indicator"></div>
                <User size={15} />
                <span>Guest</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
