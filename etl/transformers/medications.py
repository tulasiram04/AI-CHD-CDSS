import pandas as pd
import numpy as np
from etl.transformers.base import BaseTransformer

class MedicationsTransformer(BaseTransformer):
    def transform(self, admissions_df: pd.DataFrame, prescriptions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Extracts historical medication flags and counts strictly prior to the target admission time.
        Identifies key cardiovascular classes: Statins, Beta-blockers, ACE Inhibitors/ARBs, and Aspirin/Antiplatelets.
        """
        features_list = []
        
        admissions = admissions_df.copy()
        admissions["admittime"] = pd.to_datetime(admissions["admittime"])
        
        prescriptions = prescriptions_df.copy()
        prescriptions["starttime"] = pd.to_datetime(prescriptions["starttime"])
        
        # Define drug classes regex
        STATINS = r"atorvastatin|simvastatin|rosuvastatin|pravastatin|lovastatin|fluvastatin|pitavastatin"
        BETA_BLOCKERS = r"metoprolol|carvedilol|atenolol|propranolol|bisoprolol|labetalol|nadolol"
        ACE_ARBS = r"lisinopril|enalapril|ramipril|benazepril|quinapril|fosinopril|losartan|valsartan|candesartan|irbesartan|olmesartan"
        ASPIRIN = r"aspirin|clopidogrel|prasugrel|ticagrelor"
        
        for idx, row in admissions.iterrows():
            subj_id = row["subject_id"]
            hadm_id = row["hadm_id"]
            t_pred = row["admittime"]
            
            # Filter patient prescriptions prior to t_pred
            patient_rx = prescriptions[(prescriptions["subject_id"] == subj_id) & (prescriptions["starttime"] < t_pred)]
            
            statin_flag = 0
            beta_blocker_flag = 0
            ace_arb_flag = 0
            aspirin_flag = 0
            
            if not patient_rx.empty:
                # Lowercase drug names for mapping
                drugs = patient_rx["drug"].astype(str).str.lower().values
                
                # Check for drug classes
                if any(pd.Series(drugs).str.contains(STATINS, regex=True, na=False)):
                    statin_flag = 1
                if any(pd.Series(drugs).str.contains(BETA_BLOCKERS, regex=True, na=False)):
                    beta_blocker_flag = 1
                if any(pd.Series(drugs).str.contains(ACE_ARBS, regex=True, na=False)):
                    ace_arb_flag = 1
                if any(pd.Series(drugs).str.contains(ASPIRIN, regex=True, na=False)):
                    aspirin_flag = 1
                    
            med_count = statin_flag + beta_blocker_flag + ace_arb_flag + aspirin_flag
            
            features_list.append({
                "subject_id": subj_id,
                "hadm_id": hadm_id,
                "statin_history": statin_flag,
                "beta_blocker_history": beta_blocker_flag,
                "ace_arb_history": ace_arb_flag,
                "aspirin_history": aspirin_flag,
                "medication_count": med_count
            })
            
        return pd.DataFrame(features_list)
