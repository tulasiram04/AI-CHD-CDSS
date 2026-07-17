import numpy as np
import pandas as pd
from sklearn.metrics import recall_score, confusion_matrix
from evaluation.calibration import calculate_ece
import logging

logger = logging.getLogger("FairnessAudit")

def evaluate_subgroup_metrics(
    df: pd.DataFrame,
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
    sensitive_col: str
) -> dict:
    """
    Evaluates classification performance, selection rate, and calibration across subgroups of a sensitive attribute.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_prob = np.array(y_prob)
    
    unique_groups = df[sensitive_col].unique()
    subgroup_reports = {}
    
    for group in unique_groups:
        mask = (df[sensitive_col] == group).values
        
        # Guard against empty subgroups
        if np.sum(mask) == 0:
            continue
            
        y_t_g = y_true[mask]
        y_p_g = y_pred[mask]
        y_pr_g = y_prob[mask]
        
        # Calculate rates
        selection_rate = np.mean(y_p_g == 1)
        
        # TPR / FPR components
        tn, fp, fn, tp = confusion_matrix(y_t_g, y_p_g, labels=[0, 1]).ravel()
        tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        
        # Calibration ECE
        ece = calculate_ece(y_t_g, y_pr_g)
        
        subgroup_reports[str(group)] = {
            "sample_size": int(np.sum(mask)),
            "selection_rate": float(selection_rate),
            "true_positive_rate": float(tpr),  # Equal Opportunity metric
            "false_positive_rate": float(fpr),
            "ece": float(ece)
        }
        
    # Calculate Disparity Ratios/Differences (using the first group as reference)
    ref_group = str(unique_groups[0])
    disparity = {}
    
    for group, metrics in subgroup_reports.items():
        if group == ref_group:
            continue
            
        disparity[f"{group}_vs_{ref_group}"] = {
            "demographic_parity_difference": float(metrics["selection_rate"] - subgroup_reports[ref_group]["selection_rate"]),
            "equal_opportunity_difference": float(metrics["true_positive_rate"] - subgroup_reports[ref_group]["true_positive_rate"]),
            "fpr_difference": float(metrics["false_positive_rate"] - subgroup_reports[ref_group]["false_positive_rate"]),
            "calibration_difference": float(metrics["ece"] - subgroup_reports[ref_group]["ece"])
        }
        
    return {
        "subgroups": subgroup_reports,
        "disparities": disparity
    }
