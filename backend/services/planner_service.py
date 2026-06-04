import json
from services.llm_provider import LLMProvider

class PlannerService:
    def __init__(self):
        self.provider = LLMProvider()

    def generate_plan(self, current_stage: str, recent_events: list):
        response_str = self.provider.generate_strategy(current_stage, recent_events)
        try:
            plan = json.loads(response_str)
            return plan
        except Exception:
            return {
                "objective": "Complete Reconnaissance",
                "risk_score": 73,
                "confidence": 85,
                "path": "Discovery -> Analysis -> Validation -> Mitigation"
            }
