"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Bell, Shield, ChevronDown, LogOut, CheckCircle2,
  Building2, Sparkles, RefreshCw, Cpu, Activity, User, Stethoscope
} from "lucide-react";

export default function AdminNavbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, doctors, AI models, patients, audit logs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Doctor Portal Switcher */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
        >
          <Stethoscope className="h-4 w-4 text-blue-200" />
          <span>Doctor Workspace</span>
        </Link>
        {/* System Health Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-700 text-xs font-extrabold shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Health: 99.4% (Healthy)</span>
        </div>

        {/* Active Hospital Facility Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
          <Building2 className="h-4 w-4 text-indigo-600" />
          <span>St. Jude Memorial Network</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">System Alerts</h4>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-800 text-[11px]">New Doctor Approval Pending</p>
                  <p className="text-[9px] text-slate-500 font-medium">Dr. Marcus Vance requested CCU access</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-900 text-[11px]">CatBoost v1.0.0 Active</p>
                  <p className="text-[9px] text-emerald-700 font-medium">Model calibration verified (Isotonic)</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-900 text-[11px]">Database Backup Complete</p>
                  <p className="text-[9px] text-blue-700 font-medium">PostgreSQL snapshot saved to cloud</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              SA
            </div>
            <span className="text-xs font-bold text-slate-800 hidden md:inline">Super Admin</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1">
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-indigo-600" />
                <span>Admin Profile</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Shield className="h-4 w-4 text-indigo-600" />
                <span>Security Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="h-4 w-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
