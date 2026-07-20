"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Stethoscope, Activity, Heart, ShieldCheck, ChevronRight, FileText, 
  CheckCircle2, ArrowRight, UserCheck, Sparkles, AlertCircle, BarChart3,
  Thermometer, LineChart, Pill, Clock
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Header Navigation ------------------------------------------------ */}
      <header className="glass-panel border-b border-slate-200/50 w-full px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/75">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-base text-slate-800 tracking-tight leading-none">AI-CHD-CDSS</h1>
            <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">Clinical Decision Support</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#vitals" className="hover:text-blue-600 transition">Health Indicators</a>
          <a href="#mission" className="hover:text-blue-600 transition">Project Mission</a>
        </nav>

        <Link href="/login">
          <GlassButton variant="primary" size="sm" className="px-5 py-2 font-bold text-xs shadow-md shadow-blue-600/15">
            <span>Clinician Portal</span>
            <ChevronRight className="h-4 w-4" />
          </GlassButton>
        </Link>
      </header>

      <main className="flex-1 space-y-24 py-12">
        
        {/* --- Hero Section ---------------------------------------------------- */}
        <section className="max-w-6xl mx-auto px-6 pt-8 text-center flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200/60 rounded-full text-blue-700 text-xs font-extrabold uppercase tracking-widest shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Cardiovascular Decision Intelligence</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-6 max-w-4xl"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Empowering Physicians with Early <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Heart Disease Risk Intelligence
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
              AI-CHD-CDSS assists doctors and cardiologists by analyzing vital telemetry, lab chemistry, 
              and medical history to deliver evidence-based Coronary Heart Disease risk assessments in real-time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Link href="/login">
              <GlassButton variant="primary" size="lg" className="px-8 py-4 font-extrabold text-sm shadow-xl shadow-blue-600/20">
                <span>Enter Clinician Portal</span>
                <ArrowRight className="h-5 w-5" />
              </GlassButton>
            </Link>
            <a href="#how-it-works">
              <GlassButton variant="secondary" size="lg" className="px-7 py-4 font-bold text-sm text-slate-700">
                <span>Learn How It Works</span>
              </GlassButton>
            </a>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-slate-200/60 mt-4"
          >
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <span className="text-2xl font-black text-blue-600 block">10-Year</span>
              <span className="text-xs font-bold text-slate-500">CHD Risk Estimation</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <span className="text-2xl font-black text-emerald-600 block">Instant</span>
              <span className="text-xs font-bold text-slate-500">Real-Time Analysis</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <span className="text-2xl font-black text-indigo-600 block">Clear XAI</span>
              <span className="text-xs font-bold text-slate-500">Risk vs Protective Factors</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <span className="text-2xl font-black text-amber-600 block">Hospital PDF</span>
              <span className="text-xs font-bold text-slate-500">Clinical Report Export</span>
            </div>
          </motion.div>
        </section>

        {/* --- Core Project Capabilities Section -------------------------------- */}
        <section id="features" className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">System Capabilities</span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Everything Doctors Need for Heart Risk Evaluation</h3>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Designed for speed, clarity, and clinical confidence during routine consultations and emergency care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <GlassCard hoverLift className="p-6 space-y-4 bg-white/80 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Heart className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Early Risk Assessment</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Calculates 10-year heart disease risk by combining patient age, blood pressure, glucose, cholesterol, and comorbidity history.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider pt-4 block border-t border-slate-100">
                5 Risk Categories
              </span>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard hoverLift className="p-6 space-y-4 bg-white/80 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Clear Clinical Explanations</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Separates risk drivers from protective health factors so physicians clearly understand what requires medical attention.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider pt-4 block border-t border-slate-100">
                Risk vs Protective Factors
              </span>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard hoverLift className="p-6 space-y-4 bg-white/80 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Pill className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Evidence-Based Guidance</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Generates personalized lifestyle interventions, blood pressure targets, lipid management, and consultation timelines.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider pt-4 block border-t border-slate-100">
                Guideline-Backed Advice
              </span>
            </GlassCard>

            {/* Feature 4 */}
            <GlassCard hoverLift className="p-6 space-y-4 bg-white/80 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Hospital PDF Reports</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Exports multi-section clinical PDF documents complete with telemetry comparisons, patient charts, and clinician signatures.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider pt-4 block border-t border-slate-100">
                Instant PDF Download
              </span>
            </GlassCard>
          </div>
        </section>

        {/* --- How It Works Section --------------------------------------------- */}
        <section id="how-it-works" className="bg-gradient-to-b from-blue-50/50 to-white py-16 border-y border-blue-100/50">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Simple Workflow</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">How AI-CHD-CDSS Works in Practice</h3>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Three clear steps to evaluate heart disease risk during patient appointments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4 relative">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  01
                </div>
                <h4 className="text-lg font-bold text-slate-900">Enter Patient Telemetry</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Record age, blood pressure, fasting glucose, serum cholesterol, BMI, and documented medical conditions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4 relative">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                  02
                </div>
                <h4 className="text-lg font-bold text-slate-900">Instant Risk Computation</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The system analyzes health indicators to estimate 10-year risk probability and evaluate normal vs abnormal vitals.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4 relative">
                <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  03
                </div>
                <h4 className="text-lg font-bold text-slate-900">Review Care Plan & Export</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Inspect clinical interpretations, risk drivers, protective parameters, and download hospital-ready PDF reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Health Parameters Monitored -------------------------------------- */}
        <section id="vitals" className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Clinical Standards</span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Key Health Indicators Evaluated</h3>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Parameters compared against established medical reference ranges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Blood Pressure</h5>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">&lt; 120/80 mmHg</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Evaluates systolic and diastolic pressure levels to identify hypertension stages.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Fasting Glucose</h5>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">70 – 140 mg/dL</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Monitors glycemic control to account for diabetes mellitus risk impact.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Serum Cholesterol</h5>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">&lt; 200 mg/dL</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Assesses total lipid levels for hypercholesterolemia risk stratification.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Body Mass Index (BMI)</h5>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">18.5 – 24.9 kg/m²</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Measures weight-to-height ratio to assess obesity workload on cardiac tissue.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Resting Heart Rate</h5>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">60 – 100 bpm</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Checks resting cardiac pulse for bradycardia or tachycardia tendencies.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-sm text-slate-800">Comorbidity Load</h5>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Medical History</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Tracks smoking history, prior cardiac events, and ICU admission records.</p>
            </div>
          </div>
        </section>

        {/* --- Project Mission Section ----------------------------------------- */}
        <section id="mission" className="max-w-6xl mx-auto px-6">
          <div className="p-8 md:p-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-widest block">Project Mission</span>
              <h3 className="text-3xl font-black tracking-tight leading-tight">Improving Cardiac Outcomes Through Early Detection</h3>
              <p className="text-sm text-blue-100 font-medium leading-relaxed">
                Coronary Heart Disease remains one of the leading health challenges worldwide. AI-CHD-CDSS acts as a decision co-pilot for healthcare professionals, converting patient vitals and laboratory numbers into clear clinical insights so doctors can intervene early and save lives.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 relative z-10">
              <Link href="/login">
                <GlassButton variant="primary" size="md" className="px-6 py-3 font-extrabold text-xs">
                  <span>Open Portal</span>
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </Link>
              <Link href="/about">
                <GlassButton variant="secondary" size="md" className="px-6 py-3 font-bold text-xs text-slate-900 bg-white/90">
                  <span>Read System Specs</span>
                </GlassButton>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* --- Footer ----------------------------------------------------------- */}
      <footer className="w-full bg-white border-t border-slate-200/60 py-10 px-6 md:px-12 space-y-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">AI-CHD-CDSS</h4>
              <span className="text-[9px] font-bold text-slate-400">Clinical Decision Support System</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <Link href="/login" className="hover:text-blue-600 transition">Clinician Portal</Link>
            <Link href="/predict" className="hover:text-blue-600 transition">Prediction Engine</Link>
            <Link href="/reports" className="hover:text-blue-600 transition">Reports</Link>
            <Link href="/about" className="hover:text-blue-600 transition">About System</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-medium text-center sm:text-left">
          <p>© 2026 AI-CHD-CDSS. Coronary Heart Disease Clinical Decision Support System.</p>
          <p className="max-w-md">
            Disclaimer: Designed as a decision support tool for authorized clinicians. Clinical diagnostic decisions rest with the attending physician.
          </p>
        </div>
      </footer>
    </div>
  );
}
