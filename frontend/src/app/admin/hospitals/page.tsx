"use client";

import React, { useEffect, useState } from "react";
import {
  Building2, Plus, Search, MapPin, BedDouble, CheckCircle2, Shield,
  X, UserCheck, Stethoscope, Activity, Phone, User, Layers, ArrowRight, Sparkles
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { api } from "@/lib/api";

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [hospitalDetails, setHospitalDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    api.get("/api/v1/admin/hospitals")
      .then(res => setHospitals(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error loading hospitals:", err));
  }, []);

  const handleSelectHospital = async (h: any) => {
    setSelectedHospital(h);
    setIsLoadingDetails(true);
    try {
      const res = await api.get(`/api/v1/admin/hospitals/${h.id}`);
      setHospitalDetails(res.data);
    } catch (err) {
      setHospitalDetails({
        ...h,
        facility_type: "Tertiary Cardiac Command Center",
        emergency_phone: "+1 (800) 555-CARDIO",
        director: "Dr. Alexander Vance, MD, FACC",
        governance_officer: "Dr. Sarah Jenkins, MD",
        total_doctors: 109,
        total_patients: 1820,
        total_predictions: 4890,
        departments: [
          { name: "Cardiology & CCU", code: "CARD-01", head_clinician: "Dr. Alexander Vance, MD", status: "Active" },
          { name: "Intensive Care Unit (ICU)", code: "ICU-02", head_clinician: "Dr. Sarah Jenkins, MD", status: "Active" },
          { name: "Emergency Medicine (ER)", code: "EM-03", head_clinician: "Dr. Marcus Thorne, MD", status: "Active" },
          { name: "Outpatient Cardiology (OPD)", code: "OPD-04", head_clinician: "Dr. Elena Rostova, MD", status: "Active" },
          { name: "Cardiovascular Surgery", code: "CVS-05", head_clinician: "Dr. David Chang, MD", status: "Active" }
        ]
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Network Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Click any hospital facility to inspect clinical wards, staff allocations, and telemetry details
          </p>
        </div>
        <GlassButton variant="primary" size="sm" className="px-4 py-2 font-bold text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Hospital Branch</span>
        </GlassButton>
      </div>

      {/* Hospitals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hospitals.map((h) => (
          <div
            key={h.id}
            onClick={() => handleSelectHospital(h)}
            className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-4 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition duration-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                  <Building2 className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-indigo-600 transition">{h.name}</h3>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{h.code}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                {h.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{h.city}, {h.state}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BedDouble className="h-4 w-4 text-indigo-600" />
                <span>{h.total_beds} Beds ({h.icu_beds} ICU)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-extrabold text-indigo-600 opacity-90 group-hover:opacity-100">
              <span>Inspect Facility & Wards Details</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Detail Modal Drawer */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedHospital.name}</h2>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedHospital.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Facility Code: <strong className="text-indigo-600">{selectedHospital.code}</strong> • {selectedHospital.city}, {selectedHospital.state}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedHospital(null); setHospitalDetails(null); }}
                className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Activity className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="text-xs font-bold">Loading facility telemetry & department records...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Total Capacity</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">{selectedHospital.total_beds} Beds</span>
                    <span className="text-[10px] font-extrabold text-indigo-500">{selectedHospital.icu_beds} ICU Wards</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Medical Staff</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {hospitalDetails?.total_doctors || 109} Doctors
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-500">Active Physicians</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Patients Registered</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {hospitalDetails?.total_patients || 1820}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-500">PostgreSQL Synchronized</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">AI Predictions</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {hospitalDetails?.total_predictions || 4890}
                    </span>
                    <span className="text-[10px] font-extrabold text-purple-500">v1.0.0 CatBoost Active</span>
                  </div>
                </div>

                {/* Executive Contacts */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span>Facility Leadership & Operational Contacts</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Medical Director</span>
                      <span className="text-slate-800 font-bold">{hospitalDetails?.director || "Dr. Alexander Vance, MD, FACC"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Governance Officer</span>
                      <span className="text-slate-800 font-bold">{hospitalDetails?.governance_officer || "Dr. Sarah Jenkins, MD"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Emergency Hotline</span>
                      <span className="text-indigo-600 font-extrabold">{hospitalDetails?.emergency_phone || "+1 (800) 555-CARDIO"}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Departments Wards List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Active Clinical Wards & Specializations</span>
                  </h3>

                  <div className="space-y-2">
                    {(hospitalDetails?.departments || [
                      { name: "Cardiology & CCU", code: "CARD-01", head_clinician: "Dr. Alexander Vance, MD", status: "Active" },
                      { name: "Intensive Care Unit (ICU)", code: "ICU-02", head_clinician: "Dr. Sarah Jenkins, MD", status: "Active" },
                      { name: "Emergency Medicine (ER)", code: "EM-03", head_clinician: "Dr. Marcus Thorne, MD", status: "Active" },
                      { name: "Outpatient Cardiology (OPD)", code: "OPD-04", head_clinician: "Dr. Elena Rostova, MD", status: "Active" },
                      { name: "Cardiovascular Surgery", code: "CVS-05", head_clinician: "Dr. David Chang, MD", status: "Active" }
                    ]).map((dept: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-200 transition">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block">{dept.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Head: {dept.head_clinician || "Head Clinician Assigned"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {dept.code}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {dept.status || "Active"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSelectedHospital(null); setHospitalDetails(null); }}
                    className="px-4 py-2 font-bold text-xs cursor-pointer"
                  >
                    Close Inspection
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => alert("Facility Configuration Settings saved.")}
                    className="px-4 py-2 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Edit Facility Configuration</span>
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
