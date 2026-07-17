import pandas as pd
import numpy as np
from etl.transformers.base import BaseTransformer

class VitalsTransformer(BaseTransformer):
    def transform(
        self, 
        admissions_df: pd.DataFrame, 
        omr_df: pd.DataFrame, 
        labevents_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Extracts vitals, weight, height, BMI, blood pressure, glucose, and cholesterol.
        Ensures all features are computed strictly using records dated BEFORE the admission time (admittime).
        """
        # Prepare outputs list
        features_list = []
        
        admissions = admissions_df.copy()
        admissions["admittime"] = pd.to_datetime(admissions["admittime"])
        
        # Prepare OMR data
        omr = omr_df.copy()
        omr["chartdate"] = pd.to_datetime(omr["chartdate"])
        
        # Prepare Labevents data
        labs = labevents_df.copy()
        labs["charttime"] = pd.to_datetime(labs["charttime"])
        labs["valuenum"] = pd.to_numeric(labs["valuenum"], errors="coerce")
        
        # Glucose & Cholesterol Item IDs
        GLUCOSE_ITEMS = [50931, 50809, 52027, 52569]
        CHOL_TOTAL_ITEMS = [50907]
        CHOL_LDL_ITEMS = [50905, 50906]
        CHOL_HDL_ITEMS = [50904]
        
        for idx, row in admissions.iterrows():
            subj_id = row["subject_id"]
            hadm_id = row["hadm_id"]
            t_pred = row["admittime"]
            
            # 1. Filter OMR records before t_pred
            patient_omr = omr[(omr["subject_id"] == subj_id) & (omr["chartdate"] < t_pred)]
            
            height = np.nan
            weight = np.nan
            bmi = np.nan
            systolic_bp = np.nan
            diastolic_bp = np.nan
            
            if not patient_omr.empty:
                # Height: get most recent
                height_rec = patient_omr[patient_omr["result_name"] == "Height (Inches)"]
                if not height_rec.empty:
                    # Convert to meters (inches * 0.0254)
                    val = pd.to_numeric(height_rec.sort_values("chartdate").iloc[-1]["result_value"], errors="coerce")
                    height = val * 0.0254 if not pd.isna(val) else np.nan
                    
                # Weight: get most recent
                weight_rec = patient_omr[patient_omr["result_name"] == "Weight (Lbs)"]
                if not weight_rec.empty:
                    # Convert to kg (lbs * 0.453592)
                    val = pd.to_numeric(weight_rec.sort_values("chartdate").iloc[-1]["result_value"], errors="coerce")
                    weight = val * 0.453592 if not pd.isna(val) else np.nan
                    
                # BMI: get most recent, or calculate if height/weight exist
                bmi_rec = patient_omr[patient_omr["result_name"] == "BMI (kg/m2)"]
                if not bmi_rec.empty:
                    bmi = pd.to_numeric(bmi_rec.sort_values("chartdate").iloc[-1]["result_value"], errors="coerce")
                elif not pd.isna(height) and not pd.isna(weight) and height > 0:
                    bmi = weight / (height ** 2)
                    
                # BP: get most recent
                bp_rec = patient_omr[patient_omr["result_name"] == "Blood Pressure"]
                if not bp_rec.empty:
                    bp_val = str(bp_rec.sort_values("chartdate").iloc[-1]["result_value"])
                    if "/" in bp_val:
                        parts = bp_val.split("/")
                        systolic_bp = pd.to_numeric(parts[0], errors="coerce")
                        diastolic_bp = pd.to_numeric(parts[1], errors="coerce")

            # 2. Filter Labevents before t_pred
            patient_labs = labs[(labs["subject_id"] == subj_id) & (labs["charttime"] < t_pred)]
            
            glucose = np.nan
            chol_total = np.nan
            chol_ldl = np.nan
            chol_hdl = np.nan
            
            if not patient_labs.empty:
                # Glucose
                g_labs = patient_labs[patient_labs["itemid"].isin(GLUCOSE_ITEMS)]
                if not g_labs.empty:
                    glucose = g_labs.sort_values("charttime").iloc[-1]["valuenum"]
                    
                # Cholesterol Total
                c_tot = patient_labs[patient_labs["itemid"].isin(CHOL_TOTAL_ITEMS)]
                if not c_tot.empty:
                    chol_total = c_tot.sort_values("charttime").iloc[-1]["valuenum"]
                    
                # Cholesterol LDL
                c_ldl = patient_labs[patient_labs["itemid"].isin(CHOL_LDL_ITEMS)]
                if not c_ldl.empty:
                    chol_ldl = c_ldl.sort_values("charttime").iloc[-1]["valuenum"]
                    
                # Cholesterol HDL
                c_hdl = patient_labs[patient_labs["itemid"].isin(CHOL_HDL_ITEMS)]
                if not c_hdl.empty:
                    chol_hdl = c_hdl.sort_values("charttime").iloc[-1]["valuenum"]
            
            # Missing Indicators
            bmi_missing = 1 if pd.isna(bmi) else 0
            bp_missing = 1 if (pd.isna(systolic_bp) or pd.isna(diastolic_bp)) else 0
            glucose_missing = 1 if pd.isna(glucose) else 0
            chol_missing = 1 if (pd.isna(chol_total) and pd.isna(chol_ldl) and pd.isna(chol_hdl)) else 0
            
            # Heart rate is not in demo non-ICU data, flag as missing
            heart_rate = np.nan
            hr_missing = 1
            
            features_list.append({
                "subject_id": subj_id,
                "hadm_id": hadm_id,
                "bmi": bmi,
                "bmi_missing": bmi_missing,
                "systolic_bp": systolic_bp,
                "diastolic_bp": diastolic_bp,
                "bp_missing": bp_missing,
                "glucose": glucose,
                "glucose_missing": glucose_missing,
                "cholesterol": chol_total if not pd.isna(chol_total) else (chol_ldl + chol_hdl if not pd.isna(chol_ldl) and not pd.isna(chol_hdl) else np.nan),
                "chol_missing": chol_missing,
                "heart_rate": heart_rate,
                "hr_missing": hr_missing
            })
            
        return pd.DataFrame(features_list)
