class DockerService:
    def __init__(self):
        self.containers = [
            {
                "id": "dvwa",
                "image": "vulnerables/web-dvwa",
                "status": "running",
                "ports": ["8081:80"],
                "stack": ["PHP", "MySQL", "Apache"]
            },
            {
                "id": "juice-shop",
                "image": "bkimminich/juice-shop",
                "status": "running",
                "ports": ["3000:3000"],
                "stack": ["Node.js", "Express", "SQLite"]
            }
        ]

    def get_inventory(self):
        # In a real environment, this would use docker sdk or subprocess
        # to inspect running containers. For this MVP, we return static metadata.
        return self.containers
