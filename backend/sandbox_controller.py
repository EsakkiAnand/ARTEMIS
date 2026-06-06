import docker
import subprocess
import os
import time
import random

# ── Scenario definitions ──────────────────────────────────────────────────────
SCENARIOS = {
    "web_full": {
        "id": "web_full",
        "name": "Full Web Application Attack",
        "description": "Reconnaissance → Web exploitation → Reverse shell → Privilege escalation",
        "difficulty": "Hard",
        "estimated_steps": 8,
        "tactics": ["Reconnaissance", "Initial Access", "Execution", "Privilege Escalation"],
        "target_ports": [21, 22, 80, 443],
        "actions": [0, 3, 4],
        "target": "DVWA / Apache (127.0.0.1:80)"
    },
    "ftp_brute": {
        "id": "ftp_brute",
        "name": "FTP Brute Force Chain",
        "description": "Network scan → FTP credential brute force → Data exfiltration",
        "difficulty": "Medium",
        "estimated_steps": 5,
        "tactics": ["Discovery", "Credential Access", "Collection"],
        "target_ports": [21, 22],
        "actions": [0, 1],
        "target": "vsftpd 2.3.4 (127.0.0.1:21)"
    },
    "ssh_lateral": {
        "id": "ssh_lateral",
        "name": "SSH Lateral Movement",
        "description": "SSH password spray → Pivot to internal hosts → Persistence",
        "difficulty": "Hard",
        "estimated_steps": 7,
        "tactics": ["Credential Access", "Lateral Movement", "Persistence"],
        "target_ports": [22],
        "actions": [0, 2, 5],
        "target": "OpenSSH 4.7 (127.0.0.1:22)"
    },
    "recon_only": {
        "id": "recon_only",
        "name": "Passive Reconnaissance",
        "description": "Network sweep → Port enumeration → Service fingerprinting",
        "difficulty": "Easy",
        "estimated_steps": 3,
        "tactics": ["Reconnaissance", "Discovery"],
        "target_ports": [21, 22, 80],
        "actions": [0],
        "target": "127.0.0.1 (full subnet)"
    }
}

# ── Attack graph node definitions ─────────────────────────────────────────────
GRAPH_NODES = {
    "attacker":   {"id": "attacker",   "label": "Attacker",          "type": "attacker",  "x": 60,  "y": 220},
    "scanner":    {"id": "scanner",    "label": "Network Scanner",    "type": "tool",      "x": 200, "y": 220},
    "ftp_target": {"id": "ftp_target", "label": "FTP :21",           "type": "service",   "x": 380, "y": 80},
    "ssh_target": {"id": "ssh_target", "label": "SSH :22",           "type": "service",   "x": 380, "y": 220},
    "web_target": {"id": "web_target", "label": "HTTP :80 (DVWA)",   "type": "service",   "x": 380, "y": 360},
    "shell":      {"id": "shell",      "label": "Shell Session",      "type": "goal",      "x": 560, "y": 220},
    "privesc":    {"id": "privesc",    "label": "Root / SYSTEM",      "type": "critical",  "x": 730, "y": 220},
    "pivot":      {"id": "pivot",      "label": "Pivot Host",         "type": "goal",      "x": 900, "y": 220},
}

GRAPH_EDGES = [
    {"source": "attacker",   "target": "scanner",    "label": "Initiate Scan"},
    {"source": "scanner",    "target": "ftp_target", "label": "Port 21"},
    {"source": "scanner",    "target": "ssh_target", "label": "Port 22"},
    {"source": "scanner",    "target": "web_target", "label": "Port 80"},
    {"source": "ftp_target", "target": "shell",      "label": "Brute Force"},
    {"source": "ssh_target", "target": "shell",      "label": "Password Spray"},
    {"source": "web_target", "target": "shell",      "label": "RCE Exploit"},
    {"source": "shell",      "target": "privesc",    "label": "SUID / sudo"},
    {"source": "privesc",    "target": "pivot",      "label": "Lateral Move"},
]

# Maps action_id → graph nodes that become active on success
ACTION_NODE_MAP = {
    0: ["scanner"],
    1: ["ftp_target", "shell"],
    2: ["ssh_target"],
    3: ["web_target", "shell"],
    4: ["privesc"],
    5: ["ssh_target", "shell", "pivot"],
}

