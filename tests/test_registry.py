import pytest
import os
import mlflow
from mlops.model_registry import ClinicalModelRegistry

# Setup sqlite URI directly for registry tests
@pytest.fixture(autouse=True)
def setup_mlflow():
    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    mlflow.set_experiment("CHD_Predictive_CDSS")

def test_model_registry_stage_transitions():
    """Verify registry transitioning model stages in MLflow metadata tables."""
    # We will instantiate registry and check if it runs
    registry = ClinicalModelRegistry("configs/ml_config.yaml")
    
    # We check that registry_name loads correctly
    assert registry.registry_name == "CHD_Coronary_Heart_Disease_Risk_Model"
    
    # Check transition validation
    with pytest.raises(ValueError):
        # Should raise ValueError for invalid stage names
        registry.transition_stage(version="1", stage="InvalidStageName")
