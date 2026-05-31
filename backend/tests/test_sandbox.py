import pytest
import time
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sandbox_controller import SandboxController

@pytest.fixture
def controller():
    # Use the relative path to sandbox directory
    ctrl = SandboxController(compose_dir='../sandbox')
    yield ctrl
    # Cleanup after test
    try:
        ctrl.stop()
    except:
        pass

def test_sandbox_start_stop(controller):
    """Test if the sandbox container can be started and stopped."""
    # Start it
    status = controller.start()
    # It might say 'running' or it might just successfully return.
    assert controller.status() == "running"
    
    # Stop it
    status = controller.stop()
    assert controller.status() == "stopped"

def test_sandbox_reset(controller):
    """Test if the sandbox container can be reset."""
    controller.start()
    assert controller.status() == "running"
    
    controller.reset()
    assert controller.status() == "running"
