import pandas as pd
import os

data_dir = "d:/mimic-iv-clinical-database-demo-2.2/mimic-iv-clinical-database-demo-2.2/hosp"

# Check if there is any lab item with "heart", "pulse", or "rate"
d_lab_path = os.path.join(data_dir, "d_labitems.csv.gz")
if os.path.exists(d_lab_path):
    df_lab = pd.read_csv(d_lab_path)
    print("=== Pulse / Heart Rate Lab Items ===")
    print(df_lab[df_lab["label"].str.contains("heart|pulse|rate", case=False, na=False)])

# Let's inspect some labevents to see if we have heart rate or something similar.
# Wait, let's load a few rows of labevents.
lab_path = os.path.join(data_dir, "labevents.csv.gz")
if os.path.exists(lab_path):
    # Let's read first 10000 rows to see if we can find typical itemids or labels
    df_lab_ev = pd.read_csv(lab_path, nrows=10000)
    print("\n=== First few rows of labevents ===")
    print(df_lab_ev.head(5))
