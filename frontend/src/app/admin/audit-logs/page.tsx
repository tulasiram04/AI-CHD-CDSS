"use client";

import React, { useEffect, useState } from "react";
import { History, Shield, Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/v1/admin/audit-logs")
      .then(res => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error loading audit logs:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">System-Wide Audit Trail</h1>
        <p className="text-xs text-slate-500 font-semibold">Immutable administrative activity logs, security actions, and system modifications</p>
      </div>

      <GlassCard className="p-6 bg-white border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4">Activity Event</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{l.activity_type}</td>
                  <td className="py-3 px-4 text-slate-600">{l.details || "System execution"}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
