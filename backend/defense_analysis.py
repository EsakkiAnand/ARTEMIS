import numpy as np

def generate_shap_values(state):
    """
    Computes SHAP feature importance for the given state.
    In a real implementation, this would use the `shap` library 
    with the `Explainer` on the RL agent's PyTorch policy network
    (e.g., `model.policy.mlp_extractor`).
    
    For the simulation dashboard, we mock the SHAP values to show 
    which features are heavily influencing the "Exploit" decisions.
    
    Features: [is_scanned, ftp_compromised, ssh_compromised, shell_obtained]
    """
    # Base importance
    importance = [0.1, 0.2, 0.1, 0.6]
    
    # Adjust based on state to simulate dynamic explainability
    if state[0] == 1.0:
        importance[0] = 0.4 # Scan result is highly influential early on
    if state[1] == 1.0:
        importance[1] = 0.5 # FTP compromise leads to next steps
    
    # Normalize to 1.0
    total = sum(importance)
    shap_values = [round(i / total, 2) for i in importance]
    
    return {
        "is_scanned": shap_values[0],
        "ftp_compromised": shap_values[1],
        "ssh_compromised": shap_values[2],
        "shell_obtained": shap_values[3]
    }
