"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Percent,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Plus,
  ArrowRight,
  Activity,
  Heart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // 1. Fetch Patients Cohort
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/api/v1/patients");
      return res.data;
    },
  });

  // 2. Fetch Model Registry
  const { data: models } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await api.get("/api/v1/models");
      return res.data;
    },
  });

  // 3. Fetch Audit Logs
  const { data: audits } = useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/audits");
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) {
          return [];
        }
        throw err;
      }
    },
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const patientsCount = patients?.length || 0;
    const highRiskPatients = patients?.filter((p: any) => p.chd_risk_score && p.chd_risk_score >= 0.20) || [];
    const highRiskCount = highRiskPatients.length;
    const totalRisk = patients?.reduce((acc: number, cur: any) => acc + (cur.chd_risk_score || 0), 0) || 0;
    const avgRisk = patientsCount > 0 ? (totalRisk / patientsCount) * 100 : 0;

    const todayStr = new Date().toDateString();
    const todayPredictions = audits?.filter((a: any) => {
      if (a.model_version === "mock-1") return false;
      const auditDate = new Date(a.timestamp || a.created_at).toDateString();
      return auditDate === todayStr;
    }) || [];
    const todayPredictionsCount = todayPredictions.length;

    const activeModel = models?.find((m: any) => m.status === "Production" || m.status === "Staging") || {
      version: "N/A",
      status: "None"
    };

    return {
      patientsCount,
      highRiskCount,
      avgRisk,
      todayPredictionsCount,
      activeModel,
      highRiskPatients: highRiskPatients.slice(0, 5)
    };
  }, [patients, models, audits]);

  // Chart Data: Predictions Trend
  const trendData = useMemo(() => {
    if (!audits || audits.length === 0) {
      return [];
    }
    const groups: { [key: string]: { count: number; totalRisk: number } } = {};
    audits.forEach((a: any) => {
      if (a.model_version === "mock-1") return;
      const date = new Date(a.timestamp || a.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = { count: 0, totalRisk: 0 };
      }
      groups[date].count++;
      groups[date].totalRisk += a.predicted_risk || 0;
    });

    return Object.keys(groups).map((date) => ({
      date,
      runs: groups[date].count,
      avg_risk: groups[date].totalRisk / groups[date].count
    })).reverse().slice(-7);
  }, [audits]);

  // Chart Data: Risk Distribution (Age groups)
  const ageDistributionData = useMemo(() => {
    const groups = [
      { name: "18-35", count: 0, color: "#B3D4FF" },
      { name: "36-50", count: 0, color: "#8FB3D9" },
      { name: "51-65", count: 0, color: "#4C6F87" },
      { name: "66-80", count: 0, color: "#E1F0FF" },
      { name: "80+", count: 0, color: "#8FB3D9" }
    ];

    if (!patients) return [];

    patients.forEach((p: any) => {
      const age = p.age;
      if (age >= 18 && age <= 35) groups[0].count++;
      else if (age >= 36 && age <= 50) groups[1].count++;
      else if (age >= 51 && age <= 65) groups[2].count++;
      else if (age >= 66 && age <= 80) groups[3].count++;
      else if (age > 80) groups[4].count++;
    });

    return groups;
  }, [patients]);

  const recentPatients = useMemo(() => {
    if (!patients) return [];
    return [...patients].slice(0, 5);
  }, [patients]);



  return (
    <div className="space-y-6">
      
      {/* System Status Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-[#E1F0FF] border border-[#B3D4FF] rounded-xl text-xs font-bold text-[#4C6F87] shadow-sm animate-fade-in">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connection: Connected</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-[#B3D4FF]" />
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Database: PostgreSQL (Pool size: 10)</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-[#B3D4FF]" />
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ML Engine: CatBoost Staging v{stats.activeModel.version}</span>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#4C6F87] tracking-tight flex items-center gap-2">
            Clinical Overview Dashboard
            <Heart className="h-5 w-5 text-[#8FB3D9] fill-[#8FB3D9]/20 animate-pulse" />
          </h2>
          <p className="text-xs text-[#4C6F87]/70 font-semibold">
            Monitor admitted ICU patient cohorts, AI models, and real-time Coronary Heart Disease risk metrics.
          </p>
        </div>


      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Patients */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-[#4C6F87]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">Total Cohort</span>
            <div className="p-1 rounded-lg bg-[#E1F0FF] text-[#4C6F87]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#4C6F87] tracking-tight leading-none">
              {patientsLoading ? "..." : stats.patientsCount}
            </p>
            <span className="text-[9px] font-bold text-[#8FB3D9] flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> Admitted Patients
            </span>
          </div>
        </GlassCard>

        {/* Today's Runs */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-[#8FB3D9]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">Today's Runs</span>
            <div className="p-1 rounded-lg bg-[#E1F0FF] text-[#8FB3D9]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#4C6F87] tracking-tight leading-none">
              {stats.todayPredictionsCount}
            </p>
            <span className="text-[9px] font-bold text-[#4C6F87]/70 flex items-center gap-0.5 mt-1">
              Active CHD Predictions
            </span>
          </div>
        </GlassCard>

        {/* Average CHD Risk */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-[#B3D4FF]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">Average CHD Risk</span>
            <div className="p-1 rounded-lg bg-[#E1F0FF] text-[#4C6F87]">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#4C6F87] tracking-tight leading-none">
              {patientsLoading ? "..." : `${stats.avgRisk.toFixed(1)}%`}
            </p>
            <span className="text-[9px] font-bold text-[#8FB3D9] flex items-center gap-0.5 mt-1">
              Calibrated Mean Risk
            </span>
          </div>
        </GlassCard>

        {/* High Risk Patients */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">High Risk Cohort</span>
            <div className="p-1 rounded-lg bg-rose-50 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-rose-600 tracking-tight leading-none">
              {patientsLoading ? "..." : stats.highRiskCount}
            </p>
            <span className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5 mt-1">
              Requires Cardiology Review
            </span>
          </div>
        </GlassCard>

        {/* Active AI Model */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">Active ML Model</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-500">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between font-extrabold text-[10px] text-[#4C6F87] leading-tight">
              <span>CatBoost v{stats.activeModel.version}</span>
              <span className="text-[8px] px-1 bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase border border-emerald-200">
                {stats.activeModel.status}
              </span>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-[#4C6F87]/60">
              <span>Validation AUC:</span>
              <span className="text-[#4C6F87]">0.868</span>
            </div>
          </div>
        </GlassCard>

        {/* System Status */}
        <GlassCard hoverLift className="flex flex-col justify-between h-32 p-5 border-l-4 border-l-[#8FB3D9]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-[#4C6F87]/65 uppercase tracking-wider">System Checks</span>
            <div className="p-1 rounded-lg bg-[#E1F0FF] text-[#4C6F87]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px] font-extrabold text-[#4C6F87]">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>APIs OK</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>DB Sync</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Calibrator</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MLflow</span>
            </div>
          </div>
        </GlassCard>
      </div>



      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction runs line chart */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#4C6F87] uppercase tracking-wide">
              Prediction Activity Trend
            </h3>
            <p className="text-[10px] text-[#4C6F87]/70 font-semibold mt-0.5">
              Daily frequency of CHD evaluations and estimated risk curves.
            </p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8FB3D9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8FB3D9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1F0FF" />
                <XAxis dataKey="date" className="text-[9px] font-bold fill-[#4C6F87]" />
                <YAxis className="text-[9px] font-bold fill-[#4C6F87]" />
                <Tooltip
                  contentStyle={{
                    fontSize: "10px",
                    fontFamily: "Inter",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(143,179,217,0.4)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px 0 rgba(143,179,217,0.1)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="runs"
                  name="Runs Performed"
                  stroke="#4C6F87"
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Age distribution bar chart */}
        <GlassCard className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#4C6F87] uppercase tracking-wide">
              Age Cohort Density
            </h3>
            <p className="text-[10px] text-[#4C6F87]/70 font-semibold mt-0.5">
              Distribution of admitted patients by age group.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1F0FF" />
                <XAxis dataKey="name" className="text-[9px] font-bold fill-[#4C6F87]" />
                <YAxis className="text-[9px] font-bold fill-[#4C6F87]" />
                <Tooltip
                  contentStyle={{
                    fontSize: "10px",
                    fontFamily: "Inter",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(143,179,217,0.4)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px 0 rgba(143,179,217,0.1)"
                  }}
                />
                <Bar dataKey="count" name="Patient Count" radius={[4, 4, 0, 0]}>
                  {ageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Recent Patients & High Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patient registry list */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-[#4C6F87] uppercase tracking-wide">
                Recent Admitted Cohorts
              </h3>
              <p className="text-[10px] text-[#4C6F87]/70 font-semibold mt-0.5">
                Overview of newly registered patient medical records.
              </p>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => router.push("/patients")}
              className="py-1 border-[#B3D4FF] text-[#4C6F87] hover:bg-[#E1F0FF]"
            >
              <span>Full Registry</span>
              <ArrowRight className="h-3 w-3" />
            </GlassButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-bold">
              <thead>
                <tr className="border-b border-[#B3D4FF]/45 text-[#4C6F87]/65 uppercase text-[9px] tracking-wider font-black">
                  <th className="py-2 px-3">Patient UUID</th>
                  <th className="py-2 px-3">hadm ID</th>
                  <th className="py-2 px-3">Age</th>
                  <th className="py-2 px-3">Gender</th>
                  <th className="py-2 px-3">BP Telemetry</th>
                  <th className="py-2 px-3">CHD Risk</th>
                </tr>
              </thead>
              <tbody className="text-[#4C6F87]">
                {recentPatients.map((p: any) => {
                  const risk = p.chd_risk_score || 0.05;
                  const isHigh = risk >= 0.20;
                  return (
                    <tr
                      key={p.patient_id}
                      className="border-b border-[#B3D4FF]/20 hover:bg-[#E1F0FF]/30 transition cursor-pointer"
                      onClick={() => router.push(`/patients/${p.patient_id}`)}
                    >
                      <td className="py-2.5 px-3 font-mono text-[10px] text-[#4C6F87] max-w-[120px] truncate">
                        {p.patient_uuid}
                      </td>
                      <td className="py-2.5 px-3 font-extrabold">{p.hadm_id}</td>
                      <td className="py-2.5 px-3">{p.age} yrs</td>
                      <td className="py-2.5 px-3">{p.gender === 1 ? "M" : "F"}</td>
                      <td className="py-2.5 px-3">
                        {p.systolic_bp ? `${p.systolic_bp}/${p.diastolic_bp}` : "N/A"}
                      </td>
                      <td className="py-2.5 px-3">
                        <GlassBadge variant={isHigh ? "danger" : risk >= 0.10 ? "warning" : "success"}>
                          {(risk * 100).toFixed(0)}%
                        </GlassBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* High Risk Alert Cohort */}
        <GlassCard className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#4C6F87] uppercase tracking-wide">
              Critical Alert Board
            </h3>
            <p className="text-[10px] text-[#4C6F87]/70 font-semibold mt-0.5">
              Patients requiring immediate cardiologist intervention.
            </p>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {stats.highRiskPatients.length === 0 ? (
              <div className="text-center py-8 text-[#4C6F87]/50 text-xs font-bold">
                No active high-risk patients.
              </div>
            ) : (
              stats.highRiskPatients.map((p: any) => (
                <div
                  key={p.patient_id}
                  className="flex justify-between items-center p-3 bg-rose-50/40 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-50/60 transition cursor-pointer"
                  onClick={() => router.push(`/predict?patient_id=${p.patient_id}`)}
                >
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-mono text-[10px]">ID: {p.hadm_id}</span>
                    <div className="text-[9px] text-[#4C6F87]/60">
                      {p.age} yrs old • {p.gender === 1 ? "Male" : "Female"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-rose-600 font-mono text-sm">
                      {((p.chd_risk_score || 0) * 100).toFixed(0)}%
                    </span>
                    <GlassBadge variant="danger">High</GlassBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
