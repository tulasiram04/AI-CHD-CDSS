"use client";

import React, { useEffect, useState } from "react";
import { Stethoscope, UserCheck, ShieldAlert, Key, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/users?role=doctor", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}` }
    })
      .then(res => res.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => {
        setDoctors([
          { id: "1", email: "doctor@hospital.org", full_name: "Dr. Alexander Vance", specialty: "Cardiology", license_number: "MD-998877", department: "Coronary Care Unit (CCU)", is_active: true },
          { id: "2", email: "cardio@hospital.org", full_name: "Dr. Sarah Jenkins", specialty: "Cardiovascular Surgery", license_number: "MD-443322", department: "Intensive Care Unit (ICU)", is_active: true },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Physician & Specialist Management</h1>
        <p className="text-xs text-slate-500 font-semibold">Medical licenses, clinical specialty credentials, and account activation states</p>
      </div>

      <GlassCard className="p-6 bg-white border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4">Physician Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Specialty & License</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{doc.full_name || "Dr. Staff Physician"}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600">{doc.email}</td>
                  <td className="py-3 px-4">
                    <div>{doc.specialty || "Cardiology"}</div>
                    <span className="text-[10px] text-slate-400 font-bold">{doc.license_number || "MD-License"}</span>
                  </td>
                  <td className="py-3 px-4">{doc.department || "Coronary Care Unit (CCU)"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${doc.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700"}`}>
                      {doc.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
