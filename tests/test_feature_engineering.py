import pytest
import pandas as pd
from training.feature_engineering import AgeGroupTransformer, ClinicalRiskAggregator

def test_age_group_transformer():
    # Arrange
    df = pd.DataFrame([
        {"age": 30.0},
        {"age": 55.0},
        {"age": 75.0}
    ])
    
    transformer = AgeGroupTransformer(age_column="age")
    
    # Act
    df_out = transformer.transform(df)
    
    # Assert
    # 30 -> group 0, 55 -> group 1, 75 -> group 2
    assert df_out.loc[0, "age_group"] == 0
    assert df_out.loc[1, "age_group"] == 1
    assert df_out.loc[2, "age_group"] == 2

def test_clinical_risk_aggregator():
    # Arrange
    df = pd.DataFrame([
        {"hypertension": 1, "diabetes": 0, "smoking": 1, "previous_cardiac": 0},
        {"hypertension": 0, "diabetes": 0, "smoking": 0, "previous_cardiac": 0}
    ])
    
    aggregator = ClinicalRiskAggregator()
    
    # Act
    df_out = aggregator.transform(df)
    
    # Assert
    assert df_out.loc[0, "comorbidity_burden"] == 2
    assert df_out.loc[1, "comorbidity_burden"] == 0
