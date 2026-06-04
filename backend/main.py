import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from core.orchestrator import Orchestrator
from services.report_generator import ReportGenerator
from services.auth_service import AuthService
from services.audit_logger import audit_logger
from core.security import get_current_user

# Initialize Orchestrator and Limiter
orchestrator = Orchestrator()
report_generator = ReportGenerator()
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    asyncio.create_task(orchestrator.run_loop())
    yield
    # Shutdown
    await orchestrator.stop()

app = FastAPI(title="ARTEMIS API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

# Hook the orchestrator's event emitter to the websocket broadcaster
def broadcast_event(event_type: str, data: dict):
    message = {"type": event_type, "data": data}
    # Create a task to broadcast because this is called synchronously or asynchronously
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast(message))
    except RuntimeError:
        pass # No loop running

orchestrator.set_event_callback(broadcast_event)


@app.post("/token")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = AuthService.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = AuthService.create_access_token(
        data={"sub": form_data.username, "role": user["role"]}
    )
    audit_logger.log(form_data.username, "login", "SUCCESS")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/simulation/start")
@limiter.limit("10/minute")
async def start_simulation(request: Request, current_user: dict = Depends(get_current_user)):
    await orchestrator.start()
    audit_logger.log(current_user["username"], "simulation_start", "SUCCESS")
    return {"status": "started", "user": current_user["username"]}

@app.post("/simulation/stop")
async def stop_simulation(current_user: dict = Depends(get_current_user)):
    await orchestrator.stop()
    audit_logger.log(current_user["username"], "simulation_stop", "SUCCESS")
    return {"status": "stopped"}

@app.get("/simulation/status")
async def get_status():
    return {"status": orchestrator.state}

@app.get("/simulation/logs")
async def get_logs():
    return orchestrator.get_logs()

@app.get("/simulation/planner")
async def get_planner():
    # Return mock current planner state
    return {
        "objective": "Complete Reconnaissance",
        "risk_score": 73,
        "confidence": 85,
        "path": "Discovery -> Analysis -> Validation -> Mitigation"
    }

@app.get("/simulation/reward")
async def get_reward():
    return orchestrator.get_performance_history()

@app.get("/simulation/explainability")
async def get_explainability():
    return orchestrator.explainability.generate_importance()

@app.get("/simulation/recommendations")
async def get_recommendations():
    return orchestrator.mitigation.generate_recommendation()

@app.get("/simulation/analytics")
async def get_analytics():
    return {"performance": orchestrator.get_performance_history()}

@app.get("/simulation/report")
@limiter.limit("5/minute")
async def get_report(request: Request, current_user: dict = Depends(get_current_user)):
    state = {
        "status": orchestrator.state,
        "performance": orchestrator.get_performance_history(),
        "recommendation": orchestrator.mitigation.generate_recommendation()
    }
    pdf_path = report_generator.generate_pdf(state)
    audit_logger.log(current_user["username"], "report_generation", "SUCCESS")
    return FileResponse(pdf_path, media_type="application/pdf", filename="artemis_report.pdf")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state
        await websocket.send_text(json.dumps({
            "type": "initial_state",
            "data": {
                "status": orchestrator.state,
                "logs": orchestrator.get_logs(),
                "performance": orchestrator.get_performance_history()
            }
        }))
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
