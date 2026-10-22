/**
 * Pure rule-based suggestion engine for student wellness.
 * Adheres strictly to PRD Section 8.4 (FR-RES-2, FR-RES-3, FR-RES-4).
 * Suggestions are primarily driven by self-reported stress, sleep, and workload.
 * Facial expression adds only a gentle informational reflection prompt.
 */

export function generateSuggestions({
  stressLevel = 5,
  workloadScore = 3,
  sleepScore = 3,
  pressureScore = 3,
  expressionResult = null,
}) {
  const suggestions = [];

  // Rule 1: Stress-based interventions
  if (stressLevel <= 3 && sleepScore >= 4) {
    suggestions.push({
      id: 'routine_maintain',
      category: 'Momentum & Balance',
      icon: 'Sparkles',
      title: 'Keep Up Your Healthy Rhythm',
      description:
        'You reported low stress and restful sleep. Take a moment to acknowledge what worked well today and write down one thing you are grateful for.',
      actionType: 'reflection',
    });
  } else if (stressLevel >= 4 && stressLevel <= 6) {
    suggestions.push({
      id: 'break_5min',
      category: 'Rest & Recharge',
      icon: 'Coffee',
      title: 'Take a 5-Minute Micro-Break',
      description:
        'Step away from your desk, stretch your shoulders, or try a 2-minute calming breathing session to prevent tension from compounding.',
      actionType: 'breathing',
    });
    suggestions.push({
      id: 'top_3_tasks',
      category: 'Focus & Clarity',
      icon: 'CheckSquare',
      title: 'Prioritize Your Top 3 Tasks',
      description:
        'When stress creeps up, list only the 3 most crucial items for today. Give yourself permission to defer the rest until tomorrow.',
      actionType: 'task',
    });
  } else if (stressLevel >= 7) {
    suggestions.push({
      id: 'guided_breathing_urgent',
      category: 'Immediate Calm',
      icon: 'Wind',
      title: 'Guided 4-4-4 Box Breathing',
      description:
        'Your body is carrying elevated stress. Take 3 minutes to activate your parasympathetic nervous system with slow, paced breathing.',
      actionType: 'breathing',
    });
    suggestions.push({
      id: 'step_away_screen',
      category: 'Nervous System Reset',
      icon: 'EyeOff',
      title: 'Step Away from Screens',
      description:
        'Give your eyes and brain a sensory rest. Walk around, drink a glass of cool water, or step outdoors for fresh air.',
      actionType: 'physical',
    });
    suggestions.push({
      id: 'chunk_tasks',
      category: 'Academic Manageability',
      icon: 'Layers',
      title: 'Break Work into 15-Minute Chunks',
      description:
        'Avoid staring at the entire mountain of work. Pick one tiny 15-minute slice and pause immediately when the timer dings.',
      actionType: 'task',
    });
  }

  // Rule 2: Workload Manageability (1-2 is low manageability = overwhelming)
  if (workloadScore <= 2) {
    suggestions.push({
      id: 'workload_prioritize',
      category: 'Workload Strategy',
      icon: 'Calendar',
      title: 'Plan-Your-Day Helper: Defer Non-Urgent Tasks',
      description:
        'Your workload feels difficult to manage. Identify which deadlines are genuinely hard vs. which can be renegotiated or postponed.',
      actionType: 'planning',
    });
  }

  // Rule 3: Sleep Quality (1-2 is poor sleep)
  if (sleepScore <= 2) {
    suggestions.push({
      id: 'sleep_hygiene',
      category: 'Rest & Sleep',
      icon: 'Moon',
      title: 'Wind-Down Buffer Before Sleep',
      description:
        'Poor sleep significantly amplifies academic stress. Consider dimming blue light 45 minutes before bed and keeping a notepad beside you to unload racing thoughts.',
      actionType: 'rest',
    });
  }

  // Rule 4: Academic Pressure Impact (4-5 is high impact)
  if (pressureScore >= 4) {
    suggestions.push({
      id: 'peer_mentor_reachout',
      category: 'Support & Connection',
      icon: 'Users',
      title: 'Connect with a Peer, Study Buddy, or TA',
      description:
        'Academic pressure feels heavy right now. Sharing what you are grappling with with a classmate or instructor often reveals you are not alone.',
      actionType: 'connection',
    });
  }

  // Rule 5: Expression-based gentle informational note (PRD FR-RES-3)
  if (expressionResult && expressionResult.top_expression) {
    const expr = expressionResult.top_expression;
    suggestions.push({
      id: 'expression_reflection',
      category: 'Visible Expression Note',
      icon: 'Smile',
      title: `Observation: ${capitalize(expr)} Expression`,
      description: `Your camera frame showed features associated with a "${expr}" expression (${Math.round(
        (expressionResult.confidence || 0) * 100
      )}% confidence). Remember: this is an informational observation of facial muscles in a single moment, not an assessment of your internal emotional feelings or stress.`,
      actionType: 'info',
    });
  }

  return suggestions;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
