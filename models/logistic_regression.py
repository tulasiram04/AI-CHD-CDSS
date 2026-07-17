import numpy as np
import pandas as pd
import joblib
from models.base_model import BaseModel
from sklearn.linear_model import LogisticRegression

class LogisticRegressionModel(BaseModel):
    def __init__(self, **kwargs):
        self.model = LogisticRegression(**kwargs)

    def train(self, X_train: pd.DataFrame, y_train: pd.Series, **kwargs):
        self.model.fit(X_train, y_train)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1]

    def save(self, filepath: str):
        joblib.dump(self.model, filepath)

    def load(self, filepath: str):
        self.model = joblib.load(filepath)
