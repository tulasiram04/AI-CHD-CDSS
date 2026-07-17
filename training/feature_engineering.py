import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class AgeGroupTransformer(BaseEstimator, TransformerMixin):
    """
    Groups age into clinically meaningful categories.
    Categorical categories:
      - 0: <45 (Low default age risk)
      - 1: 45-65 (Moderate age risk)
      - 2: >65 (High age risk)
    """
    def __init__(self, age_column: str = "age"):
        self.age_column = age_column

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        if self.age_column in X_out.columns:
            X_out["age_group"] = pd.cut(
                X_out[self.age_column],
                bins=[0, 45, 65, 120],
                labels=[0, 1, 2],
                include_lowest=True
            ).astype(int)
        return X_out

class ClinicalRiskAggregator(BaseEstimator, TransformerMixin):
    """
    Creates risk summaries from lab indicators and comorbidities.
    """
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        
        # Calculate risk scores based on Hypertension, Diabetes, and smoking history
        comorbidities = ["hypertension", "diabetes", "smoking", "previous_cardiac"]
        existing_comorb = [c for c in comorbidities if c in X_out.columns]
        
        if existing_comorb:
            # sum comorbid flags
            X_out["comorbidity_burden"] = X_out[existing_comorb].sum(axis=1)
            
        return X_out
