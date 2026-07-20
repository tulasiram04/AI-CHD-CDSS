"use client";

import React, { useEffect, useState } from "react";
import { Layers, Plus, Stethoscope, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/departments", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}` }
    })
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => {
        setDepartments([
          { id: "1", name: "Cardiology & CCU", code: "CARD-01", head_clinician: "Dr. Robert Vance, MD", status: "Active" },
          { id: "2", name: "Intensive Care Unit (ICU)", code: "ICU-02", head_clinician: "Dr. Sarah Jenkins, MD", status: "Active" },
          { id: "3", name: "Emergency Medicine (ER)", code: "EM-03", head_clinician: "Dr. Marcus Thorne, MD", status: "Active" },
          { id: "4", name: "Outpatient Cardiology (OPD)", code: "OPD-04", head_clinician: "Dr. Elena Rostova, MD", status: "Active" }
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Clinical Department Governance</h1>
          <p className="text-xs text-slate-500 font-semibold">Departmental leadership, specialty divisions, and operational status</p>
        </div>
        <GlassButton variant="primary" size="sm" className="px-4 py-2 font-bold text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Department</span>
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {departments.map((d) => (
          <GlassCard key={d.id} className="p-6 bg-white border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{d.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.code}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {d.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-indigo-600" />
              <span>Head Clinician: {d.head_clinician}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
