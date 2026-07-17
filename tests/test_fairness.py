import pytest
import pandas as pd
import numpy as np
from evaluation.fairness import evaluate_subgroup_metrics

def test_fairness_subgroup_disparity():
    """Verify subgroups and disparities evaluation for sensitive columns."""
    df = pd.DataFrame({
        "gender": [0, 0, 0, 0, 1, 1, 1, 1],
        "age_group": [1, 1, 2, 2, 1, 1, 2, 2]
    })
    y_true = np.array([0, 1, 0, 1, 0, 1, 0, 1])
    y_pred = np.array([0, 1, 0, 0, 0, 1, 0, 1]) # Slightly different predictions for gender 0 vs 1
    y_prob = np.array([0.1, 0.9, 0.2, 0.3, 0.1, 0.9, 0.2, 0.8])
    
    report = evaluate_subgroup_metrics(df, y_true, y_pred, y_prob, "gender")
    
    assert "subgroups" in report
    assert "disparities" in report
    assert "0" in report["subgroups"]
    assert "1" in report["subgroups"]
    
    # 0 is the reference group, so disparities is 1 vs 0
    assert "1_vs_0" in report["disparities"]
    disparities = report["disparities"]["1_vs_0"]
    assert "demographic_parity_difference" in disparities
    assert "equal_opportunity_difference" in disparities
    assert "fpr_difference" in disparities
    assert "calibration_difference" in disparities
