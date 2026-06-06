import gymnasium as gym
import numpy as np
from gymnasium import spaces
from stable_baselines3 import PPO
from sandbox_controller import SandboxController


class ArtemisEnv(gym.Env):
    """
    Custom Gymnasium environment for the ARTEMIS RL red-team agent.

    Observation Space (8 features):
        [is_scanned, ftp_compromised, ssh_compromised, web_exploited,
         shell_obtained, privesc_done, lateral_moved, recon_depth]

    Action Space (Discrete 6):
        0 = Network Scan (Nmap)
        1 = FTP Brute Force
        2 = SSH Password Spray
        3 = Web Application Exploit
        4 = Privilege Escalation
        5 = SSH Lateral Movement
    """
    metadata = {'render.modes': ['console']}

    def __init__(self, sandbox_controller=None):
        super().__init__()

        self.action_space = spaces.Discrete(6)
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(8,), dtype=np.float32
        )

        self.controller = sandbox_controller or SandboxController()
        self.state = np.zeros(8, dtype=np.float32)
        self.step_count = 0
        self.max_steps = 25

    def step(self, action):
        self.step_count += 1

        # Execute in sandbox
        result = self.controller.execute_action(int(action))
        reward = result['reward']

        # Update state vector based on result
        state_update = result.get('state_update', {})
        if 'scanned' in state_update:
            self.state[0] = 1.0
        if 'ftp_compromised' in state_update:
            self.state[1] = 1.0
        if 'ssh_compromised' in state_update:
            self.state[2] = 1.0
        if 'web_exploited' in state_update:
            self.state[3] = 1.0
        if 'shell_obtained' in state_update:
            self.state[4] = 1.0
        if 'root_obtained' in state_update:
            self.state[5] = 1.0
        if 'lateral_moved' in state_update:
            self.state[6] = 1.0
        # Recon depth: how many services discovered
        self.state[7] = min(self.state[:3].sum() / 3.0, 1.0)

        # Terminal condition: got root or exceeded max steps
        done = bool(self.state[5] == 1.0)
        truncated = bool(self.step_count >= self.max_steps)

        info = {
            'message': result['message'],
            'success': result['success'],
            'mitre': result.get('mitre', {}),
            'confidence': result.get('confidence', 0.0),
            'action_id': int(action)
        }

        return self.state.copy(), reward, done, truncated, info

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.state = np.zeros(8, dtype=np.float32)
        self.step_count = 0
        return self.state.copy(), {}

    def render(self, mode='console'):
        labels = [
            'Scanned', 'FTP_pwned', 'SSH_pwned', 'Web_exploited',
            'Shell', 'Root', 'Lateral', 'Recon_depth'
        ]
        print(' | '.join(f'{l}={v:.0f}' for l, v in zip(labels, self.state)))


def get_rl_agent(env, model_path=None):
    """Initialize or load the PPO RL Agent with improved hyperparameters."""
    if model_path and __import__('os').path.exists(model_path):
        print(f"Loading trained PPO model from {model_path}")
        return PPO.load(model_path, env=env)

    model = PPO(
        "MlpPolicy",
        env,
        verbose=0,
        learning_rate=3e-4,
        n_steps=64,
        batch_size=32,
        gamma=0.99,
        gae_lambda=0.95,
        ent_coef=0.01,   # Encourage exploration
        policy_kwargs={"net_arch": [64, 64]}
    )
    return model
