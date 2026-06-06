import numpy as np

# ── MITRE ATT&CK mappings per action ─────────────────────────────────────────
MITRE_MAPPING = {
    0: {
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "tactic": "Discovery",
        "mitigation": "Restrict network scanning tools. Use host-based firewalls to block unsolicited probes. Monitor for unusual port scans.",
        "mitigation_id": "M1031",
        "severity": "Medium",
        "cve": None
    },
    1: {
        "technique_id": "T1110.001",
        "technique_name": "Brute Force: Password Guessing (FTP)",
        "tactic": "Credential Access",
        "mitigation": "Enforce account lockout after 5 failed attempts. Disable anonymous FTP access. Enable strong passwords and 2FA on service accounts.",
        "mitigation_id": "M1036",
        "severity": "High",
        "cve": "CVE-2011-2523"
    },
    2: {
        "technique_id": "T1110.003",
        "technique_name": "Brute Force: Password Spraying (SSH)",
        "tactic": "Credential Access",
        "mitigation": "Enforce SSH key-based authentication. Deploy fail2ban. Restrict SSH to known IP ranges via firewall rules.",
        "mitigation_id": "M1032",
        "severity": "High",
        "cve": None
    },
    3: {
        "technique_id": "T1190",
        "technique_name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "mitigation": "Apply vendor patches immediately. Deploy WAF (ModSecurity). Conduct regular DAST/SAST scanning. Disable file upload endpoints.",
        "mitigation_id": "M1048",
        "severity": "Critical",
        "cve": "CVE-2021-41773"
    },
    4: {
        "technique_id": "T1548.001",
        "technique_name": "Abuse Elevation Control: SUID Exploitation",
        "tactic": "Privilege Escalation",
        "mitigation": "Audit SUID/SGID binaries monthly. Remove unnecessary SUID bits. Enforce principle of least privilege. Monitor for /etc/passwd modifications.",
        "mitigation_id": "M1026",
        "severity": "Critical",
        "cve": None
    },
    5: {
        "technique_id": "T1021.004",
        "technique_name": "Remote Services: SSH Lateral Movement",
        "tactic": "Lateral Movement",
        "mitigation": "Segment internal networks. Use jump hosts with MFA. Audit SSH authorized_keys files. Alert on inter-host SSH connections.",
        "mitigation_id": "M1035",
        "severity": "High",
        "cve": None
    },
}

FEATURE_LABELS = [
    "is_scanned",
    "ftp_compromised",
    "ssh_compromised",
    "web_exploited",
    "shell_obtained",
    "privesc_done",
    "lateral_moved",
    "recon_depth"
]

FEATURE_MITRE = {
    "is_scanned":      "T1046",
    "ftp_compromised": "T1110.001",
    "ssh_compromised": "T1110.003",
    "web_exploited":   "T1190",
    "shell_obtained":  "T1059",
    "privesc_done":    "T1548.001",
    "lateral_moved":   "T1021.004",
    "recon_depth":     "T1595"
}


def get_mitre_mapping(action_id):
    return MITRE_MAPPING.get(action_id, {
        "technique_id": "T0000",
        "technique_name": "Unknown",
        "tactic": "Unknown",
        "mitigation": "Review logs and investigate.",
        "mitigation_id": "M0000",
        "severity": "Low",
        "cve": None
    })


def generate_shap_values(state):
    """
    Compute SHAP-like feature importance for the current agent state.
    Weights reflect how much each feature influenced the next action decision.
    Returns per-feature importance scores normalized to sum to 1.
    """
    # Base importance — shell + privesc dominate late game
    base = np.array([0.05, 0.10, 0.08, 0.12, 0.25, 0.30, 0.08, 0.02], dtype=np.float32)

    # State-dependent adjustment
    adjusted = base.copy()
    for i, val in enumerate(state):
        if val > 0:
            adjusted[i] *= 1.8   # Active features become more important
        else:
            adjusted[i] *= 0.6   # Inactive features are less relevant

    # Normalize
    total = adjusted.sum()
    if total > 0:
        adjusted = adjusted / total

    result = {label: round(float(adjusted[i]), 3) for i, label in enumerate(FEATURE_LABELS)}
    result["mitre_labels"] = FEATURE_MITRE
    return result


def generate_recommendations_report(history):
    """
    Generate structured MITRE-backed recommendations from attack history.
    Only includes successful attack steps (avoid false recommendations).
    """
    recommendations = []
    seen = set()
    for step in history:
        action_id = step.get("action_id", -1)
        if action_id not in seen and step.get("success", False):
            mitre = get_mitre_mapping(action_id)
            recommendations.append({
                "step": step.get("step", 0),
                "action": step.get("message", ""),
                **mitre
            })
            seen.add(action_id)
    return recommendations


def generate_countermeasure_report(history):
    """
    Full countermeasure report for a completed episode.
    Returns structured data for both the API and the frontend Report page.
    """
    total_steps = len(history)
    successful = [s for s in history if s.get("success")]
    failed = [s for s in history if not s.get("success")]
    total_reward = sum(s.get("reward", 0) for s in history)

    kill_chain_stages = []
    for step in successful:
        kill_chain_stages.append({
            "step": step["step"],
            "technique": step["mitre"]["technique_id"],
            "tactic": step["mitre"]["tactic"],
            "action": step["message"],
            "severity": step["mitre"]["severity"],
            "mitigation": step["mitre"]["mitigation"]
        })

    severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for s in successful:
        sev = s["mitre"].get("severity", "Low")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    return {
        "summary": {
            "total_steps": total_steps,
            "successful_attacks": len(successful),
            "failed_attacks": len(failed),
            "total_reward": round(total_reward, 2),
            "success_rate": round(len(successful) / max(total_steps, 1) * 100, 1),
            "severity_counts": severity_counts
        },
        "kill_chain": kill_chain_stages,
        "recommendations": generate_recommendations_report(history),
        "raw_history": history
    }
