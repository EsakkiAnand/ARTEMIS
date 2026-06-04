# ARTEMIS
**Autonomous Reinforcement-Trained Exploit and Mitigation Intelligence System for Adaptive Cyber Threat Simulation**

ARTEMIS is a highly advanced, simulated cybersecurity dashboard designed to emulate enterprise-grade Security Operations Center (SOC) environments (like CrowdStrike or Splunk) using an AI-driven interface.

This project is built for **Research, Education, and Demonstration** purposes. No real attacks are performed. All data is synthetically generated via the simulation engine.

## Features
- **Adaptive Threat Simulation Engine**: Generates real-time events imitating recon, analysis, exploitation, and mitigation phases.
- **LLM Planner Strategy Panel**: Streams simulated AI reasoning and attack paths.
- **Simulated Adaptive Learning Metrics**: Live updating line chart displaying simulated cumulative rewards and adaptation scores.
- **Decision Factor Analysis**: Visualizes feature importance driving AI decisions (Simulated SHAP).
- **ARTEMIS Terminal**: WebSocket-powered live log output.

## Tech Stack
- **Backend**: Python, FastAPI, WebSockets
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts
- **State**: React Query, Context API

## Getting Started

### 1. Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Navigate to `http://localhost:5173` (or the port provided by Vite). Click **START SIMULATION** to begin the autonomous threat emulation process and watch the dashboard come alive.
