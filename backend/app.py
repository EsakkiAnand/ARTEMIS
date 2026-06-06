from gevent import monkey
monkey.patch_all()

import re
import time
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from sandbox_controller import SandboxController
from llm_planner import generate_attack_plan, generate_recommendations, generate_adaptive_strategy
from rl_agent import ArtemisEnv, get_rl_agent
from defense_analysis import generate_shap_values, generate_countermeasure_report

app = Flask(__name__)

# ── CORS Configuration ────────────────────────────────────────────────────────
# Allow all Vercel preview/production deployments + localhost dev
# NOTE: supports_credentials must NOT be used with "*" — use explicit origins.
ALLOWED_ORIGINS = [
    r"https://.*\.vercel\.app",   # All Vercel preview + production URLs
    r"http://localhost:\d+",        # Local dev
    r"http://127\.0\.0\.1:\d+",   # Local dev alternative
]

def _cors_origin_allowed(origin):
    if not origin:
        return False
    return any(re.fullmatch(pat, origin) for pat in ALLOWED_ORIGINS)

CORS(
    app,
    origins=_cors_origin_allowed,
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

app.config['SECRET_KEY'] = 'artemis_secret_key'

socketio = SocketIO(
    app,
    cors_allowed_origins=_cors_origin_allowed,
    async_mode='gevent',
    logger=False,
    engineio_logger=False
)

# ── Global State ──────────────────────────────────────────────────────────────
sandbox = SandboxController()
simulation_active = False
sim_greenlet = None
session_report = None


# ── Core Simulation Loop ──────────────────────────────────────────────────────
def run_simulation():
    global simulation_active, session_report

    env = ArtemisEnv(sandbox)
    rl_agent = get_rl_agent(env)

    episode_num = 1
    episode_reward = 0.0
    consecutive_failures = 0

    state, _ = env.reset()
    sandbox.reset_history()

    socketio.emit('status_update', {'simulation': 'running', 'sandbox': sandbox.status()})
    socketio.emit('log', {
        'data': f'=== ARTEMIS v1.0 | Episode {episode_num} | Scenario: {sandbox.current_scenario_id.upper()} ===',
        'level': 'info', 'success': True, 'reward': 0
    })
    time.sleep(0.5)

    while simulation_active:
        # RL agent selects action
        action, _ = rl_agent.predict(state, deterministic=False)
        action_val = int(action)

        # Execute in mock sandbox
        result = sandbox.execute_action(action_val)
        reward = float(result['reward'])
        episode_reward += reward

        # Step the RL environment
        state, _, done, truncated, info = env.step(action_val)

        # Build data payload
        mitre = result.get('mitre', {})
        tech_id = mitre.get('technique_id', 'T0000')
        tactic  = mitre.get('tactic', 'Unknown')
        conf    = result.get('confidence', 0.0)
        success = result.get('success', False)
        step_n  = result.get('step', env.step_count)

        if success:
            consecutive_failures = 0
        else:
            consecutive_failures += 1

        # ── Emit: terminal log ────────────────────────────────────────────
        socketio.emit('log', {
            'data': (
                f"[Step {step_n:02d}] {result['message']}"
                f" | {tech_id} ({tactic})"
                f" | Conf: {conf:.0%}"
                f" | Reward: {reward:+.1f}"
            ),
            'level': 'success' if success else 'fail',
            'success': success,
            'reward': reward,
            'mitre': tech_id,
            'tactic': tactic,
            'step': step_n
        })

        # ── Emit: RL metrics ──────────────────────────────────────────────
        socketio.emit('metrics', {
            'reward': round(episode_reward, 2),
            'step': step_n,
            'action': action_val,
            'success': success
        })

        # ── Emit: SHAP values ─────────────────────────────────────────────
        socketio.emit('shap', generate_shap_values(state))

        # ── Emit: attack graph ────────────────────────────────────────────
        socketio.emit('attack_graph', sandbox.get_attack_graph())

        # ── Emit: step for timeline ───────────────────────────────────────
        socketio.emit('step_update', {
            'step': step_n,
            'action_id': action_val,
            'message': result['message'],
            'success': success,
            'reward': reward,
            'mitre': mitre,
            'confidence': conf
        })

        # ── Adaptive re-plan after 2 consecutive failures ─────────────────
        if consecutive_failures >= 2:
            hist = sandbox.get_episode_history()
            recent = [f"{s['message']} -> FAIL" for s in hist[-3:]]
            new_plan = generate_adaptive_strategy(recent)
            socketio.emit('adaptive_plan', {'data': new_plan})
            socketio.emit('log', {
                'data': f'[ARTEMIS Brain] Re-planning after {consecutive_failures} consecutive failures...',
                'level': 'warn', 'success': False, 'reward': 0
            })
            consecutive_failures = 0

        time.sleep(1.5)  # Step cadence — visible in UI

        # ── Episode done ──────────────────────────────────────────────────
        if done or truncated:
            hist = sandbox.get_episode_history()
            report = generate_countermeasure_report(hist)
            session_report = report

            socketio.emit('log', {
                'data': (
                    f"{'='*50}\n"
                    f"Episode {episode_num} complete | "
                    f"Total Reward: {episode_reward:.1f} | "
                    f"Steps: {step_n} | "
                    f"Compromised: {len(sandbox.active_nodes)-1} nodes"
                ),
                'level': 'info', 'success': True, 'reward': episode_reward
            })
            socketio.emit('countermeasure_report', report)

            # Recommendations
            structured = sandbox.get_recommendations()
            socketio.emit('recommendations', structured)

            episode_num   += 1
            episode_reward = 0.0
            consecutive_failures = 0
            state, _ = env.reset()
            sandbox.reset_history()

            time.sleep(4)

            if simulation_active:
                socketio.emit('log', {
                    'data': f'=== ARTEMIS v1.0 | Episode {episode_num} | Scenario: {sandbox.current_scenario_id.upper()} ===',
                    'level': 'info', 'success': True, 'reward': 0
                })

    socketio.emit('status_update', {'simulation': 'stopped', 'sandbox': sandbox.status()})
    socketio.emit('log', {
        'data': '=== Simulation stopped by user ===',
        'level': 'warn', 'success': False, 'reward': 0
    })


# ── API Routes ────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'ARTEMIS Backend is running successfully!'})

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'sandbox':    sandbox.status(),
        'simulation': 'running' if simulation_active else 'stopped',
        'scenario':   sandbox.current_scenario_id
    })


