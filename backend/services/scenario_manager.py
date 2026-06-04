class ScenarioManager:
    def __init__(self):
        self.scenarios = {
            "web_exposure": {
                "name": "Web Server Exposure",
                "risk_multiplier": 1.2,
                "starting_tactics": ["TA0043", "TA0001"]
            },
            "weak_auth": {
                "name": "Weak Authentication",
                "risk_multiplier": 1.5,
                "starting_tactics": ["TA0006"]
            },
            "misconfig": {
                "name": "Misconfigured Application",
                "risk_multiplier": 1.1,
                "starting_tactics": ["TA0005"]
            },
            "container_risk": {
                "name": "Container Risk",
                "risk_multiplier": 1.8,
                "starting_tactics": ["TA0008"]
            },
            "high_severity": {
                "name": "High Severity Environment",
                "risk_multiplier": 2.0,
                "starting_tactics": ["TA0040"]
            }
        }

    def get_scenario(self, scenario_id: str):
        return self.scenarios.get(scenario_id, self.scenarios["web_exposure"])

    def get_all_scenarios(self):
        return self.scenarios
