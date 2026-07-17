# Design & Feature Architecture Proposals: AI-CHD Prediction Platform

This document outlines three distinct frontend design and feature paradigms for the clinical project: **"Predicting Coronary Heart Disease using Machine Learning Approach"**.

---

## Option 1: The "Clinical Integration Hub" (Enterprise EHR Style)

Designed to look like software used in modern medical centers (Epic Systems, Cerner, Fortis, Apollo). It focuses on high information density, clinical workflow integration, and patient chart retrieval.

```
+---------------------------------------------------------------------------------+
|  [Stethoscope Icon] AI-CHD CDSS Hub                 User: Dr. John (Cardiology) |
+---------------------------------------------------------------------------------+
|  [ Overview ]  [ Patient Cohort Registry ]  [ Predictor ]  [ Audits ]  [ Settings ] |
+---------------------------------------------------------------------------------+
|  Patient Record Card: Subject #104245 (Admission #210405)                       |
|  +---------------------------------------+ +----------------------------------+ |
|  | Demographic Summary                   | | Calculated 10-Yr CHD Risk        | |
|  | Age: 65 yrs      Gender: Male         | |   [ 28.4% ]   HIGH RISK          | |
|  | BMI: 28.4        Medication Count: 4  | |   Confidence: [22.1% - 34.7%]    | |
|  +---------------------------------------+ +----------------------------------+ |
|  | Laboratory Telemetry Logs             | | Clinical Recommendations         | |
|  | - BP: 142/88 mmHg  - Glucose: 98 mg/dL| | 1. Initiate high-intensity statin| |
|  | - HR: 74 bpm       - Chol: 185 mg/dL  | | 2. Clinical follow-up in 2 weeks | |
|  +---------------------------------------+ +----------------------------------+ |
+---------------------------------------------------------------------------------+
```

### Core Features
- **Longitudinal Patient Cards**: Tabbed interface separating Vitals, Lab histories, Active Comorbidity flags (Hypertension, Diabetes), and Medication logs.
- **Cardiovascular Timeline**: Charts plotting blood pressure, cholesterol, and glucose trends over past admissions.
- **Clinical Report Export**: A single-click "Generate Medical Report" button producing printable, HIPAA-compliant PDFs.

### Pros & Cons
- **Pros**: Fits naturally into clinician workflows; highly trustworthy; clean and professional.
- **Cons**: Less emphasis on raw MLOps statistics.

---

## Option 2: The "MLOps Researcher Console" (Academic & Validation Style)

Designed for data scientists and research investigators. It prioritizes model performance metrics, calibration curves, and feature contribution plots.

```
+---------------------------------------------------------------------------------+
|  [Model Icon] CHD-ML MLOps Console                    Run status: ACTIVE (v2.0) |
+---------------------------------------------------------------------------------+
|  +-------------------------------------+ +------------------------------------+ |
|  | Global Feature Importance (SHAP)    | | Probability Calibration Curves     | |
|  | 1. Age (SHAP: +0.082)               | |   1.0 |    / [Isotonic]            | |
|  | 2. Systolic BP (SHAP: +0.045)       | |   0.5 |   /                        | |
|  | 3. Prev Cardiac (SHAP: +0.038)      | |   0.0 |  /  [Uncalibrated]         | |
|  | 4. Statin History (SHAP: -0.012)    | |       +------------------          | |
|  +-------------------------------------+ +------------------------------------+ |
|  | Model Governance & Approval Trails  | | Subgroup Fairness Parity Check     | |
|  | - XGBoost v2.0 ROC-AUC: 0.763       | | - Male Parity: 0.95                | |
|  | - Staged comments approval logs     | | - Female Parity: 0.94              | |
|  +-------------------------------------+ +------------------------------------+ |
+---------------------------------------------------------------------------------+
```

### Core Features
- **Live Performance Monitoring**: Interactive ROC/PR curves and Platt vs. Isotonic calibration comparisons.
- **Explainability Suite**: Interactive SHAP force plots and waterfall graphs displaying exact feature contributions for each assessment.
- **Fairness Dashboards**: Metric charts representing equalized odds, demographic parity, and calibration parity across patient subgroups.

### Pros & Cons
- **Pros**: Outstanding validation tooling; ideal for scientific publications and audits.
- **Cons**: Might feel overly complex or clinical-unfriendly to doctors.

---

## Option 3: The "Interactive Decision Support Terminal" (Next-Gen AI Assistant)

A modern, responsive, minimalist layout utilizing micro-animations. Focuses on interactive parameters tuning and prompt-based diagnostics.

```
+---------------------------------------------------------------------------------+
|  [Brain Icon] Interactive CHD Predictor                               [Settings]|
+---------------------------------------------------------------------------------+
|  Patient Parameter Tuning                  Risk Estimate Output & Explanations  |
|  Age: 62 yrs  [==========O===]             +----------------------------------+ |
|  Systolic BP: 135 mmHg                     |       [ 18.2% ]  MODERATE RISK   | |
|  [=======O=======]                         |                                  | |
|  Glucose: 95 mg/dL                         | Age is the primary risk driver.  | |
|  [====O==========]                         | Statin history acts protective.  | |
|                                            +----------------------------------+ |
|  Comorbidities:                            | Clinical Justification:          | |
|  [x] Hypertension  [ ] Diabetes            | "Risk elevated due to combined   | |
|  [x] Smoker        [ ] Prev Cardiac        | hypertension and age factors."   | |
+---------------------------------------------------------------------------------+
```

### Core Features
- **Interactive Parameter Tuning**: Slider controls for numerical features (Age, Blood Pressure, BMI) allowing clinicians to immediately observe how risk scores adjust in real time.
- **Interactive Guidelines**: Justification bubbles linking risk levels to specific ACC/AHA guidelines.
- **Natural Language Reports**: Generates a clean narrative summary explaining the prediction, e.g. *"Subject is a 62-year-old male with mild hypertension..."*

### Pros & Cons
- **Pros**: Extremely engaging; great for simulation, training, and rapid diagnostics.
- **Cons**: Requires solid input controls to prevent validation errors.

---

## Technical Feasibility & Comparison

| Criterion | Option 1: Clinical Hub | Option 2: MLOps Console | Option 3: Next-Gen AI |
| :--- | :--- | :--- | :--- |
| **Primary Audience** | Hospital Physicians | ML Engineers / Regulators | Residents / Simulated Training |
| **Visual Styling** | Flat, Slate-Blue (Epic) | Dashboard (Dark theme) | Minimalist (Modern UI) |
| **Complexity** | Moderate | High | High |
| **Dependencies** | Next.js, Axios, Tailwind | Recharts, SHAP parser | Framer Motion, Sliders |
| **Performance** | High (Server-cached) | Moderate (Heavy charts) | High (Client-state driven) |
