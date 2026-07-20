"use client";

import React from "react";
import { LineChart, BarChart3, Heart, Activity } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminClinicalAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Clinical Intelligence & Population Health</h1>
        <p className="text-xs text-slate-500 font-semibold">Population disease burden, age-adjusted risk statistics, and clinical outcome metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard className="p-6 bg-white border border-slate-100 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">High Risk Population</span>
          <span className="text-3xl font-black text-rose-600 block">185 Patients</span>
          <p className="text-xs text-slate-500 font-medium">Patients with estimated 10-year CHD risk &ge; 20%</p>
        </GlassCard>

        <GlassCard className="p-6 bg-white border border-slate-100 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Systolic Pressure</span>
          <span className="text-3xl font-black text-amber-600 block">138.2 mmHg</span>
          <p className="text-xs text-slate-500 font-medium">Population baseline blood pressure index</p>
        </GlassCard>

        <GlassCard className="p-6 bg-white border border-slate-100 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Serum Cholesterol</span>
          <span className="text-3xl font-black text-purple-600 block">215.4 mg/dL</span>
          <p className="text-xs text-slate-500 font-medium">Hypercholesterolemia clinical screening target</p>
        </GlassCard>
      </div>
    </div>
  );
}
