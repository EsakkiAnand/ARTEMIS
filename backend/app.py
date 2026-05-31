import threading
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from sandbox_controller import SandboxController
from llm_planner import generate_attack_plan
from rl_agent import ArtemisEnv, get_rl_agent
from defense_analysis import generate_shap_values

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'artemis_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global State
sandbox = SandboxController()
env = ArtemisEnv(sandbox)
rl_agent = get_rl_agent(env)
simulation_active = False

def run_simulation():
    global simulation_active
    episode_reward = 0
    state, _ = env.reset()
    
    while simulation_active:
        action, _states = rl_agent.predict(state, deterministic=False)
        action_val = int(action)
        
        state, reward, done, truncated, info = env.step(action_val)
        episode_reward += reward
        
        # Emit Logs
        log_msg = f"[RL Agent] Action: {action_val} | Result: {info.get('message', '')} | Reward: {reward}"
        socketio.emit('log', {'data': log_msg})
        
        # Emit metrics
        socketio.emit('metrics', {'reward': episode_reward, 'step': env.step_count})
        
        # Emit SHAP Analysis
        shap_vals = generate_shap_values(state)
        socketio.emit('shap', shap_vals)
        
        time.sleep(1.5) # Slow down for visualization
        
        if done or truncated:
            socketio.emit('log', {'data': f"--- Episode Finished! Total Reward: {episode_reward} ---"})
            state, _ = env.reset()
            episode_reward = 0
            time.sleep(2)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "sandbox": sandbox.status(),
        "simulation": "running" if simulation_active else "stopped"
    })

@app.route('/api/plan', methods=['GET'])
def get_plan():
    target_info = "Target IP: 127.0.0.1\nOS: Linux (Metasploitable 2)\nKnown Ports: 21, 22, 80"
    plan = generate_attack_plan(target_info)
    return jsonify({"plan": plan})

@app.route('/api/start', methods=['POST'])
def start_sim():
    global simulation_active
    if not simulation_active:
        sandbox.start()
        simulation_active = True
        threading.Thread(target=run_simulation, daemon=True).start()
        return jsonify({"message": "Simulation started."})
    return jsonify({"message": "Simulation already running."})

@app.route('/api/stop', methods=['POST'])
def stop_sim():
    global simulation_active
    simulation_active = False
    sandbox.stop()
    return jsonify({"message": "Simulation stopped."})

if __name__ == '__main__':
    # Disable the reloader to prevent PyTorch [WinError 1114] in the child process on Windows
    socketio.run(app, debug=False, use_reloader=False, port=5000, allow_unsafe_werkzeug=True)
