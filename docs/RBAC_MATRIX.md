# Role-Based Access Control (RBAC) Matrix

This document defines the clinical and system feature permissions across the ten distinct user roles of the Coronary Heart Disease Clinical Decision Support System (CHD-CDSS).

| Feature / Module | Super Admin | Doctor | Nurse | Lab Technician | ECG Technician | Radiology Technician | Medical Researcher | Pharmacist | Physiotherapist | Dietitian |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Login**      | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Patient Registry** | ✅ | ✅ | ✅ | Assigned Patients | Assigned Patients | Assigned Patients | De-identified Data | Assigned Patients | Assigned Patients | Assigned Patients |
| **Register New Patient** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Edit Patient Details** | ✅ | ✅ | Limited | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Patient Details** | ✅ | ✅ | ✅ | Assigned Patients | Assigned Patients | Assigned Patients | Limited | Assigned Patients | Assigned Patients | Assigned Patients |
| **Update Vitals (BP, HR, BMI, etc.)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload Lab Results** | ✅ | ✅ | View | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload ECG** | ✅ | ✅ | View | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload Radiology Reports** | ✅ | ✅ | View | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Run CHD Prediction** | ✅ | ✅ | View Only | ❌ | ❌ | ❌ | View Results | ❌ | ❌ | ❌ |
| **View Prediction Results** | ✅ | ✅ | ✅ | View | View | View | ✅ | View | View | View |
| **View SHAP Explainability** | ✅ | ✅ | View | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Clinical Recommendations** | ✅ | ✅ | View | ❌ | ❌ | ❌ | View | View | View | View |
| **Prediction History** | ✅ | ✅ | View | ❌ | ❌ | ❌ | Limited | ❌ | ❌ | ❌ |
| **Generate / Download Reports** | ✅ | ✅ | View | View | View | View | Export | View | View | View |
| **Approve Staff Registration** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Pending Registration Requests** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Doctor Accounts** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Users & Roles** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Hospitals & Departments** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload Training Dataset** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Retrain AI Model** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Deploy / Rollback Model** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Model Registry** | ✅ | View | ❌ | ❌ | ❌ | ❌ | View | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | Own Activity | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Monitoring** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Backup & Restore** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Platform Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
