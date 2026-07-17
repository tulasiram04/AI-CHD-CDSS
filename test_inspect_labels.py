import pandas as pd
import os

data_dir = "d:/mimic-iv-clinical-database-demo-2.2/mimic-iv-clinical-database-demo-2.2/hosp"

# Check OMR result names
omr_path = os.path.join(data_dir, "omr.csv.gz")
if os.path.exists(omr_path):
    df_omr = pd.read_csv(omr_path)
    print("=== Unique OMR Result Names ===")
    print(df_omr["result_name"].value_counts())
    print(df_omr.head(10))
    print()

# Check Lab Items related to Glucose, Cholesterol
d_lab_path = os.path.join(data_dir, "d_labitems.csv.gz")
if os.path.exists(d_lab_path):
    df_lab = pd.read_csv(d_lab_path)
    print("=== Lab Items for Glucose ===")
    print(df_lab[df_lab["label"].str.contains("glucose", case=False, na=False)][["itemid", "label", "fluid", "category"]])
    print("\n=== Lab Items for Cholesterol ===")
    print(df_lab[df_lab["label"].str.contains("cholesterol", case=False, na=False)][["itemid", "label", "fluid", "category"]])
    print("\n=== Lab Items for Lipids/LDL/HDL ===")
    print(df_lab[df_lab["label"].str.contains("ldl|hdl", case=False, na=False)][["itemid", "label", "fluid", "category"]])
