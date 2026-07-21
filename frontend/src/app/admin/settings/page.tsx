"use client";

import React, { useEffect, useState } from "react";
import { Settings, Shield, Sliders, Bell, Save } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get("/api/v1/admin/settings")
      .then(res => setSettings(res.data))
      .catch(err => console.error("Error loading admin settings:", err));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-black text-slate-900">Enterprise Application Settings</h1>
        <p className="text-xs text-slate-500 font-semibold">Global clinical parameters, AI risk thresholds, and security policies</p>
      </div>

      <GlassCard className="p-6 bg-white border border-slate-100 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Network Configuration</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Hospital Network Title</label>
            <input
              type="text"
              defaultValue={settings?.hospital_name || "AI-CHD-CDSS Enterprise Network"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">High Risk Threshold (%)</label>
              <input
                type="number"
                defaultValue={settings?.high_risk_threshold_pct || 20.0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Very High Risk Threshold (%)</label>
              <input
                type="number"
                defaultValue={settings?.very_high_risk_threshold_pct || 40.0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <GlassButton variant="primary" size="sm" className="px-6 py-2.5 font-bold text-xs flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
