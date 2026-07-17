import pandas as pd
from etl.transformers.base import BaseTransformer

class DemographicsTransformer(BaseTransformer):
    def transform(self, patients_df: pd.DataFrame, admissions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Extracts demographics: age (at admission time) and gender.
        Caps age at 89 according to HIPAA/MIMIC guidelines.
        """
        # Ensure correct type/datetime parsing
        patients = patients_df.copy()
        admissions = admissions_df.copy()
        
        admissions["admittime"] = pd.to_datetime(admissions["admittime"])
        admissions["admit_year"] = admissions["admittime"].dt.year
        
        # Merge admissions and patients
        merged = pd.merge(admissions, patients, on="subject_id", how="inner")
        
        # Calculate age at admission
        merged["age"] = merged["anchor_age"] + (merged["admit_year"] - merged["anchor_year"])
        
        # MIMIC obscures ages > 89 as 89. Cap calculated age at 89 to prevent leakage/extreme outliers
        merged.loc[merged["age"] > 89, "age"] = 89
        merged.loc[merged["age"] < 0, "age"] = 0  # Clean check
        
        # Map gender F -> 0, M -> 1
        merged["gender"] = merged["gender"].map({"F": 0, "M": 1})
        
        # Keep only required columns
        features = merged[["subject_id", "hadm_id", "admittime", "age", "gender"]]
        return features
