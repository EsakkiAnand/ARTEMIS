import random

class ExplainabilityEngine:
    def __init__(self):
        self.features = [
            "Open Ports",
            "Service Exposure",
            "Configuration Weakness",
            "Missing Patches",
            "Weak Credentials",
            "Privilege Escalation Vector"
        ]

    def generate_importance(self):
        # Generate random weights that sum to 100
        weights = [random.uniform(5, 40) for _ in range(3)]
        total = sum(weights)
        normalized = [round(w / total * 100) for w in weights]
        
        # Ensure sum is exactly 100
        diff = 100 - sum(normalized)
        normalized[0] += diff
        
        selected_features = random.sample(self.features, 3)
        
        result = []
        for f, w in zip(selected_features, normalized):
            result.append({
                "feature": f,
                "importance": w
            })
            
        result.sort(key=lambda x: x["importance"], reverse=True)
        return result
