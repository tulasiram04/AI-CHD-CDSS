import pytest
import pandas as pd
from training.split import split_dataset

def test_split_dataset_no_leakage():
    # Arrange: Create patient dataset where patients have multiple admissions
    data = pd.DataFrame([
        {"subject_id": 1, "hadm_id": 101, "target": 0},
        {"subject_id": 1, "hadm_id": 102, "target": 0},
        {"subject_id": 2, "hadm_id": 103, "target": 1},
        {"subject_id": 3, "hadm_id": 104, "target": 0},
        {"subject_id": 4, "hadm_id": 105, "target": 1},
        {"subject_id": 4, "hadm_id": 106, "target": 1},
        {"subject_id": 5, "hadm_id": 107, "target": 0},
        {"subject_id": 6, "hadm_id": 108, "target": 1},
        {"subject_id": 7, "hadm_id": 109, "target": 0},
        {"subject_id": 8, "hadm_id": 110, "target": 0}
    ])
    
    # Act
    train_df, val_df, test_df = split_dataset(
        data, 
        train_ratio=0.60, 
        val_ratio=0.20, 
        test_ratio=0.20,
        random_seed=42
    )
    
    # Assert
    train_subjects = set(train_df["subject_id"].unique())
    val_subjects = set(val_df["subject_id"].unique())
    test_subjects = set(test_df["subject_id"].unique())
    
    # Assert absolutely disjoint sets
    assert train_subjects.isdisjoint(val_subjects)
    assert train_subjects.isdisjoint(test_subjects)
    assert val_subjects.isdisjoint(test_subjects)
    
    # Assert all original rows accounted for
    assert len(train_df) + len(val_df) + len(test_df) == len(data)
