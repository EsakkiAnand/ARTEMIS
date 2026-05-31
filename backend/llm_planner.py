import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

def generate_attack_plan(target_info):
    """
    Generates a high-level attack plan using an LLM.
    If OPENAI_API_KEY is not set, it returns a mock plan for testing.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if api_key:
        try:
            llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo")
            messages = [
                SystemMessage(content="You are an autonomous penetration testing planner. "
                                      "Given the target information, suggest a high-level, step-by-step attack plan. "
                                      "Keep it concise and focus on realistic network attacks."),
                HumanMessage(content=f"Target Information:\n{target_info}\n\nProvide the attack plan.")
            ]
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error invoking LLM: {str(e)}\n\nFallback Mock Plan used instead."
    
    # Fallback if no API key
    mock_plan = (
        "**Mock Attack Plan (No API Key Provided)**\n\n"
        "1. **Reconnaissance:** Run a full TCP port scan (Nmap) on the target (127.0.0.1) to discover open ports.\n"
        "2. **Vulnerability Assessment:** Identify services on ports 21 (FTP), 22 (SSH), and 80 (HTTP).\n"
        "3. **Exploitation (FTP):** Attempt anonymous login or brute-force weak credentials on FTP.\n"
        "4. **Exploitation (Web):** Run directory traversal or check for common web vulnerabilities to upload a reverse shell.\n"
        "5. **Post-Exploitation:** Obtain initial foothold and gather local system information."
    )
    return mock_plan
