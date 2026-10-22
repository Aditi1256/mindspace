/**
 * Mock API and local storage management service for Phase 1.
 * Supports Phase 3 transition by providing standard async interfaces.
 */

const STORAGE_KEY_CHECKINS = 'student_stress_checkins';
const STORAGE_KEY_PREFS = 'student_stress_prefs';
const STORAGE_KEY_CONSENT = 'student_camera_consent';

const DEFAULT_PREFERENCES = {
  saveExpressionResults: true,
  consentGranted: false,
  consentTimestamp: null,
  consentVersion: '1.0',
};

// Initial realistic seed check-ins so history & charts look complete out-of-the-box
const SEED_CHECKINS = [
  {
    id: 'chk-01',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    stress_level: 4,
    workload_score: 3,
    sleep_score: 4,
    pressure_score: 3,
    note: 'Started semester review, feeling fairly organized.',
    expression_result: {
      top_expression: 'neutral',
      confidence: 0.78,
      probabilities: {
        neutral: 0.78,
        happy: 0.12,
        sad: 0.04,
        surprise: 0.03,
        fear: 0.01,
        angry: 0.01,
        disgust: 0.01,
      },
      model_version: 'cnn-v1.0-mock',
    },
  },
  {
    id: 'chk-02',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    stress_level: 6,
    workload_score: 2,
    sleep_score: 3,
    pressure_score: 4,
    note: 'Two assignment deadlines colliding on the same day.',
    expression_result: {
      top_expression: 'sad',
      confidence: 0.65,
      probabilities: {
        sad: 0.65,
        neutral: 0.22,
        fear: 0.07,
        angry: 0.03,
        happy: 0.01,
        surprise: 0.01,
        disgust: 0.01,
      },
      model_version: 'cnn-v1.0-mock',
    },
  },
  {
    id: 'chk-03',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stress_level: 8,
    workload_score: 1,
    sleep_score: 2,
    pressure_score: 5,
    note: 'Mid-term exam tomorrow morning, stayed up late studying.',
    expression_result: {
      top_expression: 'fear',
      confidence: 0.62,
      probabilities: {
        fear: 0.62,
        neutral: 0.18,
        sad: 0.12,
        angry: 0.04,
        surprise: 0.02,
        happy: 0.01,
        disgust: 0.01,
      },
      model_version: 'cnn-v1.0-mock',
    },
  },
  {
    id: 'chk-04',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stress_level: 5,
    workload_score: 3,
    sleep_score: 4,
    pressure_score: 3,
    note: 'Exam completed. Feeling relieved but still catching up on rest.',
    expression_result: {
      top_expression: 'happy',
      confidence: 0.74,
      probabilities: {
        happy: 0.74,
        neutral: 0.16,
        surprise: 0.05,
        sad: 0.02,
        fear: 0.01,
        angry: 0.01,
        disgust: 0.01,
      },
      model_version: 'cnn-v1.0-mock',
    },
  },
];

export const mockApi = {
  /**
   * Simulates FER-2013 CNN expression classification with 400ms latency.
   * Complies with PRD section 11.3 & 13.
   */
  async predictExpression(imagePayload) {
    await new Promise((resolve) => setTimeout(resolve, 380));

    // Realistic emotion profiles
    const emotionOptions = ['neutral', 'happy', 'neutral', 'sad', 'surprise'];
    const selected = emotionOptions[Math.floor(Math.random() * emotionOptions.length)];

    let probs = {};
    if (selected === 'happy') {
      probs = {
        happy: 0.72,
        neutral: 0.18,
        surprise: 0.05,
        sad: 0.02,
        fear: 0.01,
        angry: 0.01,
        disgust: 0.01,
      };
    } else if (selected === 'sad') {
      probs = {
        sad: 0.68,
        neutral: 0.19,
        fear: 0.06,
        angry: 0.04,
        happy: 0.01,
        surprise: 0.01,
        disgust: 0.01,
      };
    } else if (selected === 'surprise') {
      probs = {
        surprise: 0.70,
        happy: 0.14,
        neutral: 0.10,
        fear: 0.03,
        sad: 0.01,
        angry: 0.01,
        disgust: 0.01,
      };
    } else {
      probs = {
        neutral: 0.76,
        happy: 0.09,
        sad: 0.06,
        surprise: 0.04,
        fear: 0.02,
        angry: 0.02,
        disgust: 0.01,
      };
    }

    return {
      face_detected: true,
      top_expression: selected,
      confidence: probs[selected],
      probabilities: probs,
      model_version: 'cnn-v1.0-mock',
      disclaimer:
        'This prediction shows visible facial expression features only. It does not measure your emotional feelings or stress level.',
    };
  },

  /**
   * Loads saved check-ins from localStorage, populating initial seeds if empty.
   */
  getCheckins() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHECKINS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(SEED_CHECKINS));
        return SEED_CHECKINS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_CHECKINS;
    }
  },

  /**
   * Saves a new check-in to localStorage.
   */
  saveCheckin(checkin) {
    const list = this.getCheckins();
    const newEntry = {
      ...checkin,
      id: `chk-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...list];
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
    return newEntry;
  },

  /**
   * Deletes a single check-in by ID.
   */
  deleteCheckin(id) {
    const list = this.getCheckins();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
    return updated;
  },

  /**
   * Clears all stored check-ins and preferences.
   */
  clearAllData() {
    localStorage.removeItem(STORAGE_KEY_CHECKINS);
    localStorage.removeItem(STORAGE_KEY_PREFS);
    localStorage.removeItem(STORAGE_KEY_CONSENT);
  },

  /**
   * Retrieves user preferences.
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFS);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  /**
   * Updates user preferences.
   */
  updatePreferences(patch) {
    const current = this.getPreferences();
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
    return updated;
  },
};
