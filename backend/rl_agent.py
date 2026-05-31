import gymnasium as gym
import numpy as np
from gymnasium import spaces
from stable_baselines3 import PPO
from sandbox_controller import SandboxController

class ArtemisEnv(gym.Env):
    """
    Custom Environment that follows gym interface for training an RL agent to attack.
    State space (Observations): 
        Array of 4 features: [is_scanned, ftp_compromised, ssh_compromised, shell_obtained]
        Values are 0 (false) or 1 (true)
    Action space:
        Discrete 4 actions:
        0: Scan Network
        1: Exploit FTP
        2: Exploit SSH
        3: Exploit Web Service
    """
    metadata = {'render.modes': ['console']}

    def __init__(self, sandbox_controller=None):
        super(ArtemisEnv, self).__init__()
        
        self.action_space = spaces.Discrete(4)
        # Observation space: 4 binary values
        self.observation_space = spaces.Box(low=0, high=1, shape=(4,), dtype=np.float32)
        
        self.controller = sandbox_controller if sandbox_controller else SandboxController()
        
        # Internal state tracking
        self.state = np.zeros(4, dtype=np.float32)
        self.step_count = 0
        self.max_steps = 20

    def step(self, action):
        self.step_count += 1
        
        # Execute action in sandbox
        result = self.controller.execute_action(action)
        reward = result['reward']
        
        # Update state based on result
        if 'scanned' in result['state_update']:
            self.state[0] = 1.0
        if 'ftp_compromised' in result['state_update']:
            self.state[1] = 1.0
        # Simulated SSH always fails in our mock, but if it worked:
        if 'ssh_compromised' in result['state_update']:
            self.state[2] = 1.0
        if 'shell_obtained' in result['state_update']:
            self.state[3] = 1.0
            
        # Check if done
        done = bool(self.state[3] == 1.0) # Goal is to obtain shell
        truncated = bool(self.step_count >= self.max_steps)
        
        info = {'message': result['message']}
        
        return self.state, reward, done, truncated, info

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.state = np.zeros(4, dtype=np.float32)
        self.step_count = 0
        # In a full simulation, we might reset the docker container here.
        # self.controller.reset()
        return self.state, {}

    def render(self, mode='console'):
        if mode == 'console':
            print(f"State: {self.state}")

def get_rl_agent(env):
    """Initialize or load the PPO RL Agent."""
    model = PPO("MlpPolicy", env, verbose=0)
    return model
