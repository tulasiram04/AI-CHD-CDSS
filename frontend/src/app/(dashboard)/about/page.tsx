"use client";

import React from "react";
import { Brain, Cpu, Database, Award, Info, Terminal, GitCommit, Settings, Layers, Calendar } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassBadge from "@/components/ui/GlassBadge";

export default function AboutPage() {
  const steps = [
    {
      title: "Data Ingestion (ETL)",
      desc: "Anonymized demographic records, physiological vitals, and lab records are ingested from the MIMIC-IV clinical databases.",
      icon: Database,
    },
    {
      title: "Preprocessing Pipeline",
      desc: "Calculates comorbidity burden, creates age/BP indicator flags, imputes missing values, and aligns columns using preprocess_pipeline.joblib.",
      icon: Layers,
    },
    {
      title: "Predictive Inference",
      desc: "Staging CatBoost machine learning model calculates raw prediction probabilities based on demographic features and clinical proxies.",
      icon: Cpu,
    },
    {
      title: "Calibration Diagnostics",
      desc: "Applies Isotonic/Calibrator mapping (CatBoost_calibrator.joblib) to output calibrated probabilities suitable for critical care thresholds.",
      icon: Award,
    },
    {
      title: "Explainable XAI (SHAP)",
      desc: "Deconstructs model risk weights using SHAP factor contributions to explain individual feature impact for clinician review.",
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Information</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Detailed overview of the machine learning pipeline, clinical workflow logic, and architectural specifications.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Product summary card */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Project Introduction</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The **AI-CHD-CDSS** is a high-fidelity Clinical Decision Support System designed to predict the 10-year calibrated risk of Coronary Heart Disease (CHD) for patients admitted to the ICU. 
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The system assists clinical teams with diagnostic validations, model performance auditing, and drug initiation recommendations by combining raw vitals with ML pipelines.
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-[10px] text-slate-400 font-bold">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-slate-600">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Staging Model:</span>
                <span className="text-slate-600">CatBoost-Staging-v2</span>
              </div>
              <div className="flex justify-between">
                <span>Database Status:</span>
                <span className="text-slate-600">PostgreSQL / SQLite Sync</span>
              </div>
            </div>
          </GlassCard>

          {/* Tech stack */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Terminal className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Technology Stack</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <GlassBadge variant="primary">Next.js 16 App Router</GlassBadge>
              <GlassBadge variant="primary">React 19</GlassBadge>
              <GlassBadge variant="primary">TypeScript</GlassBadge>
              <GlassBadge variant="primary">Tailwind CSS v4</GlassBadge>
              <GlassBadge variant="primary">Framer Motion</GlassBadge>
              <GlassBadge variant="primary">TanStack Query</GlassBadge>
              <GlassBadge variant="primary">FastAPI Backend</GlassBadge>
              <GlassBadge variant="primary">MLflow Registry</GlassBadge>
              <GlassBadge variant="primary">CatBoost Classifier</GlassBadge>
            </div>
          </GlassCard>
        </div>

        {/* Center/Right: Pipeline info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Pipeline */}
          <GlassCard className="p-6 space-y-6 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <GitCommit className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Machine Learning Pipeline</h3>
            </div>

            {/* Steps timeline visual */}
            <div className="relative pl-6 border-l border-slate-200 space-y-6 text-xs font-bold">
              {steps.map((s, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Node Badge */}
                  <span className="absolute -left-[32px] top-0.5 h-6 w-6 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                    <s.icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="space-y-1">
                    <h4 className="text-slate-800 font-extrabold">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Objectives, Advantages, Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectives */}
            <GlassCard className="p-6 space-y-3 bg-white/70 text-xs">
              <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider pb-1 border-b border-slate-100">
                Project Objectives
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-500 font-semibold leading-relaxed">
                <li>Automate Coronary Heart Disease screening in critical care ICU units.</li>
                <li>Ensure high diagnostic safety through probability calibration.</li>
                <li>Provide explainable XAI (SHAP) validation for every prediction run.</li>
              </ul>
            </GlassCard>

            {/* Limitations */}
            <GlassCard className="p-6 space-y-3 bg-white/70 text-xs">
              <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider pb-1 border-b border-slate-100">
                Advantages & Limitations
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-500 font-semibold leading-relaxed">
                <li><span className="text-emerald-600 font-bold">Advantage</span>: Live MLflow integration tracks deployed model versions.</li>
                <li><span className="text-emerald-600 font-bold">Advantage</span>: Instant HIPAA audit compliance trails.</li>
                <li><span className="text-rose-500 font-bold">Limitation</span>: System must not replace doctor's independent diagnosis.</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="pt-6 border-t border-slate-200/50 text-center text-[10px] text-slate-400 font-medium">
        <p>© 2026 AI-CHD CDSS Doctor Portal. Deployed for research validation purposes.</p>
      </div>
    </div>
  );
}
