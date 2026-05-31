import docker
import subprocess
import os
import time

class SandboxController:
    def __init__(self, compose_dir='../sandbox'):
        """
        Initialize the SandboxController.
        Args:
            compose_dir (str): Path to the directory containing docker-compose.yml.
        """
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Warning: Could not connect to Docker. Is Docker running? Error: {e}")
            self.client = None
            
        # Resolve path relative to this file's location
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.compose_dir = os.path.join(base_path, compose_dir)
        self.container_name = 'artemis_target_msf2'
        
    def start(self):
        """Start the sandbox environment using docker-compose."""
        print(f"Starting sandbox in {self.compose_dir}...")
        subprocess.run(["docker-compose", "up", "-d"], cwd=self.compose_dir, check=True)
        return self.status()

    def stop(self):
        """Stop the sandbox environment."""
        print("Stopping sandbox...")
        subprocess.run(["docker-compose", "down"], cwd=self.compose_dir, check=True)
        return self.status()

    def reset(self):
        """Reset the target to its initial state."""
        print("Resetting sandbox...")
        self.stop()
        time.sleep(1)
        subprocess.run(["docker-compose", "up", "-d", "--force-recreate"], cwd=self.compose_dir, check=True)
        return self.status()
        
    def status(self):
        """Get the status of the target container."""
        if not self.client:
            # Try to reconnect
            try:
                self.client = docker.from_env()
            except Exception:
                return "stopped (docker offline)"
                
        try:
            container = self.client.containers.get(self.container_name)
            return container.status
        except docker.errors.NotFound:
            return "stopped"

    def execute_action(self, action_id):
        """
        Simulate an action against the target environment.
        In a real scenario, this would use exploit scripts, nmap, etc.
        For simulation, we mock the results based on standard target behavior.
        
        Actions:
        0 = Nmap Scan (discover open ports)
        1 = FTP Brute Force (port 21)
        2 = SSH Brute Force (port 22)
        3 = Web Exploit (port 80)
        """
        if self.status() != "running":
            return {"success": False, "message": "Sandbox is not running.", "reward": -1, "state_update": {}}
            
        time.sleep(0.5) # Simulate time taken to execute action
        
        if action_id == 0:
            return {"success": True, "message": "Nmap scan complete. Found open ports: 21, 22, 80", "reward": 1, "state_update": {"scanned": 1}}
        elif action_id == 1:
            return {"success": True, "message": "FTP Brute Force successful. Found weak credentials.", "reward": 5, "state_update": {"ftp_compromised": 1}}
        elif action_id == 2:
            return {"success": False, "message": "SSH Brute Force failed. Strong passwords in use.", "reward": -1, "state_update": {}}
        elif action_id == 3:
            return {"success": True, "message": "Web exploit successful. Gained initial shell.", "reward": 10, "state_update": {"shell_obtained": 1}}
        else:
            return {"success": False, "message": "Unknown action.", "reward": -1, "state_update": {}}

if __name__ == "__main__":
    # Simple CLI for testing
    import sys
    controller = SandboxController()
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "start":
            print(f"Status: {controller.start()}")
        elif command == "stop":
            print(f"Status: {controller.stop()}")
        elif command == "reset":
            print(f"Status: {controller.reset()}")
        elif command == "status":
            print(f"Status: {controller.status()}")
        else:
            print(f"Unknown command: {command}")
    else:
        print(f"Status: {controller.status()}")
