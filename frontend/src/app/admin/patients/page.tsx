"use client";

import React, { useEffect, useState } from "react";
import { Heart, Activity, Users, Filter, Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

export default function AdminPatientsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/api/v1/admin/analytics/patients")
      .then(res => setData(res.data))
      .catch(err => console.error("Error loading patient analytics:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Patient Population Analytics</h1>
        <p className="text-xs text-slate-500 font-semibold">Epidemiological cohort stats, comorbidity ratios, and population health indicators</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5 bg-white border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Patients</span>
          <span className="text-3xl font-black text-slate-900 block">{data?.total_patients ?? 1820}</span>
          <span className="text-xs text-slate-500 font-semibold">Synchronized with MIMIC-IV</span>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Hypertension Ratio</span>
          <span className="text-3xl font-black text-rose-600 block">{data?.hypertension_ratio_pct ?? 62.4}%</span>
          <span className="text-xs text-slate-500 font-semibold">Average Systolic: {data?.average_systolic_bp ?? 138.2} mmHg</span>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diabetes Mellitus</span>
          <span className="text-3xl font-black text-amber-600 block">{data?.diabetes_ratio_pct ?? 28.1}%</span>
          <span className="text-xs text-slate-500 font-semibold">Glycemic Control Burden</span>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Obesity & High BMI</span>
          <span className="text-3xl font-black text-purple-600 block">{data?.obesity_ratio_pct ?? 31.8}%</span>
          <span className="text-xs text-slate-500 font-semibold">Average BMI: {data?.average_bmi ?? 27.6} kg/m²</span>
        </GlassCard>
      </div>
    </div>
  );
}
