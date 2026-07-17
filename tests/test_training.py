import pytest
import pandas as pd
import numpy as np
from training.train import TrainingPipeline, run_custom_smote

def test_custom_smote_oversampling():
    """Verify custom SMOTE balances minority class correctly."""
    # Create highly imbalanced mock dataset
    np.random.seed(42)
    majority_X = pd.DataFrame(np.random.normal(size=(50, 4)), columns=[f"col_{i}" for i in range(4)])
    minority_X = pd.DataFrame(np.random.normal(size=(10, 4)) + 2.0, columns=[f"col_{i}" for i in range(4)])
    
    X = pd.concat([majority_X, minority_X], ignore_index=True)
    y = pd.Series([0] * 50 + [1] * 10)
    
    # Run SMOTE
    X_res, y_res = run_custom_smote(X, y, k_neighbors=3, random_state=42)
    
    assert len(X_res) == 100
    assert len(y_res) == 100
    assert (y_res == 0).sum() == 50
    assert (y_res == 1).sum() == 50

def test_data_readiness_validation_report(tmp_path):
    """Verify Data Readiness Report catches missing metrics or duplicates."""
    # Create mock dataset with duplicates
    df = pd.DataFrame({
        "subject_id": [101, 102, 102],
        "hadm_id": [1001, 1002, 1002], # Duplicate admission!
        "target": [0, 1, 1],
        "age": [55.0, 150.0, 72.0], # 150 is out of bounds!
        "gender": [0, 1, 0]
    })
    
    file_path = tmp_path / "mock_data.parquet"
    df.to_parquet(file_path)
    
    pipeline = TrainingPipeline()
    # Suppress app config write errors by using mock config dict
    pipeline.app_config = {
        "etl": {"output_dir": str(tmp_path)},
        "validation": {
            "age": {"min": 0, "max": 120},
            "bmi": {"min": 10.0, "max": 80.0},
            "systolic_bp": {"min": 50, "max": 250},
            "diastolic_bp": {"min": 30, "max": 150},
            "glucose": {"min": 20, "max": 1000},
            "heart_rate": {"min": 30, "max": 220}
        }
    }
    
    report = pipeline.generate_data_readiness_report(df, str(file_path))
    
    assert report["row_count"] == 3
    assert report["duplicate_admissions"] == 1
    assert report["outlier_counts"]["age"] == 1
    assert report["validation_passed"] is False  # Must fail due to duplicate admissions
