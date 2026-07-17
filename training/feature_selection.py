import pandas as pd
import numpy as np
from sklearn.feature_selection import VarianceThreshold, mutual_info_classif, RFE
from sklearn.ensemble import RandomForestClassifier
import logging

logger = logging.getLogger("FeatureSelection")

def remove_low_variance(df: pd.DataFrame, threshold: float = 0.01) -> pd.DataFrame:
    """Removes columns with variance below threshold."""
    selector = VarianceThreshold(threshold=threshold)
    # VT requires numerical inputs
    numeric_df = df.select_dtypes(include=[np.number])
    selector.fit(numeric_df)
    
    kept_cols = numeric_df.columns[selector.get_support()]
    ignored_cols = set(numeric_df.columns) - set(kept_cols)
    logger.info(f"Removed low variance features: {ignored_cols}")
    
    # Re-combine non-numeric columns
    non_numeric_cols = df.select_dtypes(exclude=[np.number]).columns
    return df[list(kept_cols) + list(non_numeric_cols)]

def remove_collinear_features(df: pd.DataFrame, threshold: float = 0.85) -> pd.DataFrame:
    """Removes highly correlated numerical features to prevent collinearity."""
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr().abs()
    
    # Select upper triangle of correlation matrix
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    
    # Find features with correlation greater than threshold
    to_drop = [column for column in upper.columns if any(upper[column] > threshold)]
    
    logger.info(f"Dropping collinear features: {to_drop}")
    return df.drop(columns=to_drop)

def calculate_mutual_info(X: pd.DataFrame, y: pd.Series) -> pd.Series:
    """Calculates mutual information scores for features."""
    scores = mutual_info_classif(X, y, random_state=42)
    return pd.Series(scores, index=X.columns).sort_values(ascending=False)

def run_rfe(X: pd.DataFrame, y: pd.Series, n_features: int = 15) -> list:
    """Runs Recursive Feature Elimination using a Random Forest estimator."""
    estimator = RandomForestClassifier(n_estimators=50, random_state=42)
    selector = RFE(estimator, n_features_to_select=n_features, step=1)
    selector.fit(X, y)
    
    kept_features = list(X.columns[selector.get_support()])
    logger.info(f"RFE selected features: {kept_features}")
    return kept_features
