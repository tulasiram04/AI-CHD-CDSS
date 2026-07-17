import pytest
import pandas as pd
import numpy as np
import os

from etl.transformers.icd_engine import ICDEngine
from validation.schemas import clinical_feature_schema, validate_features

def test_icd_engine_mapping():
    # Setup standard ICD Engine
    icd_engine = ICDEngine("configs/icd_mappings.yaml")
    
    # Create test diagnoses
    test_diagnoses = pd.DataFrame([
        {"subject_id": 10001, "hadm_id": 200001, "icd_code": "410.01", "icd_version": 9},  # CHD ICD9
        {"subject_id": 10001, "hadm_id": 200001, "icd_code": "401.9", "icd_version": 9},   # Hypertension ICD9
        {"subject_id": 10002, "hadm_id": 200002, "icd_code": "I21.4", "icd_version": 10},  # CHD ICD10
        {"subject_id": 10003, "hadm_id": 200003, "icd_code": "E11.9", "icd_version": 10},  # Diabetes ICD10
    ])
    
    mapped = icd_engine.map_diagnoses(test_diagnoses)
    
    # Assert CHD flag correctly compiles
    assert mapped.loc[0, "coronary_heart_disease"] == True
    assert mapped.loc[0, "hypertension"] == False
    assert mapped.loc[1, "coronary_heart_disease"] == False
    assert mapped.loc[1, "hypertension"] == True
    assert mapped.loc[2, "coronary_heart_disease"] == True
    assert mapped.loc[3, "diabetes"] == True
    assert mapped.loc[3, "coronary_heart_disease"] == False

def test_pandera_schema_validation():
    # Create valid mock dataframe matching all validation specs
    valid_data = pd.DataFrame([{
        "subject_id": 1001,
        "hadm_id": 2001,
        "age": 62.5,
        "gender": 1,
        "bmi": 28.4,
        "bmi_missing": 0,
        "systolic_bp": 130.0,
        "diastolic_bp": 82.0,
        "bp_missing": 0,
        "glucose": 95.0,
        "glucose_missing": 0,
        "cholesterol": 180.0,
        "chol_missing": 0,
        "heart_rate": 72.0,
        "hr_missing": 0,
        "hypertension": 1,
        "diabetes": 0,
        "smoking": 1,
        "previous_cardiac": 0,
        "admission_frequency": 3,
        "statin_history": 1,
        "beta_blocker_history": 0,
        "ace_arb_history": 1,
        "aspirin_history": 1,
        "medication_count": 3,
        "target": 1
    }])
    
    valid, quarantined, report = validate_features(valid_data)
    assert len(valid) == 1
    assert len(quarantined) == 0
    assert report["status"] == "success"

def test_pandera_schema_quarantines_out_of_bounds():
    # Create invalid mock dataframe with extreme outlier age and BP
    invalid_data = pd.DataFrame([
        # Row 1: Valid
        {
            "subject_id": 1001, "hadm_id": 2001, "age": 45.0, "gender": 1,
            "bmi": 22.0, "bmi_missing": 0, "systolic_bp": 120.0, "diastolic_bp": 80.0, "bp_missing": 0,
            "glucose": 90.0, "glucose_missing": 0, "cholesterol": 150.0, "chol_missing": 0,
            "heart_rate": 70.0, "hr_missing": 0, "hypertension": 0, "diabetes": 0, "smoking": 0,
            "previous_cardiac": 0, "admission_frequency": 1, "statin_history": 0, "beta_blocker_history": 0,
            "ace_arb_history": 0, "aspirin_history": 0, "medication_count": 0, "target": 0
        },
        # Row 2: Invalid (Age > 120, Systolic BP > 250)
        {
            "subject_id": 1002, "hadm_id": 2002, "age": 150.0, "gender": 1,  # Out of range
            "bmi": 22.0, "bmi_missing": 0, "systolic_bp": 300.0, "diastolic_bp": 80.0, "bp_missing": 0,  # Out of range
            "glucose": 90.0, "glucose_missing": 0, "cholesterol": 150.0, "chol_missing": 0,
            "heart_rate": 70.0, "hr_missing": 0, "hypertension": 0, "diabetes": 0, "smoking": 0,
            "previous_cardiac": 0, "admission_frequency": 1, "statin_history": 0, "beta_blocker_history": 0,
            "ace_arb_history": 0, "aspirin_history": 0, "medication_count": 0, "target": 0
        }
    ])
    
    valid, quarantined, report = validate_features(invalid_data)
    assert len(valid) == 1
    assert len(quarantined) == 1
    assert quarantined.iloc[0]["subject_id"] == 1002
    assert report["status"] == "partial_success"
