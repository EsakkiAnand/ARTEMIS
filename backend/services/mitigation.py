import random

class MitigationEngine:
    def __init__(self):
        pass

    def generate_recommendation(self):
        issues = ["Unpatched Service", "Open Database Port", "Default Credentials"]
        recommendations = [
            "Apply latest security patch to service",
            "Restrict database access to internal network",
            "Enforce strong password policy"
        ]
        
        idx = random.randint(0, len(issues)-1)
        
        return {
            "issue": issues[idx],
            "impact": random.choice(["HIGH", "CRITICAL", "MEDIUM"]),
            "priority": "P1" if random.random() > 0.5 else "P2",
            "recommendation": recommendations[idx],
            "status": "PENDING"
        }
