import pandera as pa
from pandera import Column, Check

# Define validation schema for the clinical features dataset
clinical_feature_schema = pa.DataFrameSchema(
    columns={
        "subject_id": Column(pa.Int64, nullable=False),
        "hadm_id": Column(pa.Int64, nullable=False),
        "age": Column(pa.Float64, Check.in_range(0.0, 120.0), nullable=False),
        "gender": Column(pa.Int64, Check.isin([0, 1]), nullable=False),
        "bmi": Column(pa.Float64, Check.in_range(10.0, 80.0), nullable=True),
        "bmi_missing": Column(pa.Int64, Check.isin([0, 1])),
        "systolic_bp": Column(pa.Float64, Check.in_range(50.0, 250.0), nullable=True),
        "diastolic_bp": Column(pa.Float64, Check.in_range(30.0, 150.0), nullable=True),
        "bp_missing": Column(pa.Int64, Check.isin([0, 1])),
        "glucose": Column(pa.Float64, Check.in_range(20.0, 1000.0), nullable=True),
        "glucose_missing": Column(pa.Int64, Check.isin([0, 1])),
        "cholesterol": Column(pa.Float64, Check.in_range(50.0, 600.0), nullable=True),
        "chol_missing": Column(pa.Int64, Check.isin([0, 1])),
        "heart_rate": Column(pa.Float64, Check.in_range(30.0, 220.0), nullable=True),
        "hr_missing": Column(pa.Int64, Check.isin([0, 1])),
        "hypertension": Column(pa.Int64, Check.isin([0, 1])),
        "diabetes": Column(pa.Int64, Check.isin([0, 1])),
        "smoking": Column(pa.Int64, Check.isin([0, 1])),
        "previous_cardiac": Column(pa.Int64, Check.isin([0, 1])),
        "admission_frequency": Column(pa.Int64, Check.ge(0)),
        "statin_history": Column(pa.Int64, Check.isin([0, 1])),
        "beta_blocker_history": Column(pa.Int64, Check.isin([0, 1])),
        "ace_arb_history": Column(pa.Int64, Check.isin([0, 1])),
        "aspirin_history": Column(pa.Int64, Check.isin([0, 1])),
        "medication_count": Column(pa.Int64, Check.ge(0)),
        "target": Column(pa.Int64, Check.isin([0, 1]))
    },
    coerce=True,
    strict=False  # Allow extra columns like audit columns
)

def validate_features(df) -> tuple:
    """
    Validates feature dataframe against Pandera schema.
    Returns:
        (validated_df, quarantined_df, report_dict)
    """
    try:
        validated_df = clinical_feature_schema.validate(df, lazy=True)
        return validated_df, df.iloc[0:0], {"status": "success", "errors": []}
    except pa.errors.SchemaErrors as e:
        # Catch validation errors and quarantine failed rows
        failures = e.failure_cases
        failed_indices = failures["index"].unique()
        
        quarantined = df.loc[failed_indices]
        valid = df.drop(index=failed_indices)
        
        report = {
            "status": "partial_success" if len(valid) > 0 else "failure",
            "total_records": len(df),
            "valid_records": len(valid),
            "quarantined_records": len(quarantined),
            "errors": failures.to_dict(orient="records")
        }
        return valid, quarantined, report
