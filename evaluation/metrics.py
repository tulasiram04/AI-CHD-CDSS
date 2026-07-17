import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix,
    balanced_accuracy_score, matthews_corrcoef, brier_score_loss, log_loss
)

def calculate_all_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    """
    Computes all standard clinical and statistical classification performance metrics.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_prob = np.array(y_prob)

    # Confusion Matrix components
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    # Specificity & Sensitivity
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    
    # PR-AUC
    precision_vals, recall_vals, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = auc(recall_vals, precision_vals)
    
    # Assemble report dict
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(pr_auc),
        "specificity": float(specificity),
        "sensitivity": float(sensitivity),
        "balanced_accuracy": float(balanced_accuracy_score(y_true, y_pred)),
        "mcc": float(matthews_corrcoef(y_true, y_pred)),
        "brier_score": float(brier_score_loss(y_true, y_prob)),
        "log_loss": float(log_loss(y_true, y_prob))
    }
    
    return metrics

def calculate_dca_net_benefit(y_true: np.ndarray, y_prob: np.ndarray, threshold: float) -> float:
    """
    Computes clinical Net Benefit at a given decision threshold for Decision Curve Analysis.
    Net Benefit = (TP - FP * (threshold / (1 - threshold))) / N
    """
    y_true = np.array(y_true)
    y_prob = np.array(y_prob)
    n = len(y_true)
    
    if n == 0 or threshold <= 0.0 or threshold >= 1.0:
        return 0.0
        
    y_pred = (y_prob >= threshold).astype(int)
    tp = np.sum((y_pred == 1) & (y_true == 1))
    fp = np.sum((y_pred == 1) & (y_true == 0))
    
    net_benefit = (tp - fp * (threshold / (1.0 - threshold))) / n
    return float(net_benefit)

def calculate_dca_treat_all_net_benefit(y_true: np.ndarray, threshold: float) -> float:
    """
    Computes Net Benefit of 'Treat All' strategy at a given threshold.
    """
    y_true = np.array(y_true)
    n = len(y_true)
    
    if n == 0 or threshold <= 0.0 or threshold >= 1.0:
        return 0.0
        
    tp = np.sum(y_true == 1)
    fp = np.sum(y_true == 0)
    
    net_benefit = (tp - fp * (threshold / (1.0 - threshold))) / n
    return float(net_benefit)
