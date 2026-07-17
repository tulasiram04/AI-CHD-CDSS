import os
import yaml
import gzip
import pandas as pd
import numpy as np
from datetime import datetime
import logging

from etl.transformers.icd_engine import ICDEngine
from etl.transformers.demographics import DemographicsTransformer
from etl.transformers.vitals import VitalsTransformer
from etl.transformers.medications import MedicationsTransformer
from etl.transformers.comorbidities import ComorbiditiesTransformer
from validation.schemas import validate_features
from lineage.tracker import LineageTracker

# Setup Logging
os.makedirs("etl/logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("etl/logs/pipeline.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ETLPipeline")

class ETLPipeline:
    def __init__(self, config_path: str = "configs/app_config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.icd_engine = ICDEngine()
        self.lineage_tracker = LineageTracker()

    def _load_config(self) -> dict:
        try:
            with open(self.config_path, "r") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load app config: {e}")
            raise

    def load_raw_tables(self) -> dict:
        raw_dir = self.config["etl"]["raw_data_dir"]
        hosp_dir = os.path.join(raw_dir, "hosp")
        
        logger.info(f"Loading raw tables from: {hosp_dir}")
        tables = {}
        required_tables = [
            "patients.csv.gz",
            "admissions.csv.gz",
            "diagnoses_icd.csv.gz",
            "omr.csv.gz",
            "prescriptions.csv.gz",
            "labevents.csv.gz"
        ]
        
        for table in required_tables:
            path = os.path.join(hosp_dir, table)
            if not os.path.exists(path):
                logger.error(f"Required table {table} not found at {path}")
                raise FileNotFoundError(f"Missing MIMIC-IV table: {table}")
            
            logger.info(f"Reading {table}...")
            # For efficiency in development/testing, read gzip file directly
            tables[table.split(".")[0]] = pd.read_csv(path, compression="gzip")
            logger.info(f"Loaded {table} with {len(tables[table.split('.')[0]])} rows.")
            
        return tables

    def compute_target(self, admissions_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> pd.Series:
        """
        Determines target CHD status for each admission.
        Target is 1 if any diagnosis code from this admission matches CHD regex.
        """
        mapped = self.icd_engine.map_diagnoses(diagnoses_df)
        chd_admissions = mapped[mapped["coronary_heart_disease"] == True]["hadm_id"].unique()
        
        target = admissions_df["hadm_id"].isin(chd_admissions).astype(int)
        return target

    def impute_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies cohort-based median imputation on missing numerical vitals (Glucose, BP, HR).
        Cholesterol is left as NaN (Unavailable) as per clinical guidelines.
        """
        imputed_df = df.copy()
        
        # Create age buckets for cohort grouping
        imputed_df["age_bucket"] = pd.cut(
            imputed_df["age"], 
            bins=[0, 45, 65, 120], 
            labels=["<45", "45-65", ">65"],
            include_lowest=True
        ).astype(str)
        
        # Extract features to impute from config
        impute_rules = self.config.get("imputation", {})
        
        for feature, rules in impute_rules.items():
            if feature not in imputed_df.columns:
                continue
                
            group_cols = rules.get("group_by", ["gender", "age_bucket"])
            strategy = rules.get("strategy", "median")
            
            logger.info(f"Imputing {feature} using cohort {strategy} grouped by {group_cols}")
            
            # Compute cohort medians
            if strategy == "median":
                medians = imputed_df.groupby(group_cols)[feature].transform("median")
                imputed_df[feature] = imputed_df[feature].fillna(medians)
                
                # Fallback to global median if still missing
                global_median = imputed_df[feature].median()
                if not pd.isna(global_median):
                    imputed_df[feature] = imputed_df[feature].fillna(global_median)
                    
        # Drop temporary age bucket column
        imputed_df = imputed_df.drop(columns=["age_bucket"])
        return imputed_df

    def run(self):
        logger.info("Starting clinical ETL pipeline run...")
        
        # 1. Load data
        tables = self.load_raw_tables()
        
        # 2. Extract demographics
        logger.info("Extracting Demographics...")
        demo_trans = DemographicsTransformer()
        features = demo_trans.transform(tables["patients"], tables["admissions"])
        
        # 3. Extract vitals and labs
        logger.info("Extracting Vitals & Lab measurements...")
        vitals_trans = VitalsTransformer()
        vitals_features = vitals_trans.transform(
            tables["admissions"], 
            tables["omr"], 
            tables["labevents"]
        )
        
        # Merge
        features = pd.merge(features, vitals_features, on=["subject_id", "hadm_id"], how="inner")
        
        # 4. Extract medication history
        logger.info("Extracting Medication History...")
        meds_trans = MedicationsTransformer()
        med_features = meds_trans.transform(tables["admissions"], tables["prescriptions"])
        
        # Merge
        features = pd.merge(features, med_features, on=["subject_id", "hadm_id"], how="inner")
        
        # 5. Extract comorbidities & clinical history
        logger.info("Extracting Comorbidities & Clinical History...")
        comorb_trans = ComorbiditiesTransformer(self.icd_engine)
        comorb_features = comorb_trans.transform(tables["admissions"], tables["diagnoses_icd"])
        
        # Merge
        features = pd.merge(features, comorb_features, on=["subject_id", "hadm_id"], how="inner")
        
        # 6. Compute Target
        logger.info("Computing CHD target flag...")
        features["target"] = self.compute_target(tables["admissions"], tables["diagnoses_icd"])
        
        # 7. Imputation
        logger.info("Running cohort-based imputation...")
        features = self.impute_features(features)
        
        # 8. Pandera Validation
        logger.info("Validating dataset against Pandera schemas...")
        valid_df, quarantined_df, report = validate_features(features)
        logger.info(f"Validation Report: {report}")
        
        # Save quarantine if any
        if not quarantined_df.empty:
            quarantine_path = os.path.join(self.config["etl"]["quarantine_dir"], f"quarantined_{datetime.now().strftime('%Y%m%d')}.csv")
            os.makedirs(os.path.dirname(quarantine_path), exist_ok=True)
            quarantined_df.to_csv(quarantine_path, index=False)
            logger.warning(f"Quarantined {len(quarantined_df)} records to {quarantine_path}")
            
        # 9. Save Processed Outputs (Immutable versioning)
        version_str = datetime.now().strftime("%Y%m%d_v1")
        output_dir = self.config["etl"]["output_dir"]
        os.makedirs(output_dir, exist_ok=True)
        
        csv_out = os.path.join(output_dir, f"processed_{version_str}.csv")
        parquet_out = os.path.join(output_dir, f"processed_{version_str}.parquet")
        
        logger.info(f"Saving processed dataset to CSV: {csv_out}")
        valid_df.to_csv(csv_out, index=False)
        
        logger.info(f"Saving processed dataset to Parquet: {parquet_out}")
        valid_df.to_parquet(parquet_out, index=False)
        
        # 10. Log Data Lineage
        raw_files = {
            t: os.path.join(self.config["etl"]["raw_data_dir"], "hosp", f"{t}.csv.gz")
            for t in ["patients", "admissions", "diagnoses_icd", "omr", "prescriptions", "labevents"]
        }
        output_files = {
            "csv": csv_out,
            "parquet": parquet_out
        }
        self.lineage_tracker.log_run(
            version=version_str,
            raw_files=raw_files,
            output_files=output_files,
            row_count=len(valid_df),
            feature_count=len(valid_df.columns),
            validation_report=report
        )
        logger.info("ETL pipeline run completed successfully.")
        
if __name__ == "__main__":
    pipeline = ETLPipeline()
    pipeline.run()
