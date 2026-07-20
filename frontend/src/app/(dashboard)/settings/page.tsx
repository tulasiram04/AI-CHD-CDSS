"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/lib/api";
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
  MapPin,
  Lock,
  Loader2,
  FileText
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";

// Helper to format date cleanly
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

// Simple User Agent Parser
const parseUserAgent = (ua: string) => {
  let os = "Windows Desktop";
  let browser = "Chrome";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/edge|edg/i.test(ua)) browser = "Edge";
  else if (/opr/i.test(ua)) browser = "Opera";

  return { os, browser };
};

export default function ProfileSettings() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states for fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [officeExtension, setOfficeExtension] = useState("");
  const [bio, setBio] = useState("");

  // Password fields states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Crop Modal States
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  // Client-side user agent details
  const [uaDetails, setUaDetails] = useState({ os: "Windows Desktop", browser: "Chrome" });
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUaDetails(parseUserAgent(navigator.userAgent));
    }
  }, []);

  // Fetch Consolidated Profile data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/api/v1/profile/me");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,  // 10 minutes
  });

  // Fetch Activity Log data
  const { data: activityLogs = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["profileActivity"],
    queryFn: async () => {
      const res = await api.get("/api/v1/profile/activity");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Synchronize state when data is loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setExperience(profile.experience || "");
      setQualification(profile.qualification || "");
      setEmergencyContact(profile.emergency_contact || "");
      setOfficeExtension(profile.office_extension || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await api.put("/api/v1/profile", updatedData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["profileActivity"] });
      toast("Professional information updated successfully.", "success", "Profile Updated");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to update profile.";
      toast(msg, "error", "Update Failed");
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/api/v1/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profileActivity"] });
      toast("Profile photo updated successfully.", "success", "Upload Complete");
      setShowCropModal(false);
      setImageSrc(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to upload photo.";
      toast(msg, "error", "Upload Failed");
    }
  });

  const removePhotoMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/api/v1/profile/photo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profileActivity"] });
      toast("Profile photo removed successfully.", "info", "Photo Removed");
    },
    onError: () => {
      toast("Failed to remove photo.", "error", "Action Failed");
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const res = await api.put("/api/v1/profile/password", passwordData);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.session_revoked) {
        toast("Password updated successfully. Please log in again.", "success", "Security Updated");
        setTimeout(() => {
          logout();
        }, 1500);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to update password.";
      toast(msg, "error", "Update Failed");
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (notifData: any) => {
      const res = await api.put("/api/v1/profile/notifications", notifData);
      return res.data;
    },
    onMutate: async (newPrefs) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const previousProfile = queryClient.getQueryData(["profile"]);
      if (previousProfile) {
        queryClient.setQueryData(["profile"], {
          ...previousProfile,
          notifications: {
            ...(previousProfile as any).notifications,
            ...newPrefs
          }
        });
      }
      return { previousProfile };
    },
    onError: (err, newPrefs, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }
      toast("Failed to update notification preferences.", "error", "Save Failed");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profileActivity"] });
      toast("Notification preferences saved successfully.", "success", "Preferences Saved");
    }
  });

  // Password strength logic
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return "weak";
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
    if (hasLetters && hasNumbers && hasSpecial && newPassword.length >= 10) return "strong";
    return "medium";
  }, [newPassword]);

  // Image Cropping canvas mechanics
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast("File exceeds 5MB limit.", "warning", "Validation Failed");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setImageOffset({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  // Dragging handlers for crop frame
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setImageOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const executeCropAndUpload = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw user's zoomed/offset image inside the square crop box
      const scale = zoom;
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 256);

      ctx.translate(128, 128);
      ctx.scale(scale, scale);
      
      const drawX = imageOffset.x / scale - img.width / 2;
      const drawY = imageOffset.y / scale - img.height / 2;
      
      ctx.drawImage(img, drawX, drawY, img.width, img.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "profile_photo.png", { type: "image/png" });
          const formData = new FormData();
          formData.append("file", file);
          uploadPhotoMutation.mutate(formData);
        }
      }, "image/png");
    };
  };

  // Save changes handler for info form
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      full_name: fullName,
      phone,
      experience,
      qualification,
      emergency_contact: emergencyContact,
      office_extension: officeExtension,
      bio
    });
  };

  const handleCancelProfile = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setExperience(profile.experience || "");
      setQualification(profile.qualification || "");
      setEmergencyContact(profile.emergency_contact || "");
      setOfficeExtension(profile.office_extension || "");
      setBio(profile.bio || "");
      toast("Changes discarded.", "info", "Action Discarded");
    }
  };

  // Password update submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please fill in all password fields.", "warning", "Validation Failed");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.", "error", "Validation Failed");
      return;
    }
    if (newPassword.length < 8) {
      toast("New password must be at least 8 characters.", "warning", "Validation Failed");
      return;
    }
    updatePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
  };

  // Notification Save handler
  const handleSavePreferences = () => {
    if (profile) {
      updateNotificationsMutation.mutate(profile.notifications);
    }
  };

  // Browser Permission Request
  const handleToggleBrowserNotification = async (checked: boolean) => {
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      updateNotificationsMutation.mutate({
        pref_browser: permission === "granted",
        browser_permission: permission
      });
    } else {
      updateNotificationsMutation.mutate({ pref_browser: checked });
    }
  };

  // UI helpers for notifications permission labels
  const getPermissionLabel = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return "Not Supported";
    const status = Notification.permission;
    if (status === "granted") return "Granted";
    if (status === "denied") return "Blocked";
    return "Allow Notifications";
  };

  // Initial Avatar logic
  const avatarInitials = useMemo(() => {
    if (!fullName) return "ST";
    return fullName
      .split(" ")
      .filter((n) => !/^dr\.?$/i.test(n))
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [fullName]);

  // Loading indicator screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-bold text-text-muted">Fetching clinician profile from registry...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="text-center p-12 bg-rose-50 border border-rose-200/50 rounded-2xl">
        <h3 className="text-sm font-black text-rose-700">Failed to load registry profile</h3>
        <p className="text-xs text-rose-500/80 mt-1 font-semibold">Please check your network credentials or session login.</p>
        <GlassButton variant="primary" onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} className="mt-4">
          Retry Fetch
        </GlassButton>
      </div>
    );
  }

  const { completion, notifications, security } = profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-text-main tracking-tight">Account Settings</h2>
          <p className="text-xs text-text-muted font-semibold leading-relaxed max-w-2xl">
            Manage your clinical credentials, security preferences, notification channels and view session audit logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Avatar, Security Metrics, Notifications) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Profile Card */}
          <GlassCard className="p-6 text-center space-y-5 bg-white/70">
            <div className="relative flex justify-center">
              {profile.photo_url ? (
                <div className="relative group">
                  <img
                    src={`${api.defaults.baseURL}${profile.photo_url}`}
                    alt={fullName}
                    style={{ width: "96px", height: "96px" }}
                    className="rounded-full object-cover border border-brand-light shadow-sm bg-background"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>
              ) : (
                <div
                  style={{ width: "96px", height: "96px" }}
                  className="rounded-full bg-secondary-bg border border-brand-light flex items-center justify-center font-black text-4xl text-primary shadow-sm select-none shrink-0"
                >
                  {avatarInitials}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              <GlassButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                <span>Replace</span>
              </GlassButton>
              {profile.photo_url && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => removePhotoMutation.mutate()}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50"
                  disabled={removePhotoMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </GlassButton>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-text-main tracking-tight">{fullName || "Not Provided"}</h3>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
                {profile.role.toUpperCase()}
              </p>
              <p className="text-[10px] text-text-muted/80 font-medium">
                {profile.department || "No Department Assigned"} • {profile.hospital || "No Hospital Registered"}
              </p>
            </div>

            {/* Profile Completion */}
            <div className="pt-4 border-t border-brand-light/30 text-left space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-text-main">
                <span>PROFILE COMPLETION</span>
                <span>{completion.percentage}% ({completion.completed}/{completion.total})</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-brand-light/30 text-left space-y-2 text-xs text-text-main/80 font-semibold">
              <div className="flex justify-between">
                <span className="text-text-muted/70">Staff User ID:</span>
                <span className="text-text-main font-mono text-[10px] truncate max-w-[150px]">{profile.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Medical License:</span>
                <span className="text-text-main font-mono">{profile.license_number || "Not Provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Email Address:</span>
                <span className="text-text-main truncate max-w-[150px]">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Registry Phone:</span>
                <span className="text-text-main">{profile.phone || "Not Provided"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-light/30 flex flex-wrap gap-2 justify-center">
              <GlassBadge variant="primary">{profile.role.toUpperCase()} ACCESS</GlassBadge>
              <GlassBadge variant="success">SECURE SYSTEM</GlassBadge>
              {profile.license_number && <GlassBadge variant="success">VERIFIED LICENSE</GlassBadge>}
            </div>
          </GlassCard>

          {/* Security Status */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <Shield className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Security Metrics</h4>
            </div>
            
            <div className="space-y-3 text-xs text-text-main/80 font-semibold">
              <div className="flex justify-between items-center">
                <span>Registry Authorization</span>
                <GlassBadge variant="success">{security.account_status}</GlassBadge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Last Portal Login:</span>
                <span className="text-text-main text-[10px]">{formatDate(security.last_login)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Password Rotated:</span>
                <span className="text-text-main text-[10px]">{formatDate(security.last_password_changed_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Active Sessions:</span>
                <span className="text-text-main">1 (This Browser)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/70">Total Audited Events:</span>
                <span className="text-text-main font-mono">{security.total_activity_count}</span>
              </div>
            </div>
          </GlassCard>

          {/* Notification Preferences */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <Bell className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Alert Configuration</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <h5 className="text-[9px] text-text-muted/80 uppercase tracking-wider font-extrabold">Trigger Criteria</h5>
                
                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_prediction}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_prediction: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>Prediction Completed</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_high_risk}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_high_risk: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>High Risk Patient Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_new_patient}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_new_patient: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>New Patient Assigned</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_critical}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_critical: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>Critical System Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_report}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_report: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>Report Compilation Ready</span>
                </label>
              </div>

              <div className="space-y-2.5 pt-2.5 border-t border-brand-light/30">
                <h5 className="text-[9px] text-text-muted/80 uppercase tracking-wider font-extrabold">Delivery Channels</h5>
                
                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_email}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_email: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>Email Channel</span>
                </label>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pref_browser}
                      onChange={(e) => handleToggleBrowserNotification(e.target.checked)}
                      className="accent-primary h-4 w-4 rounded border-brand-light"
                    />
                    <span>Browser Banner Alerts</span>
                  </label>
                  <span className="text-[9px] font-bold text-text-muted/70 uppercase">
                    ({getPermissionLabel()})
                  </span>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_system}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_system: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>System Console Log Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-text-main font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pref_sms}
                    onChange={(e) => updateNotificationsMutation.mutate({ pref_sms: e.target.checked })}
                    className="accent-primary h-4 w-4 rounded border-brand-light"
                  />
                  <span>SMS Integration (Backup)</span>
                </label>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column (Editable Profile, Password, Activity Logs, Session info) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Professional Information form */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <User className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Clinician Profile Directory</h4>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-bold text-text-main">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Full Display Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="Dr. Full Name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Primary Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Experience Period</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="e.g. 10 Years"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Academic Qualifications</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="e.g. MD, DM Cardiology"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Emergency Notification Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="Contact Name / Phone"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Office Extension Line</label>
                  <input
                    type="text"
                    value={officeExtension}
                    onChange={(e) => setOfficeExtension(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs"
                    placeholder="ext. 1234"
                  />
                </div>

              </div>

              {/* Bio Section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-text-muted uppercase">Professional Bio Statement</label>
                  <span className="text-[8px] font-bold text-text-muted/60">{bio.length}/500 chars</span>
                </div>
                <textarea
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-main outline-none focus:border-primary transition shadow-xs resize-none"
                  placeholder="Describe your specialties, current ward clinical duties or board background..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <GlassButton type="button" variant="secondary" size="sm" onClick={handleCancelProfile}>
                  Discard Changes
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile Details"}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Hospital & Credentials (Administrative Read-Only) */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <Building className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Administrative Credentials</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-text-main">
              
              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">Clinician Registered Hospital</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5">{profile.hospital || "Not Configured"}</span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">Cardiology Department Assignment</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5">{profile.department || "Not Assigned"}</span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">Authorized Portal Role</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5 uppercase">{profile.role}</span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">Hospital Designation</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5">{profile.designation || "Not Provided"}</span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">Medical Council Affiliation</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5">{profile.medical_council || "Not Provided"}</span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-text-muted uppercase block">License Expiry Date</span>
                <div className="relative flex items-center">
                  <span className="text-text-main text-xs font-bold py-1.5">
                    {profile.license_expiry ? new Date(profile.license_expiry).toLocaleDateString() : "Not Provided"}
                  </span>
                  <Lock className="h-3 w-3 text-text-muted/40 ml-1.5" />
                </div>
              </div>

            </div>

            <div className="mt-3 p-3 rounded-xl bg-secondary-bg/30 border border-brand-light/20 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] text-text-muted font-bold leading-normal uppercase">
                These credentials are locked and managed solely by Clinical Administration.
              </span>
            </div>
          </GlassCard>

          {/* Password Section */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <Key className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Credential Security</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold text-text-main">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Current Registry Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition font-mono shadow-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition font-mono shadow-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-brand-light/50 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition font-mono shadow-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-text-main transition uppercase tracking-wider font-extrabold cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showPassword ? "Hide Characters" : "Show Characters"}</span>
                </button>

                {newPassword && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted/80 uppercase">STRENGTH:</span>
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
                <GlassButton type="submit" variant="primary" size="sm" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? "Processing..." : "Update System Password"}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Activity Timeline logs */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center justify-between pb-2 border-b border-brand-light/30">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Clinician Portal Audit Trail</h4>
              </div>
              <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Last 5 Updates
              </span>
            </div>

            {isActivityLoading ? (
              <p className="text-xs text-text-muted animate-pulse">Loading audit trail logs...</p>
            ) : activityLogs.length === 0 ? (
              <p className="text-xs text-text-muted font-bold text-center py-4">No recent portal activities recorded.</p>
            ) : (
              <div className="relative pl-6 border-l border-brand-light/40 ml-2.5 space-y-5 text-xs font-semibold text-text-main">
                {activityLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="relative">
                    <div style={{ left: "-31px" }} className="absolute top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-xs flex items-center justify-center">
                      <div className="h-1 w-1 bg-white rounded-full" />
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h5 className="font-bold text-text-main text-xs">{log.activity_type}</h5>
                        {log.details && (
                          <p className="text-[10px] text-text-muted mt-0.5 font-medium">{log.details}</p>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-text-muted/80 whitespace-nowrap uppercase mt-0.5">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Active Device Session */}
          <GlassCard className="p-6 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-light/30">
              <Laptop className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Active Device Node</h4>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-text-main">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary-bg/60 text-primary flex items-center justify-center font-bold">
                  <Laptop className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-bold text-text-main text-xs flex items-center gap-1.5">
                    <span>{uaDetails.os}</span>
                    <span className="inline-block h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-wide">Connected Node</span>
                  </h5>
                  <p className="text-[10px] text-text-muted font-medium flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" /> {uaDetails.browser}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">IP: Secure Client API connection</span>
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

      {/* Image Crop Modal Overlay */}
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-light max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            
            <div className="p-5 border-b border-brand-light/20 flex justify-between items-center">
              <h3 className="text-sm font-black text-text-main uppercase tracking-wide">Adjust Profile Picture</h3>
              <button
                type="button"
                className="text-text-muted hover:text-text-main font-bold cursor-pointer text-xs uppercase"
                onClick={() => {
                  setShowCropModal(false);
                  setImageSrc(null);
                }}
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[11px] text-text-muted font-semibold leading-relaxed">
                Drag the image inside the crop boundary area to center your profile face correctly. Use the zoom slider below.
              </p>

              {/* Drag/Crop Zone */}
              <div
                className="relative overflow-hidden w-full h-[240px] rounded-xl border border-brand-light/40 bg-slate-50 flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {/* Crop Box Circular boundary indicator */}
                <div className="absolute inset-0 z-10 border-[30px] border-white/80 pointer-events-none flex items-center justify-center">
                  <div className="w-[180px] h-[180px] rounded-full border border-primary/50 shadow-inner bg-transparent" />
                </div>

                {/* Visible Image */}
                <img
                  src={imageSrc}
                  alt="Pre-crop"
                  onLoad={handleImageLoad}
                  style={{
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
                    maxHeight: "80%",
                    maxWidth: "80%",
                    transition: isDragging ? "none" : "transform 0.1s ease-out"
                  }}
                  className="pointer-events-none object-contain"
                />
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-text-muted uppercase font-bold">
                  <span>Zoom Level</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-brand-light/20 flex justify-end gap-3">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCropModal(false);
                  setImageSrc(null);
                }}
              >
                Discard
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={executeCropAndUpload}
                disabled={uploadPhotoMutation.isPending}
              >
                {uploadPhotoMutation.isPending ? "Cropping..." : "Apply & Upload"}
              </GlassButton>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
