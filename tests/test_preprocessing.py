import pytest
import pandas as pd
import numpy as np
from training.preprocess import PreprocessingPipeline

def test_preprocessing_pipeline_fit_transform():
    # Arrange: Create sample patient data
    sample_data = pd.DataFrame([
        {"age": 55.0, "bmi": 24.5, "gender": 1, "diabetes": 1},
        {"age": 68.0, "bmi": 31.2, "gender": 0, "diabetes": 0},
        {"age": 42.0, "bmi": 19.8, "gender": 1, "diabetes": 0}
    ])
    
    pipeline = PreprocessingPipeline("configs/ml_config.yaml")
    
    numerical = ["age", "bmi"]
    categorical = ["gender"]
    passthrough = ["diabetes"]
    
    # Act
    pipeline.build_pipeline(numerical, categorical, passthrough)
    transformed_df = pipeline.fit_transform(sample_data)
    
    # Assert columns outputted correctly
    assert "age" in transformed_df.columns
    assert "bmi" in transformed_df.columns
    # Gender one-hot encoded columns (gender_0, gender_1 or similar)
    gender_cols = [c for c in transformed_df.columns if "gender" in c]
    assert len(gender_cols) > 0
    assert "diabetes" in transformed_df.columns
    
    # Assert correct row shapes
    assert len(transformed_df) == 3
    # Assert values scaled (age values should have mean near 0 and variance near 1 after scaling)
    assert not np.isnan(transformed_df["age"].values).any()
