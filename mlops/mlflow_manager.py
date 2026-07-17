import mlflow
import os
import sys
import platform
import subprocess
import yaml
import logging

logger = logging.getLogger("MLflowManager")

class MLflowManager:
    def __init__(self, config_path: str = "configs/ml_config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        self._setup_mlflow()

    def _load_config(self) -> dict:
        try:
            with open(self.config_path, "r") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load ml_config: {e}")
            raise

    def _setup_mlflow(self):
        tracking_uri = os.environ.get("MLFLOW_TRACKING_URI", self.config["mlflow"].get("tracking_uri", "http://localhost:5000"))
        mlflow.set_tracking_uri(tracking_uri)
        
        experiment_name = self.config["mlflow"].get("experiment_name", "CHD_Predictive_CDSS")
        mlflow.set_experiment(experiment_name)
        logger.info(f"MLflow set tracking URI to {tracking_uri} and experiment to {experiment_name}")

    @staticmethod
    def get_git_revision_hash() -> str:
        try:
            return subprocess.check_output(['git', 'rev-parse', 'HEAD'], stderr=subprocess.DEVNULL).decode('ascii').strip()
        except Exception:
            return "unknown_no_git"

    @staticmethod
    def get_docker_version() -> str:
        try:
            return subprocess.check_output(['docker', '--version'], stderr=subprocess.DEVNULL).decode('ascii').strip()
        except Exception:
            return "unknown_not_installed"

    def log_clinical_run(
        self, 
        run_name: str,
        parameters: dict, 
        metrics: dict, 
        dataset_version: str,
        artifacts_dir: str = None
    ) -> str:
        """
        Logs parameters, metrics, artifacts, and environment metadata for audits.
        """
        # Retrieve system environment details
        git_commit = self.get_git_revision_hash()
        docker_ver = self.get_docker_version()
        python_ver = platform.python_version()
        random_seed = self.config["meta"]["random_seed"]

        with mlflow.start_run(run_name=run_name) as run:
            # 1. Log clinical ML parameters
            mlflow.log_params(parameters)
            
            # 2. Log system reproducibility parameters
            mlflow.log_param("git_commit_hash", git_commit)
            mlflow.log_param("docker_version", docker_ver)
            mlflow.log_param("python_version", python_ver)
            mlflow.log_param("random_seed", random_seed)
            mlflow.log_param("dataset_version", dataset_version)
            
            # 3. Log metrics
            mlflow.log_metrics(metrics)
            
            # 4. Log local artifacts (models, plots) if specified
            if artifacts_dir and os.path.exists(artifacts_dir):
                mlflow.log_artifacts(artifacts_dir)
                logger.info(f"Logged local artifacts directory: {artifacts_dir}")
                
            logger.info(f"Logged run '{run_name}' to MLflow. Run ID: {run.info.run_id}")
            return run.info.run_id
