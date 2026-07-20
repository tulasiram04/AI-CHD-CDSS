"use client";

import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/reports", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}` }
    })
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => {
        setReports([
          { id: "rep_01", name: "Hospital-wide Clinical Prediction Summary", type: "Executive Chart", date: "2026-07-20", status: "Ready" },
          { id: "rep_02", name: "AI Model Governance & Calibration Report", type: "ML Governance", date: "2026-07-20", status: "Ready" },
          { id: "rep_03", name: "System Audit Trail & Access Log", type: "Compliance", date: "2026-07-20", status: "Ready" },
          { id: "rep_04", name: "Patient Risk Stratification Population Breakdown", type: "Epidemiology", date: "2026-07-20", status: "Ready" },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Executive Reports & Data Export</h1>
        <p className="text-xs text-slate-500 font-semibold">Generate executive summaries, ML governance audits, and clinical network statistics</p>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <GlassCard key={r.id} className="p-6 bg-white border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{r.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.type} • {r.date}</span>
              </div>
            </div>

            <GlassButton variant="primary" size="sm" className="px-4 py-2 font-bold text-xs flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV / PDF</span>
            </GlassButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
