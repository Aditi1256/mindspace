import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Activity,
  Calendar,
  Trash2,
  Smile,
  Moon,
  Briefcase,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Award,
} from 'lucide-react';

export default function HistoryDashboard({
  checkins = [],
  completedActivitiesCount = 0,
  onDeleteCheckin,
  onStartNewCheckin,
}) {
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Compute stats
  const total = checkins.length;
  const avgStress =
    total > 0
      ? (checkins.reduce((acc, c) => acc + (c.stress_level || 0), 0) / total).toFixed(1)
      : '0.0';
  const avgSleep =
    total > 0
      ? (checkins.reduce((acc, c) => acc + (c.sleep_score || 0), 0) / total).toFixed(1)
      : '0.0';
  const avgWorkload =
    total > 0
      ? (checkins.reduce((acc, c) => acc + (c.workload_score || 0), 0) / total).toFixed(1)
      : '0.0';
  const avgPressure =
    total > 0
      ? (checkins.reduce((acc, c) => acc + (c.pressure_score || 0), 0) / total).toFixed(1)
      : '0.0';

  // Format data for Recharts (sorted chronologically)
  const chartData = [...checkins]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((c) => {
      const d = new Date(c.created_at);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        date: label,
        stress: c.stress_level,
        sleep: c.sleep_score,
        workload: c.workload_score,
        pressure: c.pressure_score,
      };
    });

  const confirmDelete = (id) => {
    if (onDeleteCheckin) {
      onDeleteCheckin(id);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="history-dashboard-container">
      {/* Top Welcome / Overview Section */}
      <div className="dashboard-hero-card">
        <div className="hero-text-side">
          <h2>Welcome to Your Student MindSpace</h2>
          <p className="hero-description">
            Track your semester well-being, notice patterns around upcoming deadlines, and reflect with zero judgment.
          </p>
          <div className="hero-btn-wrap">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStartNewCheckin}
            >
              <PlusCircle size={18} /> Start New Stress Check-In
            </button>
          </div>
        </div>
        <div className="hero-stats-side" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="quick-stat-box">
            <span className="stat-label">Total Check-Ins</span>
            <span className="stat-val">{total}</span>
          </div>
          <div className="quick-stat-box">
            <span className="stat-label">Avg Stress</span>
            <span className="stat-val">{avgStress} / 10</span>
          </div>
          <div className="quick-stat-box">
            <span className="stat-label">Avg Sleep</span>
            <span className="stat-val">{avgSleep} / 5</span>
          </div>
          <div className="quick-stat-box">
            <span className="stat-label">Avg Workload</span>
            <span className="stat-val">{avgWorkload} / 5</span>
          </div>
          <div className="quick-stat-box">
            <span className="stat-label">Avg Pressure</span>
            <span className="stat-val">{avgPressure} / 5</span>
          </div>
          <div className="quick-stat-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <span className="stat-label">Practices Done</span>
            <span className="stat-val" style={{ color: '#34d399' }}>{completedActivitiesCount}</span>
          </div>
        </div>
      </div>

      {/* Weekly Stress Trend Chart (PRD FR-DASH-2, FR-DASH-5) */}
      <div className="card chart-card">
        <div className="chart-header">
          <div>
            <h3>Weekly Self-Reported Wellness Trends</h3>
            <p className="card-subtitle">
              Calculated exclusively from your self-reported inputs (0–10 stress, 1–5 wellness metrics).
            </p>
          </div>
          <span className="chart-badge">Self-Report Ground Truth</span>
        </div>

        {chartData.length > 0 ? (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={chartData} margin={{ top: 10, right: 25, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                  formatter={(value, name) => {
                    const map = {
                      stress: 'Stress (0-10)',
                      sleep: 'Sleep Quality (1-5)',
                      workload: 'Workload (1-5)',
                      pressure: 'Pressure Impact (1-5)',
                    };
                    return [`${value}`, map[name] || name];
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Self-Reported Stress"
                  type="monotone"
                  dataKey="stress"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ fill: '#0d9488', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  name="Sleep Quality"
                  type="monotone"
                  dataKey="sleep"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#6366f1', r: 4 }}
                />
                <Line
                  name="Workload Difficulty"
                  type="monotone"
                  dataKey="workload"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-chart-box">
            <p>No check-ins logged yet. Complete your first check-in to generate trends.</p>
          </div>
        )}
      </div>

      {/* Check-In History List (PRD FR-DASH-1, FR-DASH-4) */}
      <div className="card history-list-card">
        <div className="list-header">
          <h3>Check-In History</h3>
          <span className="records-count">{total} Record{total === 1 ? '' : 's'}</span>
        </div>

        {total === 0 ? (
          <div className="empty-history-box">
            <p>Your history is currently empty.</p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onStartNewCheckin}
            >
              Take Your First Check-In
            </button>
          </div>
        ) : (
          <div className="checkins-table-wrap">
            {checkins.map((item) => {
              const d = new Date(item.created_at);
              const dateStr = d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = d.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={item.id} className="history-row-item">
                  <div className="row-date-col">
                    <span className="row-date">{dateStr}</span>
                    <span className="row-time">{timeStr}</span>
                  </div>

                  <div className="row-scores-col">
                    <span className="score-badge stress-score-badge">
                      Stress: {item.stress_level}/10
                    </span>
                    <span className="score-badge">Sleep: {item.sleep_score}/5</span>
                    <span className="score-badge">Workload: {item.workload_score}/5</span>
                    <span className="score-badge">Pressure: {item.pressure_score}/5</span>
                  </div>

                  <div className="row-expr-col">
                    {item.expression_result ? (
                      <span className="expression-tag">
                        <Smile size={13} />
                        {item.expression_result.top_expression} (
                        {Math.round((item.expression_result.confidence || 0) * 100)}%)
                      </span>
                    ) : (
                      <span className="expression-tag-na">No camera</span>
                    )}
                  </div>

                  {item.note && (
                    <div className="row-note-col">
                      <span className="note-text-snippet">"{item.note}"</span>
                    </div>
                  )}

                  <div className="row-actions-col">
                    {deleteTargetId === item.id ? (
                      <div className="confirm-delete-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmDelete(item.id)}
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => setDeleteTargetId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="delete-icon-btn"
                        onClick={() => setDeleteTargetId(item.id)}
                        title="Delete this check-in"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
