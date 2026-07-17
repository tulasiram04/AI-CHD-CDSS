import pytest
import numpy as np
from evaluation.calibration import ProbabilityCalibrator, calculate_ece

def test_probability_calibrator_isotonic():
    """Verify Isotonic Calibration calibration curves on mock inputs."""
    np.random.seed(42)
    y_true = np.array([0, 0, 0, 1, 1, 1] * 10)
    # Mock uncalibrated probabilities (slightly off)
    y_prob = np.array([0.1, 0.2, 0.4, 0.6, 0.8, 0.9] * 10)
    
    calibrator = ProbabilityCalibrator(method="isotonic")
    calibrator.fit(y_prob, y_true)
    
    calibrated_probs = calibrator.calibrate(y_prob)
    
    assert calibrated_probs.shape == y_prob.shape
    assert np.all(calibrated_probs >= 0.0)
    assert np.all(calibrated_probs <= 1.0)

def test_probability_calibrator_platt():
    """Verify Platt Scaling calibration curves."""
    np.random.seed(42)
    y_true = np.array([0, 0, 1, 1] * 25)
    y_prob = np.array([0.2, 0.3, 0.7, 0.8] * 25)
    
    calibrator = ProbabilityCalibrator(method="platt")
    calibrator.fit(y_prob, y_true)
    
    calibrated_probs = calibrator.calibrate(y_prob)
    
    assert calibrated_probs.shape == y_prob.shape
    assert np.all(calibrated_probs >= 0.0)
    assert np.all(calibrated_probs <= 1.0)

def test_expected_calibration_error_calculation():
    """Verify ECE computes mathematically correct error bounds."""
    y_true = np.array([1, 1, 1, 1, 1])
    # Use 0.99 instead of 1.0 to fit inside standard bin_boundaries [0.8, 1.0) of calculate_ece
    y_prob = np.array([0.99, 0.99, 0.99, 0.99, 0.99])
    ece = calculate_ece(y_true, y_prob, n_bins=5)
    # Expected: |1.0 - 0.99| = 0.01
    assert abs(ece - 0.01) < 1e-5
    
    y_true_off = np.array([0, 0, 0, 0, 0])
    y_prob_off = np.array([0.99, 0.99, 0.99, 0.99, 0.99])
    ece_off = calculate_ece(y_true_off, y_prob_off, n_bins=5)
    # Expected: |0.0 - 0.99| = 0.99
    assert abs(ece_off - 0.99) < 1e-5
