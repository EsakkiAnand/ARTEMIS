import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class LLMProvider:
    def __init__(self):
        self.client = Groq()
        
    def generate_strategy(self, current_stage: str, recent_events: list) -> str:
        prompt = f"""
You are the AI planner for the ARTEMIS simulation engine.
Current Stage: {current_stage}
Recent Events: {recent_events}

Generate a concise strategy update in JSON format with these exact keys:
- objective (string)
- risk_score (integer 0-100)
- confidence (integer 0-100)
- path (string, formatted like "A -> B -> C")

Only return valid JSON. Do not return markdown blocks.
"""
        try:
            completion = self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"},
            )
            return completion.choices[0].message.content
        except Exception as e:
            return '{"objective": "Simulation Default", "risk_score": 50, "confidence": 50, "path": "Recon -> Execution"}'
