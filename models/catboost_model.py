import numpy as np
import pandas as pd
from models.base_model import BaseModel
import catboost as cb

class CatBoostModel(BaseModel):
    def __init__(self, **kwargs):
        # Disable logging output by default for cleaner logs
        if "verbose" not in kwargs:
            kwargs["verbose"] = False
        self.model = cb.CatBoostClassifier(**kwargs)

    def train(self, X_train: pd.DataFrame, y_train: pd.Series, **kwargs):
        self.model.fit(X_train, y_train)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1]

    def save(self, filepath: str):
        self.model.save_model(filepath)

    def load(self, filepath: str):
        self.model = cb.CatBoostClassifier()
        self.model.load_model(filepath)
