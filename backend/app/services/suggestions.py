"""
Python implementation of the PRD Section 8.4 rule-based suggestion engine.
Ensures suggestions are reproducible and testable server-side.
"""

def generate_suggestions(
    stress_level: int,
    workload_score: int,
    sleep_score: int,
    pressure_score: int,
    expression_result: dict = None
) -> list:
    suggestions = []

    # Rule 1: Stress-based interventions
    if stress_level <= 3 and sleep_score >= 4:
        suggestions.append({
            "id": "routine_maintain",
            "category": "Momentum & Balance",
            "icon": "Sparkles",
            "title": "Keep Up Your Healthy Rhythm",
            "description": "You reported low stress and restful sleep. Take a moment to acknowledge what worked well today and write down one thing you are grateful for.",
            "action_type": "reflection"
        })
    elif 4 <= stress_level <= 6:
        suggestions.append({
            "id": "break_5min",
            "category": "Rest & Recharge",
            "icon": "Coffee",
            "title": "Take a 5-Minute Micro-Break",
            "description": "Step away from your desk, stretch your shoulders, or try a 2-minute calming breathing session to prevent tension from compounding.",
            "action_type": "breathing"
        })
        suggestions.append({
            "id": "top_3_tasks",
            "category": "Focus & Clarity",
            "icon": "CheckSquare",
            "title": "Prioritize Your Top 3 Tasks",
            "description": "When stress creeps up, list only the 3 most crucial items for today. Give yourself permission to defer the rest until tomorrow.",
            "action_type": "task"
        })
    elif stress_level >= 7:
        suggestions.append({
            "id": "guided_breathing_urgent",
            "category": "Immediate Calm",
            "icon": "Wind",
            "title": "Guided 4-4-4 Box Breathing",
            "description": "Your body is carrying elevated stress. Take 3 minutes to activate your parasympathetic nervous system with slow, paced breathing.",
            "action_type": "breathing"
        })
        suggestions.append({
            "id": "step_away_screen",
            "category": "Nervous System Reset",
            "icon": "EyeOff",
            "title": "Step Away from Screens",
            "description": "Give your eyes and brain a sensory rest. Walk around, drink a glass of cool water, or step outdoors for fresh air.",
            "action_type": "physical"
        })
        suggestions.append({
            "id": "chunk_tasks",
            "category": "Academic Manageability",
            "icon": "Layers",
            "title": "Break Work into 15-Minute Chunks",
            "description": "Avoid staring at the entire mountain of work. Pick one tiny 15-minute slice and pause immediately when the timer dings.",
            "action_type": "task"
        })

    # Rule 2: Workload Manageability (1-2 is low manageability = overwhelming)
    if workload_score <= 2:
        suggestions.append({
            "id": "workload_prioritize",
            "category": "Workload Strategy",
            "icon": "Calendar",
            "title": "Plan-Your-Day Helper: Defer Non-Urgent Tasks",
            "description": "Your workload feels difficult to manage. Identify which deadlines are genuinely hard vs. which can be renegotiated or postponed.",
            "action_type": "planning"
        })

    # Rule 3: Sleep Quality (1-2 is poor sleep)
    if sleep_score <= 2:
        suggestions.append({
            "id": "sleep_hygiene",
            "category": "Rest & Sleep",
            "icon": "Moon",
            "title": "Wind-Down Buffer Before Sleep",
            "description": "Poor sleep significantly amplifies academic stress. Consider dimming blue light 45 minutes before bed and keeping a notepad beside you to unload racing thoughts.",
            "action_type": "rest"
        })

    # Rule 4: Academic Pressure Impact (4-5 is high impact)
    if pressure_score >= 4:
        suggestions.append({
            "id": "peer_mentor_reachout",
            "category": "Support & Connection",
            "icon": "Users",
            "title": "Connect with a Peer, Study Buddy, or TA",
            "description": "Academic pressure feels heavy right now. Sharing what you are grappling with with a classmate or instructor often reveals you are not alone.",
            "action_type": "connection"
        })

    # Rule 5: Expression-based gentle informational note (PRD FR-RES-3)
    if expression_result and expression_result.get("top_expression"):
        expr = expression_result["top_expression"]
        conf = expression_result.get("confidence", 0.0)
        suggestions.append({
            "id": "expression_reflection",
            "category": "Visible Expression Note",
            "icon": "Smile",
            "title": f"Observation: {expr.capitalize()} Expression",
            "description": f"Your camera frame showed features associated with a '{expr}' expression ({int(conf * 100)}% confidence). Remember: this is an informational observation of facial muscles in a single moment, not an assessment of your internal emotional feelings or stress.",
            "action_type": "info"
        })

    return suggestions
