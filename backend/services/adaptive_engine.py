import random

class AdaptiveEngine:
    def __init__(self):
        self.cumulative_reward = 0
        self.success_count = 0
        self.failure_count = 0

    def step(self):
        reward_delta = random.uniform(-5, 15)
        self.cumulative_reward += reward_delta
        
        if reward_delta > 0:
            self.success_count += 1
        else:
            self.failure_count += 1
            
        total = self.success_count + self.failure_count
            
        return {
            "reward": round(self.cumulative_reward, 2),
            "average_reward": round(self.cumulative_reward / total if total > 0 else 0, 2),
            "adaptation_score": round(random.uniform(70, 99), 1),
            "success_rate": round(self.success_count / total * 100 if total > 0 else 0, 1),
            "failure_rate": round(self.failure_count / total * 100 if total > 0 else 0, 1)
        }
