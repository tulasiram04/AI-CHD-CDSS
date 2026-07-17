import pandas as pd
from etl.transformers.base import BaseTransformer
from etl.transformers.icd_engine import ICDEngine

class ComorbiditiesTransformer(BaseTransformer):
    def __init__(self, icd_engine: ICDEngine):
        self.icd_engine = icd_engine

    def transform(self, admissions_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates comorbidities (Hypertension, Diabetes, Smoking), previous cardiac history,
        and admission frequency strictly prior to the current admission's start time (T_pred).
        """
        features_list = []
        
        admissions = admissions_df.copy()
        admissions["admittime"] = pd.to_datetime(admissions["admittime"])
        
        diagnoses = diagnoses_df.copy()
        
        # Pre-map all diagnoses with ICD engine
        mapped_diagnoses = self.icd_engine.map_diagnoses(diagnoses)
        
        for idx, row in admissions.iterrows():
            subj_id = row["subject_id"]
            hadm_id = row["hadm_id"]
            t_pred = row["admittime"]
            
            # Find all previous admissions for this patient
            prev_admissions = admissions[(admissions["subject_id"] == subj_id) & (admissions["admittime"] < t_pred)]
            admit_freq = len(prev_admissions)
            
            hypertension_flag = 0
            diabetes_flag = 0
            smoking_flag = 0
            prev_cardiac_flag = 0
            
            if admit_freq > 0:
                prev_hadm_ids = prev_admissions["hadm_id"].unique()
                
                # Get diagnoses from previous admissions
                prev_diagnoses = mapped_diagnoses[mapped_diagnoses["hadm_id"].isin(prev_hadm_ids)]
                
                if not prev_diagnoses.empty:
                    if prev_diagnoses["hypertension"].any():
                        hypertension_flag = 1
                    if prev_diagnoses["diabetes"].any():
                        diabetes_flag = 1
                    if prev_diagnoses["smoking_history"].any():
                        smoking_flag = 1
                    if prev_diagnoses["coronary_heart_disease"].any():
                        prev_cardiac_flag = 1
            
            features_list.append({
                "subject_id": subj_id,
                "hadm_id": hadm_id,
                "hypertension": hypertension_flag,
                "diabetes": diabetes_flag,
                "smoking": smoking_flag,
                "previous_cardiac": prev_cardiac_flag,
                "admission_frequency": admit_freq
            })
            
        return pd.DataFrame(features_list)
