import re
import yaml
import pandas as pd
import logging

logger = logging.getLogger("ICDEngine")

class ICDEngine:
    def __init__(self, mapping_path: str = "configs/icd_mappings.yaml"):
        self.mapping_path = mapping_path
        self.mappings = self._load_mappings()

    def _load_mappings(self) -> dict:
        try:
            with open(self.mapping_path, "r") as f:
                mappings = yaml.safe_load(f)
            logger.info(f"Successfully loaded ICD mappings from {self.mapping_path}")
            return mappings
        except Exception as e:
            logger.error(f"Failed to load ICD mappings from {self.mapping_path}: {e}")
            raise

    def get_regex_patterns(self, condition: str, version: int) -> list:
        if condition not in self.mappings:
            logger.warning(f"Condition '{condition}' not found in mappings.")
            return []
        
        version_key = f"icd{version}"
        return self.mappings[condition].get(version_key, [])

    def map_diagnoses(self, df: pd.DataFrame, code_col: str = "icd_code", version_col: str = "icd_version") -> pd.DataFrame:
        """
        Maps a dataframe of patient/admission diagnoses to flags.
        Expects columns code_col and version_col.
        Returns a DataFrame grouped by subject_id (and optionally hadm_id) with boolean flags for each condition.
        """
        # Ensure codes are strings and stripped
        df = df.copy()
        df[code_col] = df[code_col].astype(str).str.strip()
        
        # Initialize flags
        for condition in self.mappings.keys():
            df[condition] = False
            
            # Map for ICD-9 (version = 9)
            patterns_9 = self.get_regex_patterns(condition, 9)
            if patterns_9:
                regex_9 = "|".join(patterns_9)
                mask_9 = (df[version_col] == 9) & df[code_col].str.contains(regex_9, re.IGNORECASE, na=False)
                df.loc[mask_9, condition] = True
                
            # Map for ICD-10 (version = 10)
            patterns_10 = self.get_regex_patterns(condition, 10)
            if patterns_10:
                regex_10 = "|".join(patterns_10)
                mask_10 = (df[version_col] == 10) & df[code_col].str.contains(regex_10, re.IGNORECASE, na=False)
                df.loc[mask_10, condition] = True

        return df
