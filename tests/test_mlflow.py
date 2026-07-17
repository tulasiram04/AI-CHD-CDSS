import pytest
import os
import shutil
from mlops.mlflow_manager import MLflowManager

def test_mlflow_manager_telemetry():
    # Arrange: Point to local mock tracking to avoid network requests
    os.environ["MLFLOW_TRACKING_URI"] = "sqlite:///mlflow_test.db"
    
    manager = MLflowManager("configs/ml_config.yaml")
    
    # Act
    git_hash = manager.get_git_revision_hash()
    python_ver = manager.get_docker_version()
    
    # Assert
    assert isinstance(git_hash, str)
    assert isinstance(python_ver, str)
    assert len(git_hash) > 0
    assert len(python_ver) > 0

    # Clean up local mock database if created
    if os.path.exists("mlflow_test.db"):
        try:
            os.remove("mlflow_test.db")
        except Exception:
            pass
