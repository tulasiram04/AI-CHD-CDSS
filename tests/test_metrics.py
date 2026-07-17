import pytest
import numpy as np
from evaluation.metrics import calculate_all_metrics

def test_calculate_all_metrics():
    # Arrange
    # y_true: [0, 0, 1, 1]
    # y_pred: [0, 1, 0, 1]
    # y_prob: [0.1, 0.9, 0.2, 0.8]
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 0, 1])
    y_prob = np.array([0.1, 0.9, 0.2, 0.8])
    
    # Act
    metrics = calculate_all_metrics(y_true, y_pred, y_prob)
    
    # Assert
    # TN: 1, FP: 1, FN: 1, TP: 1
    # Accuracy: 2 / 4 = 0.5
    # Sensitivity (Recall): 1 / 2 = 0.5
    # Specificity: 1 / 2 = 0.5
    assert metrics["accuracy"] == 0.5
    assert metrics["sensitivity"] == 0.5
    assert metrics["specificity"] == 0.5
    assert metrics["precision"] == 0.5
    assert metrics["recall"] == 0.5
    assert metrics["f1"] == 0.5
    
    # Brier Score = ((0.1-0)^2 + (0.9-0)^2 + (0.2-1)^2 + (0.8-1)^2) / 4
    #             = (0.01 + 0.81 + 0.64 + 0.04) / 4 = 1.50 / 4 = 0.375
    assert abs(metrics["brier_score"] - 0.375) < 1e-5
