"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield, UserCheck, Key, Lock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/v1/admin/users")
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error loading users:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">User Access & Role Control</h1>
        <p className="text-xs text-slate-500 font-semibold">Manage clinical accounts, permissions, and session authentications</p>
      </div>

      <GlassCard className="p-6 bg-white border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4">Account Email</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.email}</td>
                  <td className="py-3 px-4 uppercase text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
                    {u.role}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-[10px] font-bold text-indigo-600 hover:underline">
                      Reset Password
                    </button>
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