# ── Action results (with realistic randomness) ────────────────────────────────
ACTION_TEMPLATES = {
    0: [  # Nmap scan — always works
        {"success": True, "message": "Nmap scan complete. Open ports: 21/ftp (vsftpd 2.3.4), 22/ssh (OpenSSH 4.7), 80/http (Apache 2.2.8)",
         "reward": 2, "state_update": {"scanned": 1}, "confidence": 0.99},
    ],
    1: [  # FTP brute force
        {"success": True,  "message": "FTP brute force successful. Credentials found: anonymous:anonymous. Listing /home...",
         "reward": 6, "state_update": {"ftp_compromised": 1}, "confidence": 0.88},
        {"success": True,  "message": "vsftpd backdoor triggered (port 6200). Root shell spawned via CVE-2011-2523.",
         "reward": 10, "state_update": {"ftp_compromised": 1, "shell_obtained": 1}, "confidence": 0.75},
        {"success": False, "message": "FTP brute force failed. Account lockout after 10 attempts. Switching strategy...",
         "reward": -2, "state_update": {}, "confidence": 0.08},
    ],
    2: [  # SSH brute force
        {"success": False, "message": "SSH brute force failed. fail2ban blocked IP after 5 attempts. Cooling down...",
         "reward": -2, "state_update": {}, "confidence": 0.05},
        {"success": True,  "message": "SSH login success: user=msfadmin pass=msfadmin. Session established.",
         "reward": 8, "state_update": {"ssh_compromised": 1, "shell_obtained": 1}, "confidence": 0.62},
    ],
    3: [  # Web exploit
        {"success": True,  "message": "SQLi in DVWA login form (UNION-based). Dumped credentials: admin:password",
         "reward": 7, "state_update": {"web_exploited": 1}, "confidence": 0.91},
        {"success": True,  "message": "File upload bypass via MIME spoofing. PHP webshell uploaded to /uploads/shell.php. Reverse shell on :4444",
         "reward": 12, "state_update": {"web_exploited": 1, "shell_obtained": 1}, "confidence": 0.84},
        {"success": False, "message": "XSS payload reflected but CSP blocks execution. Web exploit failed this attempt.",
         "reward": -1, "state_update": {}, "confidence": 0.22},
    ],
    4: [  # Privilege escalation
        {"success": True,  "message": "SUID binary /bin/nmap exploited. Spawned root shell via: nmap --interactive → !sh",
         "reward": 15, "state_update": {"root_obtained": 1}, "confidence": 0.79},
        {"success": True,  "message": "Writable /etc/passwd found. Added root:x:0:0:r00t:/root:/bin/bash. Root escalation complete.",
         "reward": 15, "state_update": {"root_obtained": 1}, "confidence": 0.71},
        {"success": False, "message": "Sudo exploit attempt failed — NOPASSWD not configured for this user.",
         "reward": -2, "state_update": {}, "confidence": 0.19},
    ],
    5: [  # Lateral movement
        {"success": True,  "message": "SSH key reuse detected. Pivoted to 192.168.1.10 via stolen authorized_keys.",
         "reward": 10, "state_update": {"lateral_moved": 1}, "confidence": 0.81},
        {"success": False, "message": "Lateral movement blocked — target segment firewalled. Pivot failed.",
         "reward": -1, "state_update": {}, "confidence": 0.14},
    ],
}


class SandboxController:
    def __init__(self, compose_dir='../sandbox'):
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Warning: Could not connect to Docker. Is Docker running? Error: {e}")
            self.client = None

        base_path = os.path.dirname(os.path.abspath(__file__))
        self.compose_dir = os.path.join(base_path, compose_dir)
        self.container_name = 'artemis_target_msf2'

        # Runtime state
        self.active_nodes = {"attacker"}
        self.attack_history = []
        self.current_scenario_id = "web_full"
        self.step_counter = 0

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    def start(self):
        print(f"Starting sandbox in {self.compose_dir}...")
        try:
            subprocess.run(["docker-compose", "up", "-d"], cwd=self.compose_dir, check=True)
        except Exception as e:
            print(f"docker-compose failed (running in mock mode): {e}")
        return self.status()

    def stop(self):
        print("Stopping sandbox...")
        try:
            subprocess.run(["docker-compose", "down"], cwd=self.compose_dir, check=True)
        except Exception as e:
            print(f"docker-compose stop failed: {e}")
        self.active_nodes = {"attacker"}
        self.attack_history = []
        self.step_counter = 0
        return self.status()

    def reset_history(self):
        """Reset between episodes without stopping Docker."""
        self.active_nodes = {"attacker"}
        self.attack_history = []
        self.step_counter = 0

    def status(self):
        if not self.client:
            try:
                self.client = docker.from_env()
            except Exception:
                return "mock"
        try:
            container = self.client.containers.get(self.container_name)
            return container.status
        except Exception:
            return "mock"

    # ── Scenarios ─────────────────────────────────────────────────────────────
    def set_scenario(self, scenario_id):
        if scenario_id in SCENARIOS:
            self.current_scenario_id = scenario_id
            return True
        return False

    def get_scenarios(self):
        return list(SCENARIOS.values())

    # ── Core action execution ─────────────────────────────────────────────────
    def execute_action(self, action_id):
        from defense_analysis import get_mitre_mapping

        sandbox_status = self.status()
        if sandbox_status not in ("running", "mock"):
            return {
                "success": False, "message": "Sandbox is not running.",
                "reward": -1, "state_update": {}, "action_id": action_id,
                "mitre": get_mitre_mapping(action_id), "confidence": 0.0
            }

        time.sleep(0.2)  # Simulate execution time
        self.step_counter += 1

        # Pick a random template (simulates real-world uncertainty)
        templates = ACTION_TEMPLATES.get(action_id, [
            {"success": False, "message": "Unknown action.", "reward": -1, "state_update": {}, "confidence": 0.0}
        ])
        result = dict(random.choice(templates))

        result["action_id"] = action_id
        result["mitre"] = get_mitre_mapping(action_id)
        result["step"] = self.step_counter

        # Update active graph nodes
        if result["success"] and action_id in ACTION_NODE_MAP:
            for node in ACTION_NODE_MAP[action_id]:
                self.active_nodes.add(node)

        # Record history
        self.attack_history.append({
            "step": self.step_counter,
            "action_id": action_id,
            "success": result["success"],
            "message": result["message"],
            "reward": result["reward"],
            "mitre": result["mitre"],
            "confidence": result["confidence"]
        })

        return result

    # ── Data getters ──────────────────────────────────────────────────────────
    def get_attack_graph(self):
        nodes = []
        for node_id, node_data in GRAPH_NODES.items():
            node = dict(node_data)
            node["active"] = node_id in self.active_nodes
            nodes.append(node)
        return {
            "nodes": nodes,
            "edges": GRAPH_EDGES,
            "active_nodes": list(self.active_nodes)
        }

    def get_recommendations(self):
        from defense_analysis import generate_recommendations_report
        return generate_recommendations_report(self.attack_history)

    def get_episode_history(self):
        return self.attack_history


if __name__ == "__main__":
    import sys
    controller = SandboxController()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    print(f"Status: {getattr(controller, cmd)()}")
