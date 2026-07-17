"use client";

import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  User,
  Key,
  Bell,
  Shield,
  Building,
  History,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  CheckCircle,
  Laptop,
  Globe,
  MapPin
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";

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

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile fields states
  const [fullName, setFullName] = useState("Dr. Sarah Jenkins");
  const [license, setLicense] = useState("MD-99887766");
  const [dept, setDept] = useState("Coronary Care Unit (CCU)");
  const [hospital, setHospital] = useState("Metro General Hospital");
  const [designation, setDesignation] = useState("Senior Consultant Cardiologist");
  const [phone, setPhone] = useState("+1 (555) 998-8776");
  const [experience, setExperience] = useState("12 Years");
  const [qualification, setQualification] = useState("MD, DM (Cardiology)");

  // Password fields states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Avatar state
  const [avatarInitials, setAvatarInitials] = useState("SJ");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Preferences States
  const [prefPrediction, setPrefPrediction] = useState(true);
  const [prefHighRisk, setPrefHighRisk] = useState(true);
  const [prefNewPatient, setPrefNewPatient] = useState(true);
  const [prefCritical, setPrefCritical] = useState(true);
  const [prefReport, setPrefReport] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefBrowser, setPrefBrowser] = useState(true);
  const [prefSystem, setPrefSystem] = useState(false);

  // Password strength logic
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return "weak";
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
    if (hasLetters && hasNumbers && hasSpecial && newPassword.length >= 8) return "strong";
    return "medium";
  }, [newPassword]);

  // Form Submit Handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Update avatar initials to match updated name
    const initials = fullName
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr." && n.toLowerCase() !== "dr")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    if (initials) {
      setAvatarInitials(initials);
    }
    toast("Professional information updated successfully in clinical directory.", "success", "Profile Updated");
  };

  const handleCancelProfile = () => {
    // Reset to defaults
    setFullName("Dr. Sarah Jenkins");
    setLicense("MD-99887766");
    setDept("Coronary Care Unit (CCU)");
    setHospital("Metro General Hospital");
    setDesignation("Senior Consultant Cardiologist");
    setPhone("+1 (555) 998-8776");
    setExperience("12 Years");
    setQualification("MD, DM (Cardiology)");
    toast("Changes discarded.", "info", "Action Cancelled");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please complete all password fields.", "warning", "Validation Failed");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.", "error", "Validation Failed");
      return;
    }
    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters.", "warning", "Validation Failed");
      return;
    }
    toast("Password security credentials successfully updated. Next rotation required in 90 days.", "success", "Password Updated");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePreferences = () => {
    toast("Notification configuration preferences saved successfully.", "success", "Preferences Saved");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast("Profile image uploaded successfully.", "success", "Upload Complete");
    }
  };

  const handleRemoveImage = () => {
    toast("Profile image restored to system default.", "info", "Image Removed");
  };

  const handleLogoutOtherDevices = () => {
    toast("All other active device sessions successfully terminated.", "success", "Sessions Cleared");
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Account Settings</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl">
            Manage your professional profile, security settings, hospital information, notification preferences and account activity.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Profile, Security Status, Notifications) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section 1: Profile Card */}
          <GlassCard className="p-6 text-center space-y-5 bg-white/70">
            <div className="relative flex justify-center">
              <div
                style={{ width: "96px", height: "96px" }}
                className="rounded-full bg-blue-500/10 border border-blue-200/50 flex items-center justify-center font-black text-4xl text-primary shadow-sm select-none shrink-0"
              >
                {avatarInitials}
              </div>
            </div>

            {/* Upload/Remove Action row */}
            <div className="flex items-center justify-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <GlassButton variant="secondary" size="sm" onClick={handleUploadClick}>
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
              </GlassButton>
              <GlassButton variant="secondary" size="sm" onClick={handleRemoveImage} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </GlassButton>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{fullName}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-wide">
                {getRoleLabel(user?.role || "")}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {dept} • {hospital}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100/60 text-left space-y-2 text-xs text-slate-500 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor ID:</span>
                <span className="text-slate-700 font-mono">DOC-2026-9812</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License:</span>
                <span className="text-slate-700 font-mono">{license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-700 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-700">{phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100/60 flex flex-wrap gap-2 justify-center">
              <GlassBadge variant="primary">{user?.role} Access</GlassBadge>
              <GlassBadge variant="success">Active Session</GlassBadge>
              <GlassBadge variant="success">Verified License</GlassBadge>
            </div>

            <div className="pt-4 border-t border-slate-100/60 text-left space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>PROFILE COMPLETION</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </GlassCard>

          {/* Section 4: Security Status (HIPAA/GDPR compliance info) */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <Shield className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Security Status</h4>
            </div>
            
            <div className="space-y-3 text-xs text-slate-500 font-semibold">
              <div className="flex justify-between items-center">
                <span>HIPAA Compliance</span>
                <GlassBadge variant="success">Passed</GlassBadge>
              </div>
              <div className="flex justify-between items-center">
                <span>GDPR Compliance</span>
                <GlassBadge variant="success">Active</GlassBadge>
              </div>
              <div className="flex justify-between items-center">
                <span>Medical License Verification</span>
                <GlassBadge variant="success">Verified</GlassBadge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Login:</span>
                <span className="text-slate-700">Today, 09:03 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Password Change:</span>
                <span className="text-slate-700">14 Days Ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Device:</span>
                <span className="text-slate-700">Windows Desktop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Browser:</span>
                <span className="text-slate-700">Chrome 124.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operating System:</span>
                <span className="text-slate-700">Windows 11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session Timeout:</span>
                <span className="text-slate-700">30 Min (Active)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100/60 flex gap-2 justify-center">
              <GlassBadge variant="success">Verified</GlassBadge>
              <GlassBadge variant="primary">Active</GlassBadge>
              <GlassBadge variant="success">Protected</GlassBadge>
            </div>
          </GlassCard>

          {/* Section 6: Notification Preferences */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <Bell className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notification Preferences</h4>
            </div>

            <div className="space-y-4">
              {/* Event Alerts */}
              <div className="space-y-2.5">
                <h5 className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Alert Trigger Events</h5>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefPrediction}
                    onChange={(e) => setPrefPrediction(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>Prediction Completed</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefHighRisk}
                    onChange={(e) => setPrefHighRisk(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>High Risk Patient Alerts</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefNewPatient}
                    onChange={(e) => setPrefNewPatient(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>New Patient Assigned</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefCritical}
                    onChange={(e) => setPrefCritical(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>Critical Alerts</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefReport}
                    onChange={(e) => setPrefReport(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>Report Ready</span>
                </label>
              </div>

              {/* Channels */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100/60">
                <h5 className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Delivery Channels</h5>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefEmail}
                    onChange={(e) => setPrefEmail(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>Email Notifications</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefBrowser}
                    onChange={(e) => setPrefBrowser(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>Browser Notifications</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefSystem}
                    onChange={(e) => setPrefSystem(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-slate-300"
                  />
                  <span>System Announcements</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <GlassButton variant="primary" size="sm" onClick={handleSavePreferences}>
                  Save Preferences
                </GlassButton>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column (Forms, Hosp Info, Password, Log, Device) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Section 2: Professional Information */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <User className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Professional Information</h4>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Medical License Number</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Hospital Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Hospital / Institution</label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Experience (Years)</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-primary transition"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] text-slate-400 uppercase">Clinician Email (Managed Globally)</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-slate-100/30 border border-slate-200/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <GlassButton type="button" variant="secondary" size="sm" onClick={handleCancelProfile}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm">
                  Save Changes
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Section 3: Hospital Information (Read-Only) */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <Building className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hospital Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Hospital Name</span>
                <span className="text-slate-800 text-xs font-bold">{hospital}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Department</span>
                <span className="text-slate-800 text-xs font-bold">{dept}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Ward Assignments</span>
                <span className="text-slate-800 text-xs font-bold">Cardiac ICU - Ward 4A</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Clinician Identifier</span>
                <span className="text-slate-800 text-xs font-bold">DOC-2026-9812</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Hospital Email Direct</span>
                <span className="text-slate-800 text-xs font-bold">s.jenkins@metro-hospital.org</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Office Extension</span>
                <span className="text-slate-800 text-xs font-bold">ext. 4410</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Office Location</span>
                <span className="text-slate-800 text-xs font-bold">Building B, 4th Floor, Suite 412</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Working Shift</span>
                <span className="text-slate-800 text-xs font-bold">Day Shift (07:00 AM - 04:00 PM)</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] text-slate-400 font-bold leading-normal uppercase">
                This section is managed by the Clinical Administration and is read-only.
              </span>
            </div>
          </GlassCard>

          {/* Section 5: Password & Security */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <Key className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Password & Security</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Current Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary transition font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary transition font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Show password and Strength Meter */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1">
                {/* Show password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-800 transition uppercase tracking-wider font-extrabold cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                </button>

                {/* Password strength meter */}
                {newPassword && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase">STRENGTH:</span>
                    <div className="flex gap-1">
                      <div className={`h-1.5 w-6 rounded-full ${
                        passwordStrength === "weak" ? "bg-rose-500" :
                        passwordStrength === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <div className={`h-1.5 w-6 rounded-full ${
                        passwordStrength === "weak" ? "bg-slate-200" :
                        passwordStrength === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <div className={`h-1.5 w-6 rounded-full ${
                        passwordStrength === "strong" ? "bg-emerald-500" : "bg-slate-200"
                      }`} />
                    </div>
                    <span className={`text-[10px] uppercase font-black ${
                      passwordStrength === "weak" ? "text-rose-500" :
                      passwordStrength === "medium" ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <GlassButton type="submit" variant="primary" size="sm">
                  Update Password
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Section 7: Recent Account Activity (Timeline) */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <History className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Account Activity</h4>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l border-slate-200/60 ml-2.5 space-y-5 text-xs font-semibold">
              <div className="relative">
                {/* Bullet */}
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Recent Login</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Active clinician session established successfully.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">Today, 09:03 AM</span>
                </div>
              </div>

              <div className="relative">
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Patient Registered</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Created registry record for patient UUID: <span className="font-mono">rbac-patient-1111</span>.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">Yesterday, 02:45 PM</span>
                </div>
              </div>

              <div className="relative">
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Prediction Generated</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Executed CHD 10-year calibrated risk estimation for HADM ID: 888001.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">July 14, 11:30 AM</span>
                </div>
              </div>

              <div className="relative">
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Report Downloaded</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Exported patient risk audit log CSV for cardiology cohort.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">July 13, 04:15 PM</span>
                </div>
              </div>

              <div className="relative">
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Profile Updated</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Professional designation and years of experience revised.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">July 10, 10:00 AM</span>
                </div>
              </div>

              <div className="relative">
                <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Password Changed</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quarterly secure API credential rotation completed successfully.</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">July 02, 09:00 AM</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 8: Active Device */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100/60">
              <Laptop className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Device</h4>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center font-bold">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span>Windows 11</span>
                    <span className="inline-block h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wide">Current Session</span>
                  </h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" /> Chrome</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" /> 192.168.1.104</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> Cardiology Office, Metro Hospital</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <GlassButton variant="danger" size="sm" onClick={handleLogoutOtherDevices} className="w-full sm:w-auto bg-rose-50 border-rose-200/50 text-rose-600 hover:bg-rose-100/60 shadow-none">
                  Logout Other Devices
                </GlassButton>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
}
