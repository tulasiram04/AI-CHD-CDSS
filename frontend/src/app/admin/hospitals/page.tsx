"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Search, MapPin, BedDouble, CheckCircle2, Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/hospitals", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}` }
    })
      .then(res => res.json())
      .then(data => setHospitals(Array.isArray(data) ? data : []))
      .catch(() => {
        setHospitals([
          { id: "1", name: "St. Jude Memorial Hospital", code: "SJH-01", city: "Boston", state: "MA", status: "Active", total_beds: 450, icu_beds: 60 },
          { id: "2", name: "General Care Medical Center", code: "GMC-02", city: "New York", state: "NY", status: "Active", total_beds: 620, icu_beds: 85 },
          { id: "3", name: "University Cardiology Institute", code: "UCI-03", city: "Chicago", state: "IL", status: "Active", total_beds: 380, icu_beds: 50 },
          { id: "4", name: "Pacific Critical Care Hospital", code: "PCH-04", city: "San Francisco", state: "CA", status: "Active", total_beds: 500, icu_beds: 70 }
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Hospital Network Management</h1>
          <p className="text-xs text-slate-500 font-semibold">Manage hospital facilities, critical care wards, and medical bed allocations</p>
        </div>
        <GlassButton variant="primary" size="sm" className="px-4 py-2 font-bold text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Hospital Branch</span>
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hospitals.map((h) => (
          <GlassCard key={h.id} className="p-6 bg-white border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{h.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h.code}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {h.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{h.city}, {h.state}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BedDouble className="h-4 w-4 text-indigo-600" />
                <span>{h.total_beds} Beds ({h.icu_beds} ICU)</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
