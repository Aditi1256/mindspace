import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HistoryDashboard from './components/HistoryDashboard';
import Questionnaire from './components/Questionnaire';
import ResultsView from './components/ResultsView';
import BreathingExercise from './components/BreathingExercise';
import PrivacySettings from './components/PrivacySettings';
import AuthModal from './components/AuthModal';
import { apiClient } from './services/api';
import { generateSuggestions } from './services/suggestionEngine';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'checkin', 'results', 'breathing', 'history', 'privacy'
  const [checkins, setCheckins] = useState([]);
  const [completedActivitiesCount, setCompletedActivitiesCount] = useState(0);
  const [preferences, setPreferences] = useState(apiClient.getPreferences());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [serverHealth, setServerHealth] = useState({ status: 'checking', model_loaded: false });

  // Phase 5: Auth State
  const [currentUser, setCurrentUser] = useState(apiClient.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active checkin results state
  const [latestCheckinData, setLatestCheckinData] = useState(null);
  const [latestExpressionResult, setLatestExpressionResult] = useState(null);
  const [latestSuggestions, setLatestSuggestions] = useState([]);

  useEffect(() => {
    // 1. Check health of live FastAPI backend
    apiClient.checkHealth().then((health) => {
      setServerHealth(health);
    });

    // 2. Validate session token if present
    if (apiClient.getStoredToken()) {
      apiClient.getCurrentUser().then((user) => {
        if (user) setCurrentUser(user);
        else setCurrentUser(null);
      });
    }

    // 3. Load check-in records from live database
    loadCheckins();

    // 4. Load activities count
    loadActivities();
  }, []);

  const loadCheckins = async () => {
    const list = await apiClient.getCheckins();
    setCheckins(list);
  };

  const loadActivities = async () => {
    const acts = await apiClient.getActivities();
    setCompletedActivitiesCount(acts.length);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Auth Handlers
  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    await loadCheckins();
    await loadActivities();
    showToast(`Welcome, ${user.email}!`);
  };

  const handleLogout = async () => {
    apiClient.logout();
    setCurrentUser(null);
    await loadCheckins();
    await loadActivities();
    showToast('You have been logged out.');
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.deleteAccount();
      setCurrentUser(null);
      await loadCheckins();
      await loadActivities();
      showToast('Your account and all associated wellness data have been permanently deleted.');
    } catch (err) {
      showToast('Account deletion failed. Please try again.');
    }
  };

  const handleQuestionnaireSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      let exprResult = null;
      if (formData.imageData) {
        // Calls live FastAPI endpoint: POST /api/expressions/predict
        exprResult = await apiClient.predictExpression(formData.imageData);
      }

      // Generate personalized non-clinical suggestions
      const generatedSuggestions = generateSuggestions({
        stressLevel: formData.stressLevel,
        workloadScore: formData.workloadScore,
        sleepScore: formData.sleepScore,
        pressureScore: formData.pressureScore,
        energyScore: formData.energyScore,
        socialScore: formData.socialScore,
        movementScore: formData.movementScore,
        tags: formData.tags,
        expressionResult: exprResult,
      });

      setLatestCheckinData(formData);
      setLatestExpressionResult(exprResult);
      setLatestSuggestions(generatedSuggestions);
      setActiveTab('results');
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Error processing check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCheckin = async () => {
    if (!latestCheckinData) return;

    const payload = {
      stress_level: latestCheckinData.stressLevel,
      workload_score: latestCheckinData.workloadScore,
      sleep_score: latestCheckinData.sleepScore,
      pressure_score: latestCheckinData.pressureScore,
      energy_score: latestCheckinData.energyScore || 3,
      social_score: latestCheckinData.socialScore || 3,
      movement_score: latestCheckinData.movementScore || 3,
      tags: latestCheckinData.tags || [],
      note: latestCheckinData.note,
      // Respect user privacy preference regarding expression storage
      expression_result: preferences.saveExpressionResults ? latestExpressionResult : null,
    };

    // Calls live FastAPI endpoint: POST /api/checkins (with Bearer token if logged in)
    await apiClient.saveCheckin(payload);
    await loadCheckins();
    showToast('Check-in successfully saved to database!');
  };

  const handleDeleteCheckin = async (id) => {
    // Calls live FastAPI endpoint: DELETE /api/checkins/{id}
    await apiClient.deleteCheckin(id);
    await loadCheckins();
    showToast('Check-in record deleted.');
  };

  const handleLogActivity = async (activityType) => {
    await apiClient.logActivity(activityType);
    setCompletedActivitiesCount((prev) => prev + 1);
    showToast('Wellness practice recorded to your progress!');
  };

  const handleClearAllData = async () => {
    await apiClient.wipeAllData();
    setCheckins([]);
    setCompletedActivitiesCount(0);
    setPreferences(apiClient.getPreferences());
    showToast('All check-in records, expressions, and activity logs have been wiped.');
  };

  const handleUpdatePreferences = (patch) => {
    const updated = apiClient.updatePreferences(patch);
    setPreferences(updated);
    showToast('Privacy preferences updated.');
  };

  // Collect guest check-in IDs for upgrade prompt
  const guestCheckinIds = !currentUser ? checkins.map((c) => c.id).filter(Boolean) : [];

  return (
    <div className="app-layout">
      {/* Top Navigation with Auth Controls */}
      <Navbar
        activeTab={activeTab === 'results' ? 'checkin' : activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        serverHealth={serverHealth}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        guestCheckinIds={guestCheckinIds}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="toast-banner" role="status">
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <HistoryDashboard
            checkins={checkins}
            completedActivitiesCount={completedActivitiesCount}
            onDeleteCheckin={handleDeleteCheckin}
            onStartNewCheckin={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'checkin' && (
          <Questionnaire
            onSubmit={handleQuestionnaireSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'results' && latestCheckinData && (
          <ResultsView
            checkinData={latestCheckinData}
            expressionResult={latestExpressionResult}
            suggestions={latestSuggestions}
            onSaveCheckin={handleSaveCheckin}
            onStartBreathing={() => setActiveTab('breathing')}
            onGoHome={() => setActiveTab('dashboard')}
            onLogActivity={handleLogActivity}
          />
        )}

        {activeTab === 'breathing' && (
          <BreathingExercise
            onComplete={(cycles) => handleLogActivity(`box_breathing_${cycles || 4}_cycles`)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            checkins={checkins}
            completedActivitiesCount={completedActivitiesCount}
            onDeleteCheckin={handleDeleteCheckin}
            onStartNewCheckin={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacySettings
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onClearAllData={handleClearAllData}
            onExportData={() => apiClient.exportFullData()}
            checkinsCount={checkins.length}
            currentUser={currentUser}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Student MindSpace &bull; FastAPI + ONNX CNN + React &bull; Self-Reflection & Wellness Prototype
        </p>
      </footer>
    </div>
  );
}
