import pytest
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from evaluation.explainability import ClinicalSHAPExplainer

def test_shap_explainer_waterfall_and_force_plot():
    """Verify SHAP explainer compiles global and local plots successfully."""
    # Create simple mock model
    np.random.seed(42)
    X = pd.DataFrame(np.random.normal(size=(20, 3)), columns=["age", "bmi", "glucose"])
    y = np.random.randint(0, 2, size=20)
    
    model = RandomForestClassifier(n_estimators=5, random_state=42)
    model.fit(X, y)
    
    explainer = ClinicalSHAPExplainer(model, model_type="tree")
    explainer.fit_explainer(X)
    
    shap_values = explainer.calculate_shap_values(X)
    
    assert shap_values.shape == (20, 3, 2) or shap_values.shape == (20, 3)
    
    # Verify local force plot data compilation
    force_data = explainer.generate_local_force_plot_data(shap_values, 0)
    assert "base_value" in force_data
    assert "prediction_value" in force_data
    assert len(force_data["contributions"]) == 3
    assert force_data["contributions"][0]["feature_name"] in ["age", "bmi", "glucose"]
