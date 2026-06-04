import asyncio
import time
from datetime import datetime
from services.simulator import SimulationEngine
from services.adaptive_engine import AdaptiveEngine
from services.explainability import ExplainabilityEngine
from services.mitigation import MitigationEngine
from services.planner_service import PlannerService
from services.cvss_engine import CVSSEngine

class Orchestrator:
    def __init__(self):
        self.state = "IDLE"
        self.logs = []
        self.performance_history = []
        
        self.simulator = SimulationEngine()
        self.adaptive_engine = AdaptiveEngine()
        self.explainability = ExplainabilityEngine()
        self.mitigation = MitigationEngine()
        self.planner = PlannerService()
        self.cvss = CVSSEngine()
        
        self.event_callback = None
        self._running = False
        self._episode = 0

    def set_event_callback(self, callback):
        self.event_callback = callback

    def _emit(self, event_type: str, data: dict):
        if self.event_callback:
            self.event_callback(event_type, data)

    def log(self, level: str, message: str):
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = {"timestamp": timestamp, "level": level, "message": message}
        self.logs.append(log_entry)
        if len(self.logs) > 100:
            self.logs = self.logs[-100:]
        self._emit("log", log_entry)

    def get_logs(self):
        return self.logs
        
    def get_performance_history(self):
        return self.performance_history

    async def start(self):
        if self.state in ["RUNNING", "PAUSED"]:
            return
        self.state = "RUNNING"
        self._running = True
        self._emit("status", {"status": self.state})
        self.log("INFO", "Simulation Started")

    async def stop(self):
        if self.state != "RUNNING":
            return
        self.state = "COMPLETED"
        self._running = False
        self._emit("status", {"status": self.state})
        self.log("INFO", "Simulation Stopped")

    async def run_loop(self):
        while True:
            if self._running and self.state == "RUNNING":
                self._episode += 1
                
                # Simulation phase
                event = self.simulator.generate_event()
                self.log(event["level"], f"[{event['stage'].upper()}] {event['message']}")
                
                # Planner update
                # We use the LLM to generate real strategy based on current context
                recent_msgs = [l["message"] for l in self.logs[-3:]]
                planner_data = self.planner.generate_plan(event['stage'], recent_msgs)
                self._emit("planner", planner_data)
                
                # Adaptive Performance update
                perf = self.adaptive_engine.step()
                perf["episode"] = self._episode
                self.performance_history.append(perf)
                if len(self.performance_history) > 50:
                    self.performance_history = self.performance_history[-50:]
                self._emit("performance", perf)
                
                # Explainability update
                expl = self.explainability.generate_importance()
                self._emit("explainability", expl)
                
                # Threat Intel update
                intel = self.cvss.generate_intel()
                self._emit("intel", intel)
                
                await asyncio.sleep(2)
            else:
                await asyncio.sleep(1)
