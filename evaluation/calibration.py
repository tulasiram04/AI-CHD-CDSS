import numpy as np
from sklearn.calibration import calibration_curve
from sklearn.linear_model import LogisticRegression
from sklearn.isotonic import IsotonicRegression
import logging

logger = logging.getLogger("Calibration")

def calculate_ece(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    """
    Computes Expected Calibration Error (ECE).
    """
    y_true = np.array(y_true)
    y_prob = np.array(y_prob)
    
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    
    for i in range(n_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]
        
        # Select predictions in the bin
        in_bin = (y_prob >= bin_lower) & (y_prob < bin_upper)
        prop_in_bin = np.mean(in_bin)
        
        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(y_true[in_bin])
            avg_confidence_in_bin = np.mean(y_prob[in_bin])
            ece += prop_in_bin * np.abs(avg_confidence_in_bin - accuracy_in_bin)
            
    return float(ece)

class ProbabilityCalibrator:
    def __init__(self, method: str = "isotonic"):
        self.method = method
        self.platt_model = None
        self.isotonic_model = None

    def fit(self, y_prob: np.ndarray, y_true: np.ndarray):
        """Fits probability calibrator using predictions on validation set."""
        y_prob = np.array(y_prob).reshape(-1, 1)
        y_true = np.array(y_true)
        
        # Ensure clipping to avoid division by zero or infinite log odds in platt scaling
        y_prob = np.clip(y_prob, 1e-15, 1 - 1e-15)
        
        if self.method == "platt":
            # Platt scaling is a logistic regression fit on log-odds
            log_odds = np.log(y_prob / (1 - y_prob))
            self.platt_model = LogisticRegression()
            self.platt_model.fit(log_odds, y_true)
            logger.info("Successfully fitted Platt Scaling calibrator.")
            
        elif self.method == "isotonic":
            self.isotonic_model = IsotonicRegression(out_of_bounds="clip")
            self.isotonic_model.fit(y_prob.ravel(), y_true)
            logger.info("Successfully fitted Isotonic Regression calibrator.")

    def calibrate(self, y_prob: np.ndarray) -> np.ndarray:
        """Calibrates predictions."""
        y_prob = np.array(y_prob)
        y_prob_clipped = np.clip(y_prob, 1e-15, 1 - 1e-15)
        
        if self.method == "platt":
            if self.platt_model is None:
                raise ValueError("Calibrator not fitted.")
            log_odds = np.log(y_prob_clipped / (1 - y_prob_clipped)).reshape(-1, 1)
            return self.platt_model.predict_proba(log_odds)[:, 1]
            
        elif self.method == "isotonic":
            if self.isotonic_model is None:
                raise ValueError("Calibrator not fitted.")
            return self.isotonic_model.predict(y_prob)
            
        return y_prob
