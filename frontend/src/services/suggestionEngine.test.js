import { generateSuggestions } from './suggestionEngine.js';

console.log('Testing Suggestion Engine:');

// Test Case 1: Low stress, good sleep
const test1 = generateSuggestions({ stressLevel: 2, sleepScore: 5, workloadScore: 4, pressureScore: 2 });
console.assert(test1.some(s => s.id === 'routine_maintain'), 'Test 1 Failed: Should suggest routine maintain');

// Test Case 2: Moderate stress
const test2 = generateSuggestions({ stressLevel: 5, sleepScore: 3, workloadScore: 3, pressureScore: 3 });
console.assert(test2.some(s => s.id === 'break_5min'), 'Test 2 Failed: Should suggest 5-min break');
console.assert(test2.some(s => s.id === 'top_3_tasks'), 'Test 2 Failed: Should suggest top 3 tasks');

// Test Case 3: High stress, poor sleep, heavy workload, high pressure
const test3 = generateSuggestions({
  stressLevel: 9,
  sleepScore: 1,
  workloadScore: 1,
  pressureScore: 5,
  expressionResult: { top_expression: 'neutral', confidence: 0.8 }
});
console.assert(test3.some(s => s.id === 'guided_breathing_urgent'), 'Test 3 Failed: Should suggest urgent breathing');
console.assert(test3.some(s => s.id === 'workload_prioritize'), 'Test 3 Failed: Should suggest workload prioritization');
console.assert(test3.some(s => s.id === 'sleep_hygiene'), 'Test 3 Failed: Should suggest sleep hygiene');
console.assert(test3.some(s => s.id === 'peer_mentor_reachout'), 'Test 3 Failed: Should suggest peer mentor reachout');
console.assert(test3.some(s => s.id === 'expression_reflection'), 'Test 3 Failed: Should include expression reflection');

console.log('✅ All suggestion engine unit tests passed successfully!');
