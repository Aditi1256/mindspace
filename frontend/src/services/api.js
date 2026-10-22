/**
 * Real REST API client connecting React frontend to FastAPI backend.
 * Base URL: http://127.0.0.1:8000/api
 * Falls back gracefully to local storage if server is unreachable.
 * Supports Guest Mode and Authenticated Student Accounts (JWT Bearer).
 */

import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'mindspace_auth_token';
const USER_KEY = 'mindspace_auth_user';

export const apiClient = {
  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================

  getStoredToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  getStoredUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setAuthSession(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage access failed:', e);
    }
  },

  clearAuthSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Storage access failed:', e);
    }
  },

  getAuthHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };
    const token = this.getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Registers a new student account (POST /api/auth/register).
   */
  async register(email, password, saveExpressionResults = true) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          password,
          save_expression_results: saveExpressionResults,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed (${res.status})`);
      }

      const data = await res.json();
      this.setAuthSession(data.access_token, data.user);
      return data;
    } catch (err) {
      console.error('[API Client] Registration failed:', err);
      throw err;
    }
  },

  /**
   * Authenticates student credentials (POST /api/auth/login).
   */
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed (${res.status})`);
      }

      const data = await res.json();
      this.setAuthSession(data.access_token, data.user);
      return data;
    } catch (err) {
      console.error('[API Client] Login failed:', err);
      throw err;
    }
  },

  /**
   * Fetches current authenticated profile (GET /api/auth/me).
   */
  async getCurrentUser() {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });

      if (res.ok) {
        const user = await res.json();
        this.setAuthSession(token, user);
        return user;
      } else if (res.status === 401) {
        this.clearAuthSession();
        return null;
      }
    } catch (err) {
      console.warn('[API Client] Current user fetch failed:', err);
    }
    return this.getStoredUser();
  },

  /**
   * Logs out student and purges stored credentials.
   */
  logout() {
    this.clearAuthSession();
  },

  /**
   * Associates guest check-ins with an authenticated account (POST /api/auth/upgrade-guest).
   */
  async upgradeGuest(checkinIds) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/upgrade-guest`, {
        method: 'POST',
        headers: this.getAuthHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({ checkin_ids: checkinIds }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API Client] Guest upgrade error:', err);
    }
    return { imported_count: 0 };
  },

  /**
   * Permanently deletes student account and cascades all data (DELETE /api/users/me).
   */
  async deleteAccount() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });
      if (!res.ok) throw new Error('Account deletion failed');
      this.clearAuthSession();
      mockApi.clearAllData();
      return true;
    } catch (err) {
      console.error('[API Client] Delete account error:', err);
      throw err;
    }
  },

  // ==========================================
  // CORE WELLNESS & CHECK-IN ENDPOINTS
  // ==========================================

  /**
   * Health check to verify live backend and model status.
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      console.warn('[API Client] Backend offline, using local fallback:', err);
      return { status: 'offline', model_loaded: false, model_version: 'mock' };
    }
  },

  /**
   * In-memory face expression prediction via FastAPI + ONNX model.
   * Sends base64 image frame to POST /api/expressions/predict
   */
  async predictExpression(imageDataUrl) {
    try {
      const res = await fetch(`${API_BASE_URL}/expressions/predict`, {
        method: 'POST',
        headers: this.getAuthHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({ image_base64: imageDataUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Prediction failed (${res.status})`);
      }

      return await res.json();
    } catch (err) {
      console.warn('[API Client] Expression prediction fallback to mock:', err);
      return await mockApi.predictExpression(imageDataUrl);
    }
  },

  /**
   * Retrieves check-ins from database via GET /api/checkins/history.
   */
  async getCheckins() {
    try {
      const res = await fetch(`${API_BASE_URL}/checkins/history?limit=50`, {
        method: 'GET',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });
      if (!res.ok) throw new Error('Could not fetch history');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[API Client] History fetch fallback to local storage:', err);
      return mockApi.getCheckins();
    }
  },

  /**
   * Saves a new check-in record via POST /api/checkins.
   */
  async saveCheckin(checkinPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/checkins`, {
        method: 'POST',
        headers: this.getAuthHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          stress_level: checkinPayload.stress_level,
          workload_score: checkinPayload.workload_score,
          sleep_score: checkinPayload.sleep_score,
          pressure_score: checkinPayload.pressure_score,
          note: checkinPayload.note || null,
          expression_result: checkinPayload.expression_result
            ? {
                top_expression: checkinPayload.expression_result.top_expression,
                confidence: checkinPayload.expression_result.confidence,
                probabilities: checkinPayload.expression_result.probabilities,
                model_version: checkinPayload.expression_result.model_version || 'cnn-v1.0',
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save checkin (${res.status})`);
      }

      const saved = await res.json();
      mockApi.saveCheckin(checkinPayload);
      return saved;
    } catch (err) {
      console.warn('[API Client] Save checkin fallback to local storage:', err);
      return mockApi.saveCheckin(checkinPayload);
    }
  },

  /**
   * Deletes a check-in by ID via DELETE /api/checkins/{id}.
   */
  async deleteCheckin(id) {
    try {
      await fetch(`${API_BASE_URL}/checkins/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
    } catch (err) {
      console.warn('[API Client] Delete fallback:', err);
    }
    return mockApi.deleteCheckin(id);
  },

  /**
   * Retrieves dashboard summary metrics via GET /api/dashboard/summary.
   */
  async getDashboardSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });
      if (!res.ok) throw new Error('Could not fetch summary');
      return await res.json();
    } catch (err) {
      console.warn('[API Client] Summary fetch fallback:', err);
      return null;
    }
  },

  /**
   * Records a completed wellness activity via POST /api/activities.
   */
  async logActivity(activityType, checkinId = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: this.getAuthHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({ activity_type: activityType, checkin_id: checkinId }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API Client] Activity log fallback:', err);
    }
    return { id: `act-${Date.now()}`, activity_type: activityType, completed_at: new Date().toISOString() };
  },

  /**
   * Retrieves list of completed wellness activities.
   */
  async getActivities() {
    try {
      const res = await fetch(`${API_BASE_URL}/activities`, {
        method: 'GET',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API Client] Fetch activities fallback:', err);
    }
    return [];
  },

  /**
   * Logs camera consent status via POST /api/privacy/consent.
   */
  async logConsent(granted, version = '1.0') {
    try {
      await fetch(`${API_BASE_URL}/privacy/consent`, {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ consent_type: 'webcam_analysis', version, granted }),
      });
    } catch (err) {
      console.warn('[API Client] Consent log fallback:', err);
    }
  },

  /**
   * Wipes all student records from both database and local session.
   */
  async wipeAllData() {
    try {
      await fetch(`${API_BASE_URL}/privacy/wipe-all`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
    } catch (err) {
      console.warn('[API Client] Backend wipe fallback:', err);
    }
    mockApi.clearAllData();
  },

  /**
   * Exports full student data payload from live database.
   */
  async exportFullData() {
    try {
      const res = await fetch(`${API_BASE_URL}/privacy/export`, {
        method: 'GET',
        headers: this.getAuthHeaders({ Accept: 'application/json' }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API Client] Backend export fallback:', err);
    }
    return {
      exported_at: new Date().toISOString(),
      source: 'local_storage',
      checkins: mockApi.getCheckins(),
    };
  },

  getPreferences() {
    return mockApi.getPreferences();
  },

  updatePreferences(patch) {
    return mockApi.updatePreferences(patch);
  },

  clearAllData() {
    mockApi.clearAllData();
  },
};
