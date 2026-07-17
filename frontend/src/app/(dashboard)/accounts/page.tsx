"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Users, UserCircle, Trash2, MessageSquare } from "lucide-react";
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

export default function RegisteredAccountsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [messageTargetUser, setMessageTargetUser] = useState<{ id: string; email: string } | null>(null);
  const [messageText, setMessageText] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!messageTargetUser || !messageText.trim()) return;
      await api.post("/api/v1/notifications/send", {
        recipient_id: messageTargetUser.id,
        message: messageText,
      });
    },
    onSuccess: () => {
      toast("Message sent successfully.", "success", "Message Sent");
      setMessageTargetUser(null);
      setMessageText("");
    },
    onError: (err: any) => {
      toast(err.response?.data?.detail || "Failed to send message.", "error", "Error");
    },
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["systemUsers"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/users");
      return res.data;
    }
  });

  const staffUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((u: any) => {
      const r = u.role?.toLowerCase() || "";
      return r !== "admin" && r !== "doctor";
    });
  }, [allUsers]);

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/v1/auth/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast("Staff user account has been successfully removed from the portal.", "success", "Account Deleted");
      setConfirmDeleteId(null);
    },
    onError: () => {
      toast("Failed to delete user account. Please try again.", "error", "Delete Failed");
      setConfirmDeleteId(null);
    }
  });

  const handleDelete = (userId: string) => {
    setDeletingId(userId);
    deleteMutation.mutate(userId);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registered Portal Accounts</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl">
            Audit registry of all active clinical staff and support accounts registered in the database, excluding doctors and system administrators.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <GlassCard className="p-6 space-y-6 bg-white/70">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100/60">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Registered Portal Accounts</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">System Metrics:</span>
            <GlassBadge variant="neutral">
              {staffUsers.length} Staff Registered
            </GlassBadge>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-xs font-bold text-slate-400">Querying security database...</span>
          </div>
        ) : staffUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/50">
            No active staff user accounts found in registry.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/40 bg-white/40 shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200/50 bg-slate-100/30 text-slate-400 uppercase text-[9px] tracking-wider font-extrabold select-none">
                  <th className="py-3.5 px-5">Staff Email</th>
                  <th className="py-3.5 px-5">Access Permission / Role</th>
                  <th className="py-3.5 px-5">Registered Date</th>
                  <th className="py-3.5 px-5 text-center">Account Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {staffUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-100/30 hover:bg-blue-50/20 transition group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-200/30 flex items-center justify-center text-primary font-black text-[10px] uppercase shrink-0 select-none">
                          {u.email.substring(0, 2)}
                        </div>
                        <span className="text-slate-800 font-bold">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-[10px] text-slate-500 uppercase">
                      {getRoleLabel(u.role)}
                    </td>
                    <td className="py-3 px-5 text-slate-500 font-medium">
                      {u.created_at ? new Date(u.created_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <GlassBadge variant={u.is_active ? "success" : "danger"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </GlassBadge>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Msg Button */}
                        <button
                          onClick={() => setMessageTargetUser({ id: u.id, email: u.email })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/40 text-emerald-600 text-[10px] font-bold transition hover:shadow-sm cursor-pointer"
                          title="Send message to this user"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Msg</span>
                        </button>

                        {/* View Profile Button */}
                        <button
                          onClick={() => router.push(`/accounts/${u.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/70 border border-blue-200/40 text-primary text-[10px] font-bold transition hover:shadow-sm cursor-pointer"
                          title="Open full profile"
                        >
                          <UserCircle className="h-3.5 w-3.5" />
                          <span>View Profile</span>
                        </button>

                        {/* Delete Button */}
                        {confirmDeleteId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={deletingId === u.id}
                              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold transition cursor-pointer disabled:opacity-60"
                            >
                              {deletingId === u.id ? "Deleting..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100/70 border border-rose-200/40 text-rose-500 text-[10px] font-bold transition hover:shadow-sm cursor-pointer"
                            title="Remove from portal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* --- Message Dialog Overlay --- */}
      {messageTargetUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl w-96 shadow-2xl shadow-slate-900/10 space-y-4 text-left">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Send Message
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                Recipient: <span className="text-slate-700 font-extrabold">{messageTargetUser.email}</span>
              </p>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white/70 outline-none focus:border-emerald-500/80 font-bold focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
              rows={4}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setMessageTargetUser(null);
                  setMessageText("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => sendMessageMutation.mutate()}
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
