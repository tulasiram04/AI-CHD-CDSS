"use client";

import React from "react";
import {
  Brain,
  Cpu,
  Database,
  Award,
  Info,
  Terminal,
  GitCommit,
  Settings,
  Layers,
  Calendar,
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Activity,
  ArrowRight,
  Server,
  HardDrive,
  UserCheck,
  ShieldAlert,
  BarChart3,
  Stethoscope,
  Sliders,
  RefreshCw,
  Zap,
  Eye,
  ChevronRight,
  Key,
  Shield,
  FileSpreadsheet,
  Check
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassBadge from "@/components/ui/GlassBadge";

export default function AboutPage() {
  // 1. End-to-End Machine Learning & System Workflow
  const pipelineSteps = [
    {
      step: "01",
      title: "Clinical Data Collection",
      desc: "Aggregates anonymized ICU patient cohorts from MIMIC-IV clinical databases and real-time clinician entries, collecting demographics, telemetry vitals, metabolic lab values, and diagnostic ICD codes.",
      icon: Database,
      badge: "MIMIC-IV ETL",
    },
    {
      step: "02",
      title: "Input Validation & Schema Check",
      desc: "Enforces strict physiological range boundaries and schema completeness using Pydantic v2 schemas and FastAPI dependency injection before processing downstream vectors.",
      icon: ShieldCheck,
      badge: "Pydantic V2",
    },
    {
      step: "03",
      title: "Data Preprocessing & Imputation",
      desc: "Applies median imputation for missing physiological vitals and mode imputation for categorical fields, scaling continuous variables via StandardScaler in preprocess_pipeline.joblib.",
      icon: Layers,
      badge: "Scikit-Learn",
    },
    {
      step: "04",
      title: "Feature Engineering",
      desc: "Dynamically constructs age grouping indicators, comorbidity burden metrics (summing hypertension, diabetes, smoking, and prior cardiac events), and explicit missingness indicators.",
      icon: Sliders,
      badge: "Feature Store",
    },
    {
      step: "05",
      title: "CatBoost Predictive Inference",
      desc: "Passes preprocessed feature vectors through trained CatBoost gradient boosted decision trees to evaluate complex non-linear clinical risk relationships.",
      icon: Cpu,
      badge: "CatBoost ML",
    },
    {
      step: "06",
      title: "Probability Calibration (Isotonic)",
      desc: "Transforms raw machine learning outputs using Isotonic Regression calibrators (CatBoost_calibrator.joblib) to ensure predicted probabilities match true clinical risk proportions.",
      icon: Award,
      badge: "Isotonic Mapping",
    },
    {
      step: "07",
      title: "Explainable AI (SHAP Attribution)",
      desc: "Deconstructs individual predictions using SHapley Additive exPlanations (SHAP) TreeExplainer values, revealing exact positive and negative factor weights for clinician auditability.",
      icon: Brain,
      badge: "SHAP XAI",
    },
    {
      step: "08",
      title: "ACC/AHA Risk Stratification",
      desc: "Stratifies calibrated probabilities into clinical risk tiers: Low Risk (< 5%), Borderline Risk (5%–7.4%), Moderate Risk (7.5%–19.9%), and High Risk (≥ 20%).",
      icon: Activity,
      badge: "ACC/AHA Tiers",
    },
    {
      step: "09",
      title: "Guideline Recommendation & PDF Report",
      desc: "Triggers evidence-based medication rules (statin, low-dose aspirin, ACE/ARB optimization) and renders downloadable, audit-ready clinical PDF reports.",
      icon: FileText,
      badge: "jsPDF Engine",
    },
  ];

  // 2. Clinical Objectives
  const objectives = [
    {
      title: "Early CHD Risk Detection",
      desc: "Identify high-risk cardiovascular patients during ICU admission before acute adverse cardiac events occur.",
      icon: Zap,
    },
    {
      title: "Clinical Decision Support",
      desc: "Provide evidence-based medication (statin/aspirin) and lifestyle recommendations aligned with ACC/AHA guidelines.",
      icon: Stethoscope,
    },
    {
      title: "Explainable AI Predictions",
      desc: "Render transparent SHAP factor contribution breakdowns so clinicians understand exact risk drivers for each patient.",
      icon: Brain,
    },
    {
      title: "Secure Patient Management",
      desc: "Maintain strict role-based access control (RBAC) ensuring patient data privacy and HIPAA-compliant scoping.",
      icon: Lock,
    },
    {
      title: "Longitudinal Audit History",
      desc: "Store immutable prediction logs of all past estimation runs for longitudinal patient tracking and auditability.",
      icon: Calendar,
    },
    {
      title: "Standardized PDF Reports",
      desc: "Generate professional clinical summary reports for seamless patient chart integration and specialist referrals.",
      icon: FileText,
    },
    {
      title: "Improved Diagnostic Workflow",
      desc: "Streamline ICU risk assessment workflows by eliminating manual risk score calculation overhead.",
      icon: RefreshCw,
    },
    {
      title: "Reliable Calibration Diagnostics",
      desc: "Eliminate overconfident ML predictions through isotonic probability calibration for critical care safety.",
      icon: Award,
    },
  ];

  // 3. System Features
  const systemFeatures = [
    "AI-powered CHD Risk Prediction",
    "Explainable AI (SHAP Factor Attribution)",
    "Secure JWT Authentication",
    "Patient Registry Management",
    "Immutable Prediction Audit History",
    "Downloadable PDF Clinical Reports",
    "Responsive Glassmorphism Dashboard",
    "Role-Based Access Control (RBAC)",
    "Clinical Data Validation & Bound Checks",
    "PostgreSQL Relational Storage",
    "Sub-100ms Inference Latency",
    "Secure RESTful API Infrastructure",
  ];

  // 4. Model Evaluation Metrics
  const modelMetrics = [
    { model: "CatBoost (Selected)", accuracy: "75.9%", precision: "50.0%", recall: "28.6%", f1: "36.4%", rocAuc: "71.8%", brier: "0.1899", status: "Production" },
    { model: "XGBoost", accuracy: "65.5%", precision: "33.3%", recall: "42.9%", f1: "37.5%", rocAuc: "76.3%", brier: "0.2159", status: "Evaluated" },
    { model: "Logistic Regression", accuracy: "69.0%", precision: "37.5%", recall: "42.9%", f1: "40.0%", rocAuc: "73.7%", brier: "0.1902", status: "Evaluated" },
    { model: "LightGBM", accuracy: "69.0%", precision: "33.3%", recall: "28.6%", f1: "30.8%", rocAuc: "74.7%", brier: "0.2153", status: "Evaluated" },
    { model: "Random Forest", accuracy: "65.5%", precision: "36.4%", recall: "57.1%", f1: "44.4%", rocAuc: "72.1%", brier: "0.2211", status: "Evaluated" },
  ];

  // 5. Security & Privacy
  const securityItems = [
    {
      title: "JWT Authentication",
      desc: "Secure token-based session handling with OAuth2 Bearer standards and configurable expiration tokens.",
      icon: Key,
    },
    {
      title: "Bcrypt Password Hashing",
      desc: "Cryptographic user credential protection utilizing salted Bcrypt hashing via Passlib.",
      icon: Lock,
    },
    {
      title: "Role-Based Access Control (RBAC)",
      desc: "Granular permission scoping across 8 clinical roles (Admin, Doctor, Nurse, Techs, Researcher).",
      icon: UserCheck,
    },
    {
      title: "Secure REST APIs",
      desc: "Enforced HTTPS encryption, strict CORS origin whitelisting, and structured error boundaries.",
      icon: Server,
    },
    {
      title: "Input Bound Validation",
      desc: "Comprehensive numerical and range validation on physiological parameters using Pydantic schemas.",
      icon: ShieldCheck,
    },
    {
      title: "SQL Injection Protection",
      desc: "Parameterized queries executed exclusively through SQLAlchemy ORM abstraction layer.",
      icon: HardDrive,
    },
    {
      title: "HTTPS Deployment",
      desc: "End-to-end SSL/TLS transport encryption enforced across cloud server endpoints on Render.",
      icon: Shield,
    },
    {
      title: "Audit Trail Logging",
      desc: "Immutable recording of inference execution latency, user IP, user-agent, and memory utilization.",
      icon: FileSpreadsheet,
    },
    {
      title: "De-Identified Research Scoping",
      desc: "Automatic UUID anonymization and chart restriction when accessed under Medical Researcher accounts.",
      icon: Eye,
    },
  ];

  // 6. Clinical Workflow Steps
  const workflowSteps = [
    { title: "Patient Registration", desc: "ICU patient chart created in registry" },
    { title: "Data Entry & Import", desc: "Vitals, labs, and comorbidities logged" },
    { title: "Boundary Validation", desc: "Pydantic schema bounds verified" },
    { title: "Feature Preprocessing", desc: "Missingness imputed & features scaled" },
    { title: "CatBoost Inference", desc: "Machine learning probability computed" },
    { title: "Isotonic Calibration", desc: "Raw probability calibrated to 10-yr risk" },
    { title: "SHAP Explainability", desc: "Feature impact contributions computed" },
    { title: "Recommendation Engine", desc: "ACC/AHA medication guidance triggered" },
    { title: "Audit Log & PDF Export", desc: "Prediction saved and chart PDF generated" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0F2573] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-900/40">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <GlassBadge variant="primary" className="bg-white/10 text-blue-200 border-white/20">
              System Architecture & Documentation
            </GlassBadge>
            <span className="text-xs font-mono text-blue-200/80">v1.0.0 (Production)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            AI-CHD-CDSS <span className="text-blue-300 font-medium text-lg sm:text-xl">| Clinical Decision Support System</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
            An enterprise-grade, machine learning-driven clinical decision support platform designed to assist healthcare professionals with calibrated 10-year Coronary Heart Disease (CHD) risk prediction, explainable AI diagnostics, and evidence-based clinical recommendations.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5 text-right font-mono text-xs text-blue-200/90 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM ACTIVE</span>
          </div>
          <span>Model: CatBoost Staging v1</span>
          <span>Calibrator: Isotonic</span>
        </div>
      </div>

      {/* Main Grid: Overview & Version Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Overview (2 Cols) */}
        <GlassCard className="lg:col-span-2 p-6 sm:p-8 space-y-4 bg-white/80">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
            <div className="p-2 rounded-xl bg-blue-500/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">System Overview</h3>
              <p className="text-[11px] text-slate-400 font-medium">Core platform objectives and diagnostic methodology</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 font-semibold leading-relaxed">
            <p>
              The <strong>AI-CHD Clinical Decision Support System (AI-CHD-CDSS)</strong> is an artificial intelligence platform built to predict the 10-year probability of Coronary Heart Disease (CHD) adverse events in Intensive Care Unit (ICU) patients. Developed for clinical decision assistance, the system integrates advanced machine learning models with clinical data processing to support cardiologists, critical care physicians, and medical teams.
            </p>
            <p>
              The platform analyzes multidimensional clinical indicators including patient demographics (age, biological gender), physiological vitals (systolic & diastolic blood pressure, heart rate, BMI), metabolic lab results (fasting glucose, serum cholesterol), and active comorbidity history (hypertension, Type-2 diabetes, active smoking, and prior cardiac events).
            </p>
            <p>
              To ensure diagnostic transparency and clinical reliability, AI-CHD-CDSS incorporates <strong>Isotonic Probability Calibration</strong> to map raw ML probabilities into true clinical risk percentages, alongside <strong>SHapley Additive exPlanations (SHAP)</strong> for Explainable AI (XAI). Clinicians receive feature contribution breakdowns, guideline-driven treatment recommendations (e.g., statin or low-dose aspirin initiation), longitudinal audit history, and standardized PDF report generation.
            </p>
          </div>
        </GlassCard>

        {/* System & Version Metadata Card (1 Col) */}
        <GlassCard className="p-6 sm:p-8 space-y-4 bg-white/80">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">System Specifications</h3>
              <p className="text-[11px] text-slate-400 font-medium">Verified technical & model metadata</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-bold divide-y divide-slate-100">
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">System Version</span>
              <span className="text-slate-800 font-mono">v1.0.0 (Production)</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">ML Model Name</span>
              <span className="text-slate-800 font-mono">CatBoost Classifier</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Calibration Method</span>
              <span className="text-slate-800 font-mono">Isotonic Regression</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Explainability (XAI)</span>
              <span className="text-slate-800 font-mono">SHAP TreeExplainer</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Frontend Framework</span>
              <span className="text-slate-800 font-mono">Next.js 16 (React 19)</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Backend Framework</span>
              <span className="text-slate-800 font-mono">FastAPI (Python 3.12)</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Database Layer</span>
              <span className="text-slate-800 font-mono">PostgreSQL / SQLAlchemy</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Deployment Platform</span>
              <span className="text-slate-800 font-mono">Render Cloud Services</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400 font-medium">Authentication</span>
              <span className="text-slate-800 font-mono">JWT (OAuth2 Bearer)</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* End-to-End Machine Learning Pipeline */}
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-primary">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">End-to-End Machine Learning Pipeline</h3>
              <p className="text-[11px] text-slate-400 font-medium">Complete data flow from clinical ingestion to calibrated recommendation</p>
            </div>
          </div>
          <GlassBadge variant="primary" className="font-mono text-[10px]">9 Pipeline Stages</GlassBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-primary font-mono bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                    STAGE {step.step}
                  </span>
                  <GlassBadge variant="neutral" className="text-[9px] font-mono">
                    {step.badge}
                  </GlassBadge>
                </div>
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-slate-700 shrink-0" />
                  <h4 className="text-xs font-extrabold text-slate-800">{step.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Clinical Workflow Diagram */}
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/80">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clinical Care Workflow</h3>
            <p className="text-[11px] text-slate-400 font-medium">Step-by-step patient evaluation sequence executed in the portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 items-center text-center">
          {workflowSteps.map((wf, idx) => (
            <React.Fragment key={idx}>
              <div className="p-3 bg-white border border-slate-200/70 rounded-2xl shadow-sm space-y-1 hover:border-emerald-300 transition">
                <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  STEP 0{idx + 1}
                </span>
                <h5 className="text-[11px] font-extrabold text-slate-800 leading-tight">{wf.title}</h5>
                <p className="text-[9px] text-slate-400 font-medium leading-tight">{wf.desc}</p>
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:flex justify-center text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* Technology Stack Categorized */}
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/80">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/60">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Categorized Technology Stack</h3>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise libraries, frameworks, and infrastructure software</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          {/* Frontend */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 text-indigo-700 font-extrabold">
              <LaptopIcon className="h-4 w-4" />
              <span>Frontend</span>
            </div>
            <div className="space-y-1.5 font-bold text-slate-700">
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Next.js 16 (App Router)</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> React 19</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> TypeScript 5.x</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Tailwind CSS v4</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Framer Motion</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> TanStack Query v5</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> jsPDF Engine</p>
            </div>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 text-blue-700 font-extrabold">
              <Server className="h-4 w-4" />
              <span>Backend</span>
            </div>
            <div className="space-y-1.5 font-bold text-slate-700">
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> FastAPI Framework</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Python 3.12</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Uvicorn ASGI Server</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Pydantic v2 Schemas</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Pytest Framework</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Psutil Monitoring</p>
            </div>
          </div>

          {/* Machine Learning */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 text-emerald-700 font-extrabold">
              <Brain className="h-4 w-4" />
              <span>Machine Learning</span>
            </div>
            <div className="space-y-1.5 font-bold text-slate-700">
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> CatBoost Classifier</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> XGBoost / LightGBM</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Scikit-learn Pipelines</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Isotonic Calibrators</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> SHAP TreeExplainer</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Joblib Model Serialization</p>
            </div>
          </div>

          {/* Database & ORM */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 text-amber-700 font-extrabold">
              <Database className="h-4 w-4" />
              <span>Database & ORM</span>
            </div>
            <div className="space-y-1.5 font-bold text-slate-700">
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> PostgreSQL Database</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> SQLAlchemy 2.0 ORM</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Alembic Migration Scripts</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> SQLite Development Sync</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Relational Audit Tables</p>
            </div>
          </div>

          {/* Security & Cloud */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 text-rose-700 font-extrabold">
              <ShieldCheck className="h-4 w-4" />
              <span>Security & Cloud</span>
            </div>
            <div className="space-y-1.5 font-bold text-slate-700">
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> JWT Bearer Tokens</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Passlib Bcrypt Hashing</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Render Web Services</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Docker Containers</p>
              <p className="bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> HTTPS / TLS SSL</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Model Performance Comparison Table */}
      <GlassCard className="p-6 sm:p-8 space-y-4 bg-white/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Model Evaluation & Benchmark Performance</h3>
              <p className="text-[11px] text-slate-400 font-medium">Empirical test set evaluation metrics on MIMIC-IV cohort validation split</p>
            </div>
          </div>
          <GlassBadge variant="success" className="text-[10px]">Empirical Test Benchmark</GlassBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-100/50 text-slate-500 uppercase text-[9px] tracking-wider font-extrabold select-none">
                <th className="py-3 px-4">Classifier Architecture</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Brier Score</th>
                <th className="py-3 px-4 text-right">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100">
              {modelMetrics.map((m, idx) => (
                <tr key={idx} className={`hover:bg-slate-50/80 transition ${m.status === "Production" ? "bg-blue-50/30 font-bold text-slate-900" : ""}`}>
                  <td className="py-3.5 px-4 flex items-center gap-2 font-extrabold text-slate-800">
                    {m.status === "Production" && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
                    {m.model}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{m.accuracy}</td>
                  <td className="py-3.5 px-4 font-mono">{m.precision}</td>
                  <td className="py-3.5 px-4 font-mono">{m.recall}</td>
                  <td className="py-3.5 px-4 font-mono">{m.f1}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-primary">{m.rocAuc}</td>
                  <td className="py-3.5 px-4 font-mono">{m.brier}</td>
                  <td className="py-3.5 px-4 text-right">
                    <GlassBadge variant={m.status === "Production" ? "primary" : "neutral"} className="text-[10px]">
                      {m.status}
                    </GlassBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
          * Note: Performance metrics evaluated on 10-year calibrated risk cohort datasets with isotonic calibrator transformation.
        </p>
      </GlassCard>

      {/* Grid: Objectives & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Objectives (1 Col) */}
        <GlassCard className="p-6 sm:p-8 space-y-4 bg-white/80">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
            <div className="p-2 rounded-xl bg-blue-500/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clinical System Objectives</h3>
              <p className="text-[11px] text-slate-400 font-medium">Target goals in healthcare delivery and decision support</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {objectives.map((obj, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50/70 border border-slate-200/50 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold">
                  <obj.icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{obj.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  {obj.desc}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Features (1 Col) */}
        <GlassCard className="p-6 sm:p-8 space-y-4 bg-white/80">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Implemented System Features</h3>
              <p className="text-[11px] text-slate-400 font-medium">Core production capabilities available in the application</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-extrabold text-slate-700">
            {systemFeatures.map((feat, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center gap-2.5 shadow-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Security & Privacy Section */}
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/80">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/60">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Security, Privacy & Compliance Architecture</h3>
            <p className="text-[11px] text-slate-400 font-medium">Data protection controls, authorization matrices, and audit standards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {securityItems.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                  <sec.icon className="h-4 w-4" />
                </div>
                <span>{sec.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Footer Branding */}
      <div className="pt-4 text-center text-xs text-slate-400 font-medium space-y-1">
        <p className="font-extrabold text-slate-600">AI-CHD-CDSS — AI-Powered Coronary Heart Disease Clinical Decision Support System</p>
        <p className="text-[10px]">Designed and implemented for clinical decision support, risk stratification, and MLOps auditability.</p>
      </div>
    </div>
  );
}

// Helper icon component for Frontend category
function LaptopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.34 20H3.66a1 1 0 0 1-.94-1.45L4 16" />
    </svg>
  );
}
