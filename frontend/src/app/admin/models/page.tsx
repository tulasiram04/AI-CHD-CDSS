"use client";

import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle2, Shield, Activity, Layers } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { api } from "@/lib/api";

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/v1/admin/models")
      .then(res => setModels(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error loading models:", err));
  }, []);

  const handleActivate = async (id: string) => {
    try {
      await api.post(`/api/v1/admin/models/${id}/activate`);
      setModels(models.map(m => m.id === id ? { ...m, status: "Production" } : { ...m, status: "Archived" }));
    } catch (err) {
      console.error("Error activating model:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Enterprise AI Model Governance</h1>
        <p className="text-xs text-slate-500 font-semibold">MLflow model registry, production activation, validation AUC scores, and deployment versions</p>
      </div>

      <div className="space-y-4">
        {models.map((m) => (
          <GlassCard key={m.id} className="p-6 bg-white border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{m.model_name} ({m.model_version})</h3>
                  <span className="text-[10px] font-mono text-slate-400">Run ID: {m.run_id}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">{m.comments}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-emerald-600">
                <span>Validation ROC-AUC: {m.val_auc}</span>
                <span>Cross-Val AUC: {m.cv_auc}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {m.status === "Production" ? (
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active Production
                </span>
              ) : (
                <GlassButton onClick={() => handleActivate(m.id)} variant="primary" size="sm" className="px-4 py-2 font-bold text-xs">
                  <span>Promote to Production</span>
                </GlassButton>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
