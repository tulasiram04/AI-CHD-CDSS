import pandas as pd
import gzip
import os

data_dir = "d:/mimic-iv-clinical-database-demo-2.2/mimic-iv-clinical-database-demo-2.2/hosp"

tables = [
    "patients.csv.gz",
    "admissions.csv.gz",
    "diagnoses_icd.csv.gz",
    "omr.csv.gz",
    "prescriptions.csv.gz",
    "d_labitems.csv.gz",
    "d_icd_diagnoses.csv.gz"
]

for t in tables:
    path = os.path.join(data_dir, t)
    if os.path.exists(path):
        try:
            df = pd.read_csv(path, nrows=5)
            print(f"=== {t} ===")
            print("Columns:", df.columns.tolist())
            print(df.head(2))
            print()
        except Exception as e:
            print(f"Error reading {t}: {e}")
    else:
        print(f"{t} not found at {path}")
