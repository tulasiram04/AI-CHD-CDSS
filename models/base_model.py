from abc import ABC, abstractmethod
import pandas as pd
import numpy as np

class BaseModel(ABC):
    """
    Abstract Base Class for all machine learning models in the AI-CHD-CDSS ecosystem.
    Ensures interface consistency and standardized evaluation metrics.
    """
    
    @abstractmethod
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, **kwargs):
        """Trains the model weights on the training feature dataset."""
        pass
        
    @abstractmethod
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts binary classification output (0 or 1)."""
        pass
        
    @abstractmethod
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts risk probabilities."""
        pass
        
    @abstractmethod
    def save(self, filepath: str):
        """Saves the trained model state to disk."""
        pass
        
    @abstractmethod
    def load(self, filepath: str):
        """Loads a model state from disk."""
        pass
