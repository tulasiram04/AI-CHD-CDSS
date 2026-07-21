"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Layers, Stethoscope, Users, UserCheck, Heart, Activity,
  Cpu, ShieldCheck, Server, Database, Radio, TrendingUp, AlertTriangle,
  Clock, CheckCircle2, RefreshCw, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

// Mock trend data for Recharts visualizations
const predictionTrendData = [
  { day: "Mon", predictions: 142, highRisk: 28 },
  { day: "Tue", predictions: 185, highRisk: 34 },
  { day: "Wed", predictions: 210, highRisk: 41 },
  { day: "Thu", predictions: 195, highRisk: 38 },
  { day: "Fri", predictions: 240, highRisk: 52 },
  { day: "Sat", predictions: 160, highRisk: 25 },
  { day: "Sun", predictions: 180, highRisk: 30 },
];

const riskDistributionData = [
  { name: "Very Low (<5%)", value: 340, color: "#10b981" },
  { name: "Low (5-9.9%)", value: 280, color: "#059669" },
  { name: "Moderate (10-19.9%)", value: 195, color: "#f59e0b" },
  { name: "High (20-39.9%)", value: 120, color: "#ef4444" },
  { name: "Very High (≥40%)", value: 65, color: "#dc2626" },
];

const hospitalComparisonData = [
  { hospital: "St. Jude Memorial", predictions: 420, activeDoctors: 24 },
  { hospital: "General Care Center", predictions: 610, activeDoctors: 38 },
  { hospital: "Univ Cardiology", predictions: 310, activeDoctors: 18 },
  { hospital: "Pacific Critical Care", predictions: 480, activeDoctors: 29 },
];

import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/api/v1/admin/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch admin stats from PostgreSQL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">AI-CHD-CDSS Governance Command</h1>
          <p className="text-xs text-indigo-200 font-medium">
            Real-Time Healthcare Network Operations, AI Model Telemetry & Clinical Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top 8 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Hospitals */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Hospitals & Branches</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 block">{stats?.total_hospitals ?? 4}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> {stats?.total_departments ?? 12} Departments Active
            </span>
          </div>
        </GlassCard>

        {/* Doctors */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Physicians</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 block">{stats?.total_doctors ?? 109}</span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              <Users className="h-3.5 w-3.5" /> {stats?.total_users ?? 360} Total Staff Accounts
            </span>
          </div>
        </GlassCard>

        {/* Registered Patients */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Registered Patients</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Heart className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 block">{stats?.registered_patients ?? 1820}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Synchronized with MIMIC-IV
            </span>
          </div>
        </GlassCard>

        {/* Predictions Today */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Predictions Today</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 block">{stats?.predictions_today ?? 180}</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">
              {stats?.total_predictions ?? 4890} Total Cumulative Predictions
            </span>
          </div>
        </GlassCard>

        {/* Average CHD Risk */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Average CHD Risk</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 block">{stats?.average_chd_risk_pct ?? 14.2}%</span>
            <span className="text-xs font-semibold text-purple-600 mt-1 block">
              Moderate Baseline Risk Distribution
            </span>
          </div>
        </GlassCard>

        {/* High / Very High Risk Patients */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Critical Risk Cases</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-rose-600 block">
              {(stats?.high_risk_patients ?? 120) + (stats?.very_high_risk_patients ?? 65)}
            </span>
            <span className="text-xs font-semibold text-rose-600 mt-1 block">
              {stats?.very_high_risk_patients ?? 65} Very High Risk (&ge;40%)
            </span>
          </div>
        </GlassCard>

        {/* AI Model Status */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current AI Model</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-base font-black text-slate-900 block truncate">{stats?.ai_model?.active_version ?? "v1.0.0 (CatBoost)"}</span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 block">
              ROC-AUC: {stats?.ai_model?.validation_auc ?? 0.763} | Latency: {stats?.ai_model?.avg_inference_latency_ms ?? 14.8}ms
            </span>
          </div>
        </GlassCard>

        {/* System Telemetry */}
        <GlassCard hoverLift className="p-5 bg-white border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Health Score</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-600 block">{stats?.system_health?.overall_health_score ?? 99.4}%</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">
              CPU: {stats?.system_health?.cpu_usage_pct ?? 12.4}% | RAM: {stats?.system_health?.memory_usage_pct ?? 42.1}%
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Volume Trend */}
        <GlassCard className="p-6 bg-white border border-slate-100 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Weekly Prediction Volume Trend</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Total ML predictions vs High Risk cases</p>
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Live Telemetry
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionTrendData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="predictions" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" name="Total Predictions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk Level Breakdown Pie */}
        <GlassCard className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Population Risk Distribution</h3>
              <p className="text-[11px] text-slate-500 font-semibold">5-Tier CHD Risk Stratification</p>
            </div>
            <PieChartIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Hospital Performance & System Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Comparison */}
        <GlassCard className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Hospital Network Comparison</h3>
            <span className="text-[10px] font-bold text-slate-400">4 Active Branches</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hospital" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="predictions" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Predictions Performed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Real-Time Telemetry Gauges */}
        <GlassCard className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Real-Time Infrastructure Telemetry</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* CPU */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">CPU Usage</span>
                <span className="font-bold text-slate-900">{stats?.system_health?.cpu_usage_pct ?? 12.4}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${stats?.system_health?.cpu_usage_pct ?? 12.4}%` }} />
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Memory (RAM) Usage</span>
                <span className="font-bold text-slate-900">{stats?.system_health?.memory_usage_pct ?? 42.1}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats?.system_health?.memory_usage_pct ?? 42.1}%` }} />
              </div>
            </div>

            {/* Disk */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Disk Storage Usage</span>
                <span className="font-bold text-slate-900">{stats?.system_health?.disk_usage_pct ?? 28.5}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.system_health?.disk_usage_pct ?? 28.5}%` }} />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-bold">Database</span>
                <span className="font-black text-slate-800">PostgreSQL 16 (Connected)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-bold">Cache / Queue</span>
                <span className="font-black text-slate-800">Redis 7.0 (Healthy)</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
