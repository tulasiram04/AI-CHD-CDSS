"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Building2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@hospital.org");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Authentication failed.");
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid Super Admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between items-center p-6 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      {/* Header Logo */}
      <div className="pt-8 flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-black text-lg text-white tracking-tight leading-none">AI-CHD-CDSS</h1>
          <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest block mt-0.5">
            Enterprise Super Admin Portal
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 py-8">
        <GlassCard className="p-8 space-y-6 bg-slate-800/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl rounded-3xl">
          <div className="space-y-2 text-center">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h2>
            <p className="text-xs text-slate-400 font-medium">
              Enterprise Governance & Executive Command Center
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@hospital.org"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{isLoading ? "Authenticating..." : "Access Command Center"}</span>
              <ArrowRight className="h-4 w-4" />
            </GlassButton>
          </form>

          <div className="pt-4 border-t border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              Authorized Super Admin Personnel Only. System Access is Audited.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center text-[10px] text-slate-500 font-medium relative z-10">
        <p>© 2026 AI-CHD-CDSS. Enterprise Healthcare AI Governance Platform.</p>
      </footer>
    </div>
  );
}
