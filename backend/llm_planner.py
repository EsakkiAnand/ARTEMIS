import os

# Try to import langchain; fall back gracefully if not available
try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import HumanMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False


def _get_llm(temperature=0.7):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not LANGCHAIN_AVAILABLE or not api_key:
        return None
    return ChatOpenAI(temperature=temperature, model_name="gpt-4o-mini", api_key=api_key)


# ── Attack Plan ───────────────────────────────────────────────────────────────
def generate_attack_plan(target_info):
    """
    Generates a high-level attack plan using an LLM.
    Falls back to a rich static mock if no API key is set.
    """
    llm = _get_llm(0.7)
    if llm:
        try:
            messages = [
                SystemMessage(content=(
                    "You are an autonomous penetration testing planner for a controlled security lab. "
                    "Given target information, produce a concise numbered attack plan covering: "
                    "Reconnaissance, Vulnerability Assessment, Exploitation, Post-Exploitation, Persistence. "
                    "Reference MITRE ATT&CK technique IDs where relevant. Keep it to 6 steps max. "
                    "Format each step as: N. **Phase [TECHNIQUE_ID]:** Description."
                )),
                HumanMessage(content=f"Target Information:\n{target_info}\n\nProvide the attack plan.")
            ]
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"[LLM Error: {e}]\n\n" + _mock_plan(target_info)
    return _mock_plan(target_info)


# ── Adaptive Re-planning ──────────────────────────────────────────────────────
def generate_adaptive_strategy(failed_steps_summary):
    """
    Called after 2+ consecutive failures to re-plan the attack strategy.
    failed_steps_summary: list of strings describing what failed.
    """
    llm = _get_llm(0.5)
    if llm:
        try:
            failures_text = "\n".join(f"- {s}" for s in failed_steps_summary)
            messages = [
                SystemMessage(content=(
                    "You are an adaptive penetration testing AI. "
                    "The current attack chain has encountered failures. "
                    "Analyze the failures and propose a revised 3-step attack strategy. "
                    "Suggest alternative attack vectors. Be concise."
                )),
                HumanMessage(content=f"Recent failures:\n{failures_text}\n\nSuggest alternative approach.")
            ]
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return _mock_adaptive_plan(failed_steps_summary)
    return _mock_adaptive_plan(failed_steps_summary)


# ── Defensive Recommendations ─────────────────────────────────────────────────
def generate_recommendations(attack_log):
    """
    Generates human-readable defensive recommendations from attack log.
    Returns None if no API key (caller uses static MITRE-based recommendations).
    """
    if not attack_log:
        return None
    llm = _get_llm(0.3)
    if llm:
        try:
            log_text = "\n".join([
                f"Step {s['step']}: {s['message']} (MITRE: {s['mitre']['technique_id']}, Severity: {s['mitre']['severity']})"
                for s in attack_log if s.get("success")
            ])
            if not log_text:
                return None
            messages = [
                SystemMessage(content=(
                    "You are a defensive cybersecurity expert reviewing a completed penetration test. "
                    "Produce concise, actionable mitigation recommendations for each successful attack step. "
                    "Format as a numbered list. Be specific — include config changes, patches, monitoring rules. "
                    "Prioritize by severity (Critical first)."
                )),
                HumanMessage(content=f"Successful attack steps:\n{log_text}\n\nProvide mitigations.")
            ]
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"[LLM Error: {e}]"
    return None


# ── Mock Plans (used when no API key) ────────────────────────────────────────
def _mock_plan(target_info=""):
    scenario_hint = ""
    if "ftp" in target_info.lower():
        scenario_hint = "FTP Brute Force Chain"
    elif "ssh" in target_info.lower():
        scenario_hint = "SSH Lateral Movement"
    else:
        scenario_hint = "Full Web Application Attack"

    return (
        f"**ARTEMIS Attack Plan — Metasploitable 2 (Mock Mode)**\n"
        f"**Scenario: {scenario_hint}**\n\n"
        "1. **Reconnaissance [T1046]:** Run Nmap full TCP scan on 127.0.0.1. "
        "Enumerate open services: 21/FTP (vsftpd 2.3.4), 22/SSH (OpenSSH 4.7), 80/HTTP (Apache 2.2.8).\n\n"
        "2. **Vulnerability Assessment [T1595]:** Fingerprint service versions. "
        "Check FTP for CVE-2011-2523 backdoor. Test HTTP for known CVEs (Apache, PHP, DVWA SQLi).\n\n"
        "3. **Exploitation — FTP [T1110.001]:** Test anonymous FTP login. "
        "If blocked, trigger vsftpd 2.3.4 backdoor on port 6200 for instant root shell.\n\n"
        "4. **Exploitation — Web [T1190]:** Test DVWA for SQLi (UNION-based). "
        "Attempt file upload bypass → PHP webshell → reverse shell on port 4444.\n\n"
        "5. **Post-Exploitation [T1548.001]:** Enumerate SUID binaries (find / -perm -4000). "
        "Exploit /usr/bin/nmap SUID → root. Alternatively modify /etc/passwd.\n\n"
        "6. **Persistence [T1053.003]:** Install cron backdoor every minute. "
        "Add SSH authorized_key for persistent access. Pivot to internal hosts via key reuse."
    )


def _mock_adaptive_plan(failures):
    failed_text = ", ".join(failures[:3]) if failures else "previous attempts"
    return (
        f"**[ARTEMIS Adaptive Re-plan]** After analyzing failures: {failed_text}\n\n"
        "**Alternative Attack Vectors:**\n"
        "1. Pivot to FTP anonymous login instead of brute force (less noise)\n"
        "2. Try DVWA SQL injection via GET parameter: `?id=1' OR '1'='1`\n"
        "3. Check for misconfigured NFS exports on port 2049 for file read access\n"
        "**Rationale:** Avoid triggering fail2ban — switch to stealthier techniques."
    )
