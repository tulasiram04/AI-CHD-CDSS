from abc import ABC, abstractmethod
import pandas as pd

class BaseTransformer(ABC):
    """
    Abstract base class for all clinical feature transformers.
    Ensures modularity, standardization, and target leakage prevention.
    """
    
    @abstractmethod
    def transform(self, *args, **kwargs) -> pd.DataFrame:
        """
        Transforms raw clinical dataframes into a feature dataframe.
        """
        pass
