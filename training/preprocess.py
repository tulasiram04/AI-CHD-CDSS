import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
import yaml
import logging

logger = logging.getLogger("Preprocessing")

class PreprocessingPipeline:
    def __init__(self, config_path: str = "configs/ml_config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.preprocessor = None
        self.feature_names_out = []

    def _load_config(self) -> dict:
        try:
            with open(self.config_path, "r") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load ml_config: {e}")
            raise

    def build_pipeline(self, numerical_features: list, categorical_features: list, passthrough_features: list):
        """
        Constructs the ColumnTransformer pipeline based on configuration.
        """
        scaler_type = self.config["preprocessing"]["numerical_scaler"]
        
        if scaler_type == "standard":
            scaler = StandardScaler()
        elif scaler_type == "minmax":
            scaler = MinMaxScaler()
        else:
            scaler = StandardScaler()
            
        # Numerical transformer pipeline
        num_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy=self.config["preprocessing"]["impute_strategy_numerical"], keep_empty_features=True)),
            ("scaler", scaler)
        ])
        
        # Categorical transformer pipeline
        cat_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        
        # Assemble preprocessor
        self.preprocessor = ColumnTransformer(
            transformers=[
                ("num", num_transformer, numerical_features),
                ("cat", cat_transformer, categorical_features),
                ("pass", "passthrough", passthrough_features)
            ],
            remainder="drop"
        )
        logger.info("Successfully assembled ColumnTransformer preprocessing pipeline.")

    def fit(self, X: pd.DataFrame):
        if self.preprocessor is None:
            raise ValueError("Pipeline not built. Call build_pipeline first.")
        self.preprocessor.fit(X)
        
        # Retrieve feature names out
        num_features = self.preprocessor.transformers_[0][2]
        cat_encoder = self.preprocessor.named_transformers_["cat"].named_steps["encoder"]
        cat_features = self.preprocessor.transformers_[1][2]
        
        cat_features_out = list(cat_encoder.get_feature_names_out(cat_features)) if len(cat_features) > 0 else []
        pass_features_out = self.preprocessor.transformers_[2][2]
        
        self.feature_names_out = list(num_features) + cat_features_out + list(pass_features_out)

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        if self.preprocessor is None:
            raise ValueError("Pipeline not built.")
        
        transformed = self.preprocessor.transform(X)
        return pd.DataFrame(transformed, columns=self.feature_names_out, index=X.index)

    def fit_transform(self, X: pd.DataFrame) -> pd.DataFrame:
        self.fit(X)
        return self.transform(X)
