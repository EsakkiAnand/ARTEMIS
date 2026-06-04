import json
import os
from datetime import datetime

class AuditLogger:
    def __init__(self):
        self.log_file = os.path.join(os.path.dirname(__file__), "..", "data", "audit_logs.json")
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        if not os.path.exists(self.log_file):
            with open(self.log_file, "w") as f:
                json.dump([], f)

    def log(self, user: str, action: str, status: str):
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "user": user,
            "action": action,
            "status": status
        }
        try:
            with open(self.log_file, "r") as f:
                logs = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            logs = []
            
        logs.append(entry)
        
        with open(self.log_file, "w") as f:
            json.dump(logs, f, indent=2)

audit_logger = AuditLogger()
