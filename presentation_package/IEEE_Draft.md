# ARTEMIS: An Adaptive Cyber Threat Simulation Framework utilizing LLMs

**Abstract** — As cyber threats become increasingly automated, defensive mechanisms must adapt. This paper introduces ARTEMIS, a system that utilizes Large Language Models to simulate and plan cyber threat vectors in real-time, offering instant mitigation intelligence.

## I. Introduction
The asymmetry in cybersecurity favors the attacker. ARTEMIS addresses this by providing an adaptive simulation engine.

## II. Methodology
We implement a real-time event-streaming architecture via WebSockets, connecting a React frontend to a FastAPI backend orchestrated by an LLM-driven planner.

## III. Implementation
The LLM Provider leverages the Groq API for rapid inference, while the CVSS engine dynamically assigns severity to generated events based on the Common Vulnerability Scoring System v3.1.

## IV. Conclusion
ARTEMIS presents a foundational shift towards autonomous, intelligent threat simulation for SOC analyst augmentation.
