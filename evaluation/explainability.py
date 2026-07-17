import shap
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import logging

logger = logging.getLogger("Explainability")

class ClinicalSHAPExplainer:
    def __init__(self, model, model_type: str = "tree"):
        self.model = model
        self.model_type = model_type
        self.explainer = None

    def fit_explainer(self, background_data: pd.DataFrame):
        """Fits the SHAP explainer based on model type."""
        try:
            if self.model_type == "tree":
                # For Tree models (XGBoost, LightGBM, CatBoost, RandomForest)
                self.explainer = shap.TreeExplainer(self.model)
            elif self.model_type == "linear":
                self.explainer = shap.LinearExplainer(self.model, background_data)
            else:
                # KernelExplainer as fallback
                self.explainer = shap.KernelExplainer(self.model.predict_proba, background_data)
            logger.info(f"Fitted SHAP {self.model_type} explainer successfully.")
        except Exception as e:
            logger.error(f"Failed to fit SHAP explainer: {e}")
            raise

    def calculate_shap_values(self, X: pd.DataFrame) -> shap.Explanation:
        """Computes SHAP values for target feature matrix X."""
        if self.explainer is None:
            raise ValueError("Explainer not fitted. Call fit_explainer first.")
        
        # Calculate shap values
        shap_values = self.explainer(X)
        return shap_values

    def save_summary_plot(self, shap_values: shap.Explanation, X: pd.DataFrame, save_path: str):
        """Generates and saves global summary beeswarm plot."""
        plt.figure(figsize=(10, 6))
        
        plot_values = shap_values
        if len(shap_values.shape) == 3 and shap_values.shape[2] == 2:
            plot_values = shap_values[:, :, 1]
            
        shap.summary_plot(plot_values, X, show=False)
        plt.tight_layout()
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=150)
        plt.close()
        logger.info(f"Saved SHAP summary plot to {save_path}")

    def save_local_waterfall_plot(self, shap_values: shap.Explanation, sample_index: int, save_path: str):
        """Generates and saves local waterfall plot for a single patient sample."""
        plt.figure(figsize=(10, 6))
        
        sample_val = shap_values[sample_index]
        if len(sample_val.shape) == 2 and sample_val.shape[1] == 2:
            sample_val = sample_val[:, 1]
            
        shap.plots.waterfall(sample_val, show=False)
        plt.tight_layout()
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=150)
        plt.close()
        logger.info(f"Saved local SHAP waterfall plot for index {sample_index} to {save_path}")

    def generate_local_force_plot_data(self, shap_values: shap.Explanation, sample_index: int) -> dict:
        """
        Compiles numeric features and their contributions for custom frontend visualization.
        Hospitals need this structured raw contribution data instead of raw HTML force plots.
        """
        sample_val = shap_values[sample_index]
        if len(sample_val.shape) == 2 and sample_val.shape[1] == 2:
            sample_val = sample_val[:, 1]
            
        feature_contributions = []
        for i, name in enumerate(sample_val.feature_names):
            feature_contributions.append({
                "feature_name": name,
                "feature_value": float(sample_val.data[i]) if isinstance(sample_val.data[i], (int, float, np.number)) else str(sample_val.data[i]),
                "shap_value": float(sample_val.values[i])
            })
            
        return {
            "base_value": float(sample_val.base_values),
            "prediction_value": float(np.sum(sample_val.values) + sample_val.base_values),
            "contributions": sorted(feature_contributions, key=lambda x: abs(x["shap_value"]), reverse=True)
        }
