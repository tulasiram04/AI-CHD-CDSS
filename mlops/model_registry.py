import mlflow
from mlflow.tracking import MlflowClient
import logging
import yaml

logger = logging.getLogger("ModelRegistry")

class ClinicalModelRegistry:
    def __init__(self, config_path: str = "configs/ml_config.yaml"):
        self.config_path = config_path
        self.client = MlflowClient()
        self.registry_name = self._load_registry_name()

    def _load_registry_name(self) -> str:
        try:
            with open(self.config_path, "r") as f:
                config = yaml.safe_load(f)
                return config["mlflow"].get("registry_name", "CHD_Coronary_Heart_Disease_Risk_Model")
        except Exception:
            return "CHD_Coronary_Heart_Disease_Risk_Model"

    def register_model_version(self, run_id: str, model_path: str = "model") -> str:
        """
        Registers a logged model to the MLflow Model Registry.
        """
        model_uri = f"runs:/{run_id}/{model_path}"
        result = mlflow.register_model(model_uri, self.registry_name)
        logger.info(f"Registered model {self.registry_name} version {result.version}.")
        return result.version

    def transition_stage(self, version: str, stage: str, archive_existing: bool = True):
        """
        Transitions a model version to a specific deployment stage (e.g. Staging, Production).
        """
        allowed_stages = ["Staging", "Validation", "Production", "Archived"]
        if stage not in allowed_stages:
            raise ValueError(f"Stage '{stage}' must be one of {allowed_stages}")
            
        self.client.transition_model_version_stage(
            name=self.registry_name,
            version=version,
            stage=stage,
            archive_existing_versions=archive_existing
        )
        logger.info(f"Transitioned {self.registry_name} v{version} to stage '{stage}'.")

    def rollback_production_to_previous(self, active_version: str):
        """
        Rolls back the current production model, transitioning it to Archived
        and restoring the previous version to Production.
        """
        # Get active version in production
        latest_versions = self.client.get_latest_versions(self.registry_name, stages=["Production"])
        if not latest_versions:
            logger.warning("No production model found to roll back.")
            return

        prod_version = latest_versions[0].version
        if prod_version != active_version:
            logger.warning(f"Production version {prod_version} differs from active version {active_version}.")
            
        # Find previous version
        versions = self.client.get_all_versions(self.registry_name)
        sorted_versions = sorted([int(v.version) for v in versions if v.version != prod_version])
        
        if sorted_versions:
            prev_version = str(sorted_versions[-1])
            # Restore previous version to Production
            self.transition_stage(prev_version, "Production", archive_existing=True)
            # Retire/Archive current production version
            self.transition_stage(prod_version, "Archived", archive_existing=False)
            logger.info(f"Rollback successful. Restored v{prev_version} to Production, archived v{prod_version}.")
        else:
            logger.error("No previous versions available in registry for rollback.")
            raise ValueError("No previous versions to restore.")
        
    def get_production_model_uri(self) -> str:
        """Returns the URI of the current production model."""
        return f"models:/{self.registry_name}/Production"
