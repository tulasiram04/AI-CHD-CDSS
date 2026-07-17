import json
import os
import hashlib
from datetime import datetime

class LineageTracker:
    def __init__(self, metadata_path: str = "etl/processed_chd_dataset/lineage_metadata.json"):
        self.metadata_path = metadata_path
        self.lineage_log = {
            "pipeline_name": "AI-CHD-CDSS ETL Pipeline",
            "runs": []
        }
        self._load_lineage()

    def _load_lineage(self):
        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, "r") as f:
                    self.lineage_log = json.load(f)
            except Exception:
                pass

    @staticmethod
    def calculate_checksum(filepath: str) -> str:
        sha256 = hashlib.sha256()
        try:
            with open(filepath, "rb") as f:
                for chunk in iter(lambda: f.read(65536), b""):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except FileNotFoundError:
            return "file_not_found"

    def log_run(
        self, 
        version: str, 
        raw_files: dict, 
        output_files: dict, 
        row_count: int, 
        feature_count: int, 
        validation_report: dict
    ):
        """
        Logs a single ETL execution run with data lineage.
        """
        run_entry = {
            "run_id": len(self.lineage_log["runs"]) + 1,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "dataset_version": version,
            "inputs": [
                {
                    "file_name": name,
                    "path": path,
                    "sha256_checksum": self.calculate_checksum(path)
                } for name, path in raw_files.items()
            ],
            "outputs": [
                {
                    "file_name": name,
                    "path": path,
                    "sha256_checksum": self.calculate_checksum(path)
                } for name, path in output_files.items()
            ],
            "statistics": {
                "row_count": row_count,
                "feature_count": feature_count
            },
            "validation": validation_report
        }
        
        self.lineage_log["runs"].append(run_entry)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.metadata_path), exist_ok=True)
        
        with open(self.metadata_path, "w") as f:
            json.dump(self.lineage_log, f, indent=4)
