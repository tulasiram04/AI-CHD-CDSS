# Clinician User Instruction Manual: AI-CHD-CDSS

Welcome to the AI-CHD Clinical Decision Support System. This guide instructs medical personnel on how to navigate the terminal, retrieve patient cards, and perform coronary heart disease risk estimations.

---

## 1. Clinician Portal Navigation

Upon logging in, you will be directed to the **Overview Dashboard**:
- **Summary Cards**: Displays active statistics of admitted patient counts, high-risk flags, average CHD risk, and active model versions.
- **Trend Charts**: Visualizes monthly estimation metrics and age distribution metrics.
- **Compliance Log**: Displays recent audited actions.

---

## 2. Searching & Accessing Patient Cards

1. Click on **Patient Registry** in the sidebar.
2. Use the search bar to search by **Subject ID** or **Admission ID**.
3. Use the filter dropdowns to isolate by **Biological Gender** or **CHD Risk Classifications** (High, Moderate, Low).
4. Click on **Clinical Card** on any row to open the detailed patient profile.
5. In the **Patient Record Hub**, view demographic profiles, medication history, active comorbidity flags (hypertension, diabetes), and vitals.

---

## 3. Running Coronary Heart Disease Predictions

To calculate the 10-year risk of coronary heart disease:

### Option A: From Patient Card (Autofill)
1. In the Patient Record Hub, click **Execute CHD Estimation** in the top right corner.
2. The predictor form will open with all current vitals, demographic parameters, and medication history auto-populated.
3. Review parameters and click **Run Risk Inference**.

### Option B: Manual Parameters Entry
1. Click **Clinical Predictor** in the sidebar.
2. Choose **Manual Parameter Entry** in the form header.
3. Fill in patient information (age, blood pressure, cholesterol, glucose, heart rate) and select the corresponding comorbidity flags.
4. Click **Run Risk Inference**.

---

## 4. Reading Results & SHAP Explanations

Once risk estimation is complete, the right-hand panel displays:
- **Calibrated Risk Score (%)**: Adjusted 10-year risk probability.
- **Risk Category Badge**: A prominent red badge for high-risk patients.
- **Confidence Interval**: Probability lower and upper bounds.
- **Clinical Guidelines**: Automatic recommendations based on calculated risk (e.g. statin therapy).
- **Explainability**: Review SHAP contribution charts to identify the main positive and negative risk factors.
