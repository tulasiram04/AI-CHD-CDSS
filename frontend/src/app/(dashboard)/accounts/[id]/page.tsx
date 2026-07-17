"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowLeft,
  Trash2,
  Clock
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassBadge from "@/components/ui/GlassBadge";
import GlassButton from "@/components/ui/GlassButton";
import { useToast } from "@/providers/ToastProvider";

const getRoleLabel = (role: string) => {
  if (!role) return "";
  const r = role.toLowerCase();
  if (r === "doctor") return "Consulting Cardiologist";
  if (r === "admin") return "Systems Administrator";
  if (r === "nurse") return "Registered Nurse";
  if (r === "lab tech") return "Laboratory Technician";
  if (r === "ecg tech") return "ECG Technician";
  if (r === "radiology tech") return "Radiology Technician";
  if (r === "medical researcher") return "Medical Researcher";
  if (r === "pharmacist") return "Pharmacist";
  if (r === "physiotherapist") return "Physiotherapist";
  if (r === "dietitian") return "Dietitian";
  if (r === "auditor") return "Compliance Auditor";
  if (r === "governance") return "Governance Officer";
  return role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getRoleBgColor = (role: string) => {
  const r = role?.toLowerCase() || "";
  if (r === "nurse") return "bg-emerald-500/10 text-emerald-700 border-emerald-200/50";
  if (r === "lab tech") return "bg-violet-500/10 text-violet-700 border-violet-200/50";
  if (r === "ecg tech") return "bg-amber-500/10 text-amber-700 border-amber-200/50";
  if (r === "radiology tech") return "bg-cyan-500/10 text-cyan-700 border-cyan-200/50";
  if (r === "medical researcher") return "bg-indigo-500/10 text-indigo-700 border-indigo-200/50";
  if (r === "pharmacist") return "bg-pink-500/10 text-pink-700 border-pink-200/50";
  if (r === "physiotherapist") return "bg-teal-500/10 text-teal-700 border-teal-200/50";
  if (r === "dietitian") return "bg-lime-500/10 text-lime-700 border-lime-200/50";
  if (r === "auditor") return "bg-orange-500/10 text-orange-700 border-orange-200/50";
  if (r === "governance") return "bg-rose-500/10 text-rose-700 border-rose-200/50";
  return "bg-blue-500/10 text-blue-700 border-blue-200/50";
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = params?.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["systemUser", userId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/auth/users/${userId}`);
      return res.data;
    },
    enabled: !!userId
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/auth/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast("Staff user account has been successfully removed from the portal.", "success", "Account Deleted");
      router.push("/accounts");
    },
    onError: () => {
      toast("Failed to delete user account. Please try again.", "error", "Delete Failed");
      setShowDeleteConfirm(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-xs font-bold text-slate-400">Loading staff profile...</p>
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/accounts")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Accounts
        </button>
        <GlassCard className="p-10 text-center space-y-3 bg-white/70">
          <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <p className="text-sm font-black text-slate-700">User not found</p>
          <p className="text-xs text-slate-400 font-medium">This account may have been deleted or does not exist.</p>
        </GlassCard>
      </div>
    );
  }

  const initials = userData.email?.substring(0, 2).toUpperCase() || "??";
  const createdAt = userData.created_at ? new Date(userData.created_at) : null;
  const updatedAt = userData.updated_at ? new Date(userData.updated_at) : null;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.push("/accounts")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Registered Accounts
      </button>

      {/* Hero Profile Card */}
      <GlassCard className="p-8 bg-white/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div
            style={{ width: "80px", height: "80px" }}
            className={`rounded-2xl border flex items-center justify-center font-black text-2xl shrink-0 shadow-sm select-none ${getRoleBgColor(userData.role)}`}
          >
            {initials}
          </div>

          {/* Identity Block */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight truncate">{userData.email}</h2>
              <GlassBadge variant={userData.is_active ? "success" : "danger"}>
                {userData.is_active ? "Active Account" : "Inactive Account"}
              </GlassBadge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getRoleBgColor(userData.role)}`}>
                <Shield className="h-3 w-3" />
                {getRoleLabel(userData.role)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold font-mono">
              UID: {userData.id}
            </p>
          </div>

          {/* Delete Action */}
          <div className="shrink-0">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 text-rose-500 text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="flex flex-col gap-2 items-end">
                <p className="text-[10px] text-rose-600 font-bold">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information */}
        <GlassCard className="p-6 space-y-4 bg-white/70">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100/60">
            <User className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Account Information</h4>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Email Address</p>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-primary shrink-0" />
                  <p className="font-bold text-slate-700 truncate">{userData.email}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">System Role</p>
                <p className="font-bold text-slate-700">{getRoleLabel(userData.role)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Account Status</p>
                <div className="flex items-center gap-1.5">
                  {userData.is_active ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                  )}
                  <p className={`font-bold ${userData.is_active ? "text-emerald-600" : "text-rose-500"}`}>
                    {userData.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Account ID</p>
                <p className="font-mono font-bold text-[9px] text-slate-500 break-all">{userData.id}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Registration Timeline */}
        <GlassCard className="p-6 space-y-4 bg-white/70">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100/60">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registration Timeline</h4>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Registered On</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="font-bold text-slate-700">
                  {createdAt ? createdAt.toLocaleString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  }) : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Last Updated</p>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="font-bold text-slate-700">
                  {updatedAt ? updatedAt.toLocaleString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  }) : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50/50 border border-slate-200/40">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-1">Portal Access Privileges</p>
              <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                This account holds <span className="text-primary font-extrabold">{getRoleLabel(userData.role)}</span> level
                access within the AI-CHD-CDSS clinical portal. All actions performed by this account are
                tracked in the inference audit log.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Security & Compliance Notice */}
      <GlassCard className="p-5 bg-blue-50/40 border border-blue-200/30">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Security Notice</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Deleting this account will immediately revoke all portal access tokens and permissions.
              All historical prediction audit records and clinical activity logs associated with this account
              will be retained per HIPAA compliance policy. This action is irreversible.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