@app.route('/api/plan', methods=['GET'])
def get_plan():
    target_info = (
        f"Target: 127.0.0.1 (Metasploitable 2 — Mock Mode)\n"
        f"Scenario: {sandbox.current_scenario_id}\n"
        f"Known Services: FTP/21, SSH/22, HTTP/80\nOS: Linux"
    )
    return jsonify({'plan': generate_attack_plan(target_info)})


@app.route('/api/start', methods=['POST'])
def start_sim():
    global simulation_active, sim_greenlet
    if simulation_active:
        return jsonify({'message': 'Already running.'}), 400
    sandbox.start()
    simulation_active = True
    sim_greenlet = socketio.start_background_task(run_simulation)
    return jsonify({'message': 'Simulation started.'})


@app.route('/api/stop', methods=['POST'])
def stop_sim():
    global simulation_active
    simulation_active = False
    sandbox.stop()
    return jsonify({'message': 'Simulation stopped.'})


@app.route('/api/attack-graph', methods=['GET'])
def get_attack_graph():
    return jsonify(sandbox.get_attack_graph())


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    hist = sandbox.get_episode_history()
    llm = generate_recommendations(hist)
    structured = sandbox.get_recommendations()
    return jsonify({'structured': structured, 'llm_summary': llm})


@app.route('/api/scenarios', methods=['GET'])
def get_scenarios():
    return jsonify({'scenarios': sandbox.get_scenarios()})


@app.route('/api/scenarios/<scenario_id>/set', methods=['POST'])
def set_scenario(scenario_id):
    if simulation_active:
        return jsonify({'error': 'Stop simulation first.'}), 400
    if sandbox.set_scenario(scenario_id):
        return jsonify({'message': f"Scenario '{scenario_id}' activated."})
    return jsonify({'error': 'Unknown scenario.'}), 404


@app.route('/api/episode-history', methods=['GET'])
def get_episode_history():
    return jsonify({'history': sandbox.get_episode_history()})


@app.route('/api/report', methods=['GET'])
def get_report():
    global session_report
    if session_report:
        return jsonify(session_report)
    hist = sandbox.get_episode_history()
    return jsonify(generate_countermeasure_report(hist))


# ── WebSocket Events ──────────────────────────────────────────────────────────

@socketio.on('connect')
def handle_connect():
    print(f'[WS] Client connected: {request.sid}')
    emit('attack_graph', sandbox.get_attack_graph())
    emit('log', {
        'data': 'ARTEMIS Terminal ready. Click "Start Simulation" to begin autonomous attack.',
        'level': 'info', 'success': True, 'reward': 0
    })


@socketio.on('disconnect')
def handle_disconnect():
    print(f'[WS] Client disconnected: {request.sid}')


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'[ARTEMIS] Starting server on http://0.0.0.0:{port}')
    socketio.run(app, debug=False, use_reloader=False, port=port, host='0.0.0.0')
