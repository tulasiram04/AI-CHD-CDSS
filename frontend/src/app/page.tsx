"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Stethoscope, Activity, Brain, ShieldAlert, ChevronRight, FileText } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header Navigation */}
      <header className="glass-panel border-b border-slate-200/40 w-full px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="font-black text-sm text-slate-800 tracking-tight leading-none">AI-CHD-CDSS</h1>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Clinical Decision Support</span>
          </div>
        </div>

        <Link href="/login">
          <GlassButton variant="primary" size="sm">
            <span>Clinician Portal</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </GlassButton>
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center gap-12 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/50 rounded-full text-blue-600 text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            <Activity className="h-3.5 w-3.5" />
            <span>State-of-the-Art ML CDSS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 leading-tight">
            AI-Powered Coronary Heart Disease <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Clinical Decision Support System
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            A specialized decision intelligence dashboard for cardiologists and critical care physicians. 
            Estimate 10-year CHD risks, audit calibration latency, and inspect SHAP explanation matrices 
            in real-time.
          </p>
        </motion.div>

        {/* CTA Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full"
        >
          <Link href="/login">
            <GlassButton variant="primary" size="lg" className="px-8 py-4 shadow-lg shadow-blue-500/10">
              <span>Access Portal</span>
              <ChevronRight className="h-5 w-5" />
            </GlassButton>
          </Link>
        </motion.div>

        {/* Core Value Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6"
        >
          {/* Card 1 */}
          <GlassCard hoverLift className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Calibrated Estimations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              CatBoost ML model pipeline outputs probability estimations calibrated for ICU clinical settings.
            </p>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard hoverLift className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Explainable XAI (SHAP)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides visual explanation of prediction factors (BP, age, glucose, comorbidity burden) for medical review.
            </p>
          </GlassCard>

          {/* Card 3 */}
          <GlassCard hoverLift className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Audit & Governance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track prediction pipelines, validation scores, execution latency, and clinical governance approvals.
            </p>
          </GlassCard>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-200/40 text-[10px] text-slate-400 font-medium">
        <p>© 2026 AI-CHD-CDSS. Developed for ICU clinical ward research and diagnostic validation.</p>
      </footer>
    </div>
  );
}
