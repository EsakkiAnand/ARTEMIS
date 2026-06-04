import random

class CVSSEngine:
    def __init__(self):
        self.mitre_tactics = [
            ("TA0043", "Reconnaissance"),
            ("TA0042", "Resource Development"),
            ("TA0001", "Initial Access"),
            ("TA0002", "Execution"),
            ("TA0003", "Persistence"),
            ("TA0004", "Privilege Escalation"),
            ("TA0005", "Defense Evasion"),
            ("TA0006", "Credential Access"),
            ("TA0007", "Discovery"),
            ("TA0008", "Lateral Movement"),
            ("TA0009", "Collection"),
            ("TA0011", "Command and Control"),
            ("TA0010", "Exfiltration"),
            ("TA0040", "Impact")
        ]
        self.cwes = [
            ("CWE-79", "Improper Neutralization of Input During Web Page Generation (XSS)"),
            ("CWE-89", "Improper Neutralization of Special Elements used in an SQL Command"),
            ("CWE-22", "Improper Limitation of a Pathname to a Restricted Directory"),
            ("CWE-20", "Improper Input Validation"),
            ("CWE-119", "Improper Restriction of Operations within the Bounds of a Memory Buffer"),
            ("CWE-306", "Missing Authentication for Critical Function")
        ]

    def generate_intel(self):
        score = round(random.uniform(4.0, 10.0), 1)
        severity = "CRITICAL" if score >= 9.0 else "HIGH" if score >= 7.0 else "MEDIUM"
        mitre = random.choice(self.mitre_tactics)
        cwe = random.choice(self.cwes)
        
        return {
            "cvss": {
                "score": score,
                "severity": severity,
                "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
            },
            "mitre": {
                "id": mitre[0],
                "tactic": mitre[1]
            },
            "cwe": {
                "id": cwe[0],
                "description": cwe[1]
            }
        }
