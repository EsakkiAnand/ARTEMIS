import random

class SimulationEngine:
    def __init__(self):
        self.stages = [
            "Initialization", "Discovery", "Analysis", 
            "Planning", "Execution", "Evaluation", 
            "Mitigation", "Reporting"
        ]
        self.current_stage_idx = 0

    def generate_event(self):
        stage = self.stages[self.current_stage_idx]
        self.current_stage_idx = (self.current_stage_idx + 1) % len(self.stages)
        
        events = {
            "Initialization": "Initializing synthetic environment",
            "Discovery": "Scanning ports and identifying services",
            "Analysis": "Analyzing potential vulnerabilities",
            "Planning": "Formulating attack path based on analysis",
            "Execution": "Executing simulated payload against target",
            "Evaluation": "Evaluating impact and success rate",
            "Mitigation": "Deploying defensive countermeasures",
            "Reporting": "Generating simulation summary report"
        }
        
        levels = ["INFO", "SCAN", "AI", "ANALYTICS", "REPORT", "WARNING"]
        
        return {
            "stage": stage,
            "message": events[stage] + f" ({random.randint(10, 99)}ms)",
            "level": random.choice(levels)
        }
