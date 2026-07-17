"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { History, Search, Filter, ShieldAlert, Cpu, Layers, Info, CheckCircle, Clock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";

export default function PredictionHistoryTimeline() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  
  // Performance modal details state
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [perfData, setPerfData] = useState<any>(null);
  const [isPerfLoading, setIsPerfLoading] = useState(false);

  // Fetch prediction audits (Requires Admin, Auditor, Doctor, Nurse, or Researcher roles)
  const isAllowed = ["admin", "auditor", "doctor", "nurse", "medical researcher"].includes(user?.role || "");

  const { data: audits, isLoading, error } = useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      const res = await api.get("/api/v1/audits");
      return res.data;
    },
    enabled: isAllowed, // Only query if role matches, otherwise it would return 403
  });

  const filteredAudits = useMemo(() => {
    if (!audits) return [];

    let list = audits.filter((a: any) => a.model_version !== "mock-1");

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (a: any) =>
          a.patient_uuid.toLowerCase().includes(query) ||
          a.audit_uuid.toLowerCase().includes(query)
      );
    }

    if (modelFilter !== "all") {
      list = list.filter((a: any) => a.model_version === modelFilter);
    }

    if (riskFilter !== "all") {
      list = list.filter((a: any) => a.risk_level.toLowerCase() === riskFilter);
    }

    return list;
  }, [audits, searchTerm, modelFilter, riskFilter]);

  const handleViewPerformance = async (audit: any) => {
    setSelectedAudit(audit);
    setIsPerfLoading(true);
    setPerfData(null);
    try {
      // Query specific audit execution logs from backend API
      const res = await api.get(`/api/v1/audits/${audit.id}/performance`);
      setPerfData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load telemetry resource metrics.";
      toast(msg, "error", "Audit Error");
    } finally {
      setIsPerfLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl === "high" || lvl === "very high") return <GlassBadge variant="danger">{level}</GlassBadge>;
    if (lvl === "medium" || lvl === "moderate") return <GlassBadge variant="warning">{level}</GlassBadge>;
    return <GlassBadge variant="success">{level}</GlassBadge>;
  };

  // If Doctor: Show permission restriction block with switch info
  if (!isAllowed) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Compliance Audit Timeline
            <Clock className="h-5 w-5 text-slate-500" />
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Audit history tracks system access, model predictions, latency parameters, and validation logs.
          </p>
        </div>

        <GlassCard className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 bg-white/60">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto animate-pulse">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            Access Restricted: Auditor Scope
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current account role is <span className="font-extrabold text-primary uppercase">Clinician</span>. 
            Full system-wide prediction logs, memory traces, and CPU load validation matrices are restricted 
            to administrators and compliance officers to satisfy clinical safety protocols.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-100/50 rounded-xl text-[10px] leading-relaxed text-blue-700 font-semibold max-w-sm mx-auto">
            <span>Try logging out and logging back in as the <span className="font-extrabold">Administrator</span> (autofill pre-set on Login screen) to inspect this view!</span>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compliance Audit Timeline</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Review all logged prediction runs, execution metrics, and Calibrated inference logs for medical safety reviews.
        </p>
      </div>

      {/* Filters Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 border border-slate-200/40 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Patient UUID / Audit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/60 border border-slate-200/50 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Model Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="w-full bg-white/60 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition cursor-pointer"
          >
            <option value="all">All Models</option>
            <option value="2">CatBoost Staging</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-white/60 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="very high">Very High</option>
          </select>
        </div>

        <div className="text-right text-[10px] font-extrabold text-slate-400 flex items-center justify-end">
          Total: {filteredAudits.length} Audited Logs
        </div>
      </div>

      {/* Audit Registry Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main List */}
        <GlassCard className="xl:col-span-2 p-0 overflow-hidden bg-white/70">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span className="text-xs font-bold text-slate-400 animate-pulse">Retrieving System Audits...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 text-xs font-bold">
              Failed to sync audit records. Check backend connections.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200/50 bg-slate-100/30 text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Patient UUID</th>
                    <th className="py-4 px-6">Model</th>
                    <th className="py-4 px-6">CHD Risk</th>
                    <th className="py-4 px-6 text-right">Inference Details</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredAudits.length > 0 ? (
                    filteredAudits.map((a: any) => (
                      <tr
                        key={a.id}
                        className={`border-b border-slate-100/50 hover:bg-slate-50/50 transition cursor-pointer ${
                          selectedAudit?.id === a.id ? "bg-blue-50/20" : ""
                        }`}
                        onClick={() => handleViewPerformance(a)}
                      >
                        <td className="py-3.5 px-6 font-bold text-slate-800">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">
                          {a.patient_uuid}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-extrabold text-[10px] text-slate-800">v{a.model_version}</span>
                        </td>
                        <td className="py-3.5 px-6">{getRiskBadge(a.risk_level)}</td>
                        <td className="py-3.5 px-6 text-right">
                          <GlassButton variant="secondary" size="sm" className="py-1 px-2.5">
                            <Cpu className="h-3.5 w-3.5" />
                            <span>Stats</span>
                          </GlassButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs font-semibold">
                        No prediction audits matching parameters found in databases.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Right Panel: Execution Performance telemetry details */}
        <GlassCard className="p-6 space-y-6 bg-white/70 min-h-[400px] flex flex-col justify-between">
          {!selectedAudit ? (
            <div className="my-auto text-center space-y-2 flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-50/50 rounded-full border border-blue-100/30 flex items-center justify-center text-slate-400">
                <History className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audit Details</h4>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                Select any audit log from the timeline grid to inspect CPU usage, latencies, and drift scoring.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest block">Audit Telemetry</span>
                <h4 className="text-xs font-extrabold text-slate-800 truncate">UUID: {selectedAudit.audit_uuid}</h4>
                <p className="text-[9px] text-slate-400 font-medium">IP: {selectedAudit.request_ip}</p>
              </div>

              {/* Loader */}
              {isPerfLoading ? (
                <div className="my-auto flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  <span className="text-[10px] font-bold text-slate-400 animate-pulse">Tracing hardware logs...</span>
                </div>
              ) : perfData ? (
                // Performance stats display
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">CPU Load</span>
                      <span className="text-sm font-extrabold text-slate-800">{perfData.cpu_load_pct.toFixed(1)}%</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase block mb-0.5">RAM Usage</span>
                      <span className="text-sm font-extrabold text-slate-800">{perfData.memory_usage_mb.toFixed(0)} MB</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Inference Latency:</span>
                    <span className="text-slate-800">{perfData.execution_latency_ms.toFixed(1)} ms</span>
                  </div>

                  {perfData.data_drift_score !== null && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Data Drift index:</span>
                      <span className={`text-sm font-extrabold ${perfData.data_drift_score > 0.05 ? "text-rose-500" : "text-emerald-500"}`}>
                        {perfData.data_drift_score.toFixed(3)}
                      </span>
                    </div>
                  )}

                  {perfData.warning_flags && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold flex gap-2 items-start text-rose-800">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <span className="text-[9px] text-rose-500 uppercase block mb-0.5">Warnings Flagged</span>
                        <p className="text-[10px] font-semibold leading-normal">{perfData.warning_flags}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-auto text-center text-slate-400 text-xs font-semibold">
                  Performance statistics not available for this record.
                </div>
              )}

              {/* Status approval badges */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Compliance Audited
                </span>
                <span className="text-slate-500">v{selectedAudit.model_version}</span>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
