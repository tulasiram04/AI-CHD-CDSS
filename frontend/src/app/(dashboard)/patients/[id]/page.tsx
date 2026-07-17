"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Activity,
  Heart,
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  ClipboardList,
  FileSpreadsheet,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Percent,
  Calendar,
  Settings,
  UploadCloud,
  FileText,
  Activity as HeartPulse,
  ShieldAlert,
  X
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export default function PatientDetailsHub() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "labs" | "history" | "predictions">("overview");

  // Modal actions states
  const [activeActionModal, setActiveActionModal] = useState<null | "demographics" | "vitals" | "labs" | "ecg" | "radiology">(null);

  // Demographics form fields
  const [demoAge, setDemoAge] = useState<number>(0);
  const [demoGender, setDemoGender] = useState<number>(1);

  // Vitals form fields
  const [vitalSbp, setVitalSbp] = useState<string>("");
  const [vitalDbp, setVitalDbp] = useState<string>("");
  const [vitalHr, setVitalHr] = useState<string>("");
  const [vitalBmi, setVitalBmi] = useState<string>("");

  // Labs form fields
  const [labName, setLabName] = useState<string>("");
  const [labValue, setLabValue] = useState<string>("");
  const [labUnit, setLabUnit] = useState<string>("mg/dL");
  const [labComments, setLabComments] = useState<string>("");

  // ECG form fields
  const [ecgHr, setEcgHr] = useState<string>("");
  const [ecgPr, setEcgPr] = useState<string>("");
  const [ecgQrs, setEcgQrs] = useState<string>("");
  const [ecgQt, setEcgQt] = useState<string>("");
  const [ecgInterpretation, setEcgInterpretation] = useState<string>("");

  // Radiology form fields
  const [radModality, setRadModality] = useState<string>("CT");
  const [radExamName, setRadExamName] = useState<string>("");
  const [radFindings, setRadFindings] = useState<string>("");
  const [radImpression, setRadImpression] = useState<string>("");

  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // 1. Fetch single patient details
  const { data: patient, isLoading: patientLoading, refetch: refetchPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/patients/${patientId}`);
      return res.data;
    },
  });

  // 2. Fetch specific patient's prediction audits
  const { data: patientPredictions } = useQuery({
    queryKey: ["audits", "patient", patient?.patient_uuid],
    queryFn: async () => {
      if (!patient || patient.patient_uuid === "[DE-IDENTIFIED]") return [];
      try {
        const res = await api.get(`/api/v1/audits?patient_uuid=${patient.patient_uuid}`);
        return res.data.filter((a: any) => a.model_version !== "mock-1");
      } catch (err: any) {
        if (err.response?.status === 403) return [];
        throw err;
      }
    },
    enabled: !!patient && patient.patient_uuid !== "[DE-IDENTIFIED]",
  });

  // Set initial demographic values when demographics modal opens
  const openDemographics = () => {
    if (patient) {
      setDemoAge(patient.age);
      setDemoGender(patient.gender);
      setActiveActionModal("demographics");
    }
  };

  // Set initial vitals values when vitals modal opens
  const openVitals = () => {
    if (patient) {
      setVitalSbp(patient.systolic_bp?.toString() || "");
      setVitalDbp(patient.diastolic_bp?.toString() || "");
      setVitalHr(patient.heart_rate?.toString() || "");
      setVitalBmi(patient.bmi?.toString() || "");
      setActiveActionModal("vitals");
    }
  };

  const handleUpdateDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await api.put(`/api/v1/patients/${patient.patient_id}`, {
        age: demoAge,
        gender: demoGender
      });
      toast("Patient demographics updated successfully.", "success", "Demographics Updated");
      refetchPatient();
      setActiveActionModal(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to update demographics.", "error", "Update Failed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await api.post(`/api/v1/patients/${patient.patient_id}/vitals`, {
        systolic_bp: vitalSbp ? parseFloat(vitalSbp) : null,
        diastolic_bp: vitalDbp ? parseFloat(vitalDbp) : null,
        heart_rate: vitalHr ? parseFloat(vitalHr) : null,
        bmi: vitalBmi ? parseFloat(vitalBmi) : null
      });
      toast("Telemetry vitals updated successfully.", "success", "Vitals Updated");
      refetchPatient();
      setActiveActionModal(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to update vitals.", "error", "Update Failed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUploadLabs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await api.post(`/api/v1/patients/${patient.patient_id}/labs`, {
        lab_name: labName,
        result_value: parseFloat(labValue),
        unit: labUnit,
        comments: labComments || null
      });
      toast("Laboratory report uploaded successfully.", "success", "Lab Uploaded");
      refetchPatient();
      setLabName("");
      setLabValue("");
      setLabComments("");
      setActiveActionModal(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to upload labs.", "error", "Upload Failed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUploadEcg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await api.post(`/api/v1/patients/${patient.patient_id}/ecg`, {
        heart_rate: parseFloat(ecgHr),
        pr_interval_ms: ecgPr ? parseFloat(ecgPr) : null,
        qrs_duration_ms: ecgQrs ? parseFloat(ecgQrs) : null,
        qt_interval_ms: ecgQt ? parseFloat(ecgQt) : null,
        interpretation: ecgInterpretation
      });
      toast("ECG telemetry trace trace logged.", "success", "ECG Uploaded");
      refetchPatient();
      setEcgHr("");
      setEcgPr("");
      setEcgQrs("");
      setEcgQt("");
      setEcgInterpretation("");
      setActiveActionModal(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to upload ECG.", "error", "Upload Failed");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUploadRadiology = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await api.post(`/api/v1/patients/${patient.patient_id}/radiology`, {
        modality: radModality,
        exam_name: radExamName,
        findings: radFindings,
        impression: radImpression
      });
      toast("Radiology report modality upload completed.", "success", "Radiology Uploaded");
      refetchPatient();
      setRadExamName("");
      setRadFindings("");
      setRadImpression("");
      setActiveActionModal(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to upload radiology report.", "error", "Upload Failed");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (patientLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span className="text-xs font-bold text-slate-400 animate-pulse">Loading Patient Health Records...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/patients")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patient Registry
        </button>
        <GlassCard className="p-8 text-center text-rose-500 text-xs font-bold">
          Patient Record not found in this clinical cohort.
        </GlassCard>
      </div>
    );
  }

  const risk = patient.chd_risk_score;
  const isHighRisk = risk !== null && risk !== undefined && risk >= 0.20;

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/patients")}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 hover:text-slate-600 transition cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to registry
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Chart</h2>
        </div>

        {user && ["admin", "doctor"].includes(user.role.toLowerCase()) && (
          <GlassButton variant="primary" size="sm" onClick={() => router.push(`/predict?patient_id=${patient.patient_id}`)}>
            <BrainCircuit className="h-4 w-4" />
            <span>Execute Risk Estimation</span>
          </GlassButton>
        )}
      </div>

      {/* Hero Demographics Header Card */}
      <GlassCard className="p-6 relative bg-white/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Avatar and basic demographics */}
          <div className="flex items-center gap-4 border-r border-slate-200/50 pr-4 md:col-span-2">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-primary flex items-center justify-center font-black text-2xl border border-blue-200/30 shrink-0">
              {patient.gender === 1 ? "M" : "F"}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-800 leading-tight">
                  {patient.name || "Patient Chart"}
                </h3>
                <GlassBadge variant={risk === null || risk === undefined ? "neutral" : isHighRisk ? "danger" : risk >= 0.10 ? "warning" : "success"}>
                  {risk === null || risk === undefined ? "N/A" : isHighRisk ? "High Risk" : risk >= 0.10 ? "Moderate" : "Low Risk"}
                </GlassBadge>
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate select-all">{patient.patient_uuid}</p>
              <div className="flex items-center gap-3 text-slate-500 font-bold text-xs mt-1">
                <span>{patient.age} Years Old</span>
                <span>•</span>
                <span>{patient.gender === 1 ? "Male" : "Female"}</span>
              </div>
            </div>
          </div>

          {/* Admission indicators */}
          <div className="space-y-1.5 border-r border-slate-200/50 pr-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Admission Details</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>HADM ID: {patient.hadm_id}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Admitted: {patient.admittime ? new Date(patient.admittime).toLocaleDateString() : "N/A"}
            </p>
          </div>

          {/* Core Risk estimation score */}
          <div className="text-left md:text-right space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Calibrated CHD Risk</span>
            <div className="flex items-baseline md:justify-end gap-1">
              <span className={`text-3xl font-black ${risk === null || risk === undefined ? "text-slate-400" : (risk * 100) >= 20 ? "text-rose-600" : (risk * 100) >= 10 ? "text-amber-500" : "text-emerald-600"}`}>
                {risk === null || risk === undefined ? "N/A" : `${(risk * 100).toFixed(1)}%`}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">10-year risk</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">
              Computed staging pipeline probability estimation.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/50 gap-4 overflow-x-auto pb-px scrollbar-none select-none">
        {(["overview", "vitals", "labs", "history", "predictions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Telemetry Vitals</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Blood Pressure Range</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {patient.systolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg` : "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Capillary Glucose</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {patient.glucose ? `${patient.glucose} mg/dL` : "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Body Mass Index</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {patient.bmi ? `${patient.bmi.toFixed(1)} kg/m²` : "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Mean ECG Heart Rate</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {patient.heart_rate ? `${patient.heart_rate} bpm` : "N/A"}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Risk Checklist</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Hypertension history:</span>
                  <GlassBadge variant={patient.hypertension === 1 ? "danger" : "neutral"}>
                    {patient.hypertension === 1 ? "Positive" : "Negative"}
                  </GlassBadge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Type-2 Diabetes:</span>
                  <GlassBadge variant={patient.diabetes === 1 ? "danger" : "neutral"}>
                    {patient.diabetes === 1 ? "Positive" : "Negative"}
                  </GlassBadge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Active Smoking status:</span>
                  <GlassBadge variant={patient.smoking === 1 ? "danger" : "neutral"}>
                    {patient.smoking === 1 ? "Positive" : "Negative"}
                  </GlassBadge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Prior Cardiac Events:</span>
                  <GlassBadge variant={patient.previous_cardiac === 1 ? "danger" : "neutral"}>
                    {patient.previous_cardiac === 1 ? "Positive" : "Negative"}
                  </GlassBadge>
                </div>
              </div>
            </GlassCard>

            {user && (
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Settings className="h-4.5 w-4.5 text-slate-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Actions Hub</h4>
                </div>
                <div className="space-y-2">
                  {/* Demographics update: Admin, Doctor, Nurse */}
                  {["admin", "doctor", "nurse"].includes(user.role.toLowerCase()) && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-xs font-bold border-slate-200/60 hover:bg-slate-50"
                      onClick={openDemographics}
                    >
                      <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                      <span>Edit Demographics</span>
                    </GlassButton>
                  )}

                  {/* Vitals update: Admin, Doctor, Nurse */}
                  {["admin", "doctor", "nurse"].includes(user.role.toLowerCase()) && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-xs font-bold border-slate-200/60 hover:bg-slate-50"
                      onClick={openVitals}
                    >
                      <HeartPulse className="h-4 w-4 mr-2 text-rose-500" />
                      <span>Update Vitals</span>
                    </GlassButton>
                  )}

                  {/* Upload Labs: Admin, Doctor, Lab Tech */}
                  {["admin", "doctor", "lab tech"].includes(user.role.toLowerCase()) && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-xs font-bold border-slate-200/60 hover:bg-slate-50"
                      onClick={() => setActiveActionModal("labs")}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>Upload Lab Results</span>
                    </GlassButton>
                  )}

                  {/* Upload ECG: Admin, Doctor, ECG Tech */}
                  {["admin", "doctor", "ecg tech"].includes(user.role.toLowerCase()) && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-xs font-bold border-slate-200/60 hover:bg-slate-50"
                      onClick={() => setActiveActionModal("ecg")}
                    >
                      <Activity className="h-4 w-4 mr-2 text-sky-500" />
                      <span>Upload ECG Trace</span>
                    </GlassButton>
                  )}

                  {/* Upload Radiology: Admin, Doctor, Radiology Tech */}
                  {["admin", "doctor", "radiology tech"].includes(user.role.toLowerCase()) && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-xs font-bold border-slate-200/60 hover:bg-slate-50"
                      onClick={() => setActiveActionModal("radiology")}
                    >
                      <UploadCloud className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Upload Radiology Report</span>
                    </GlassButton>
                  )}
                  
                  {/* Informational banner if no actions are available */}
                  {!["admin", "doctor", "nurse", "lab tech", "ecg tech", "radiology tech"].includes(user.role.toLowerCase()) && (
                    <div className="text-[10px] text-slate-400 font-semibold text-center py-2 bg-slate-50 border border-slate-100 rounded-xl">
                      No document upload or edit privileges for role: {user.role}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === "vitals" && (
          <GlassCard className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Lab Vitals Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Systolic BP</span>
                <p className="text-xl font-black text-slate-800">
                  {patient.systolic_bp ? `${patient.systolic_bp} mmHg` : "N/A"}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (patient.systolic_bp || 0) >= 140
                        ? "bg-rose-500"
                        : (patient.systolic_bp || 0) >= 130
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((patient.systolic_bp || 120) / 200) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diastolic BP</span>
                <p className="text-xl font-black text-slate-800">
                  {patient.diastolic_bp ? `${patient.diastolic_bp} mmHg` : "N/A"}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (patient.diastolic_bp || 0) >= 90
                        ? "bg-rose-500"
                        : (patient.diastolic_bp || 0) >= 80
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((patient.diastolic_bp || 80) / 120) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Heart Rate</span>
                <p className="text-xl font-black text-slate-800">
                  {patient.heart_rate ? `${patient.heart_rate} bpm` : "N/A"}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((patient.heart_rate || 70) / 180) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Labs Tab */}
        {activeTab === "labs" && (
          <GlassCard className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Laboratory Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Serum Cholesterol</span>
                  <span className="text-slate-800">{patient.cholesterol ? `${patient.cholesterol} mg/dL` : "N/A"}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (patient.cholesterol || 0) >= 240 ? "bg-rose-500" : (patient.cholesterol || 0) >= 200 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((patient.cholesterol || 180) / 400) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Glucose (Fasting Proxy)</span>
                  <span className="text-slate-800">{patient.glucose ? `${patient.glucose} mg/dL` : "N/A"}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (patient.glucose || 0) >= 126 ? "bg-rose-500" : (patient.glucose || 0) >= 100 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((patient.glucose || 90) / 300) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Medical History Tab */}
        {activeTab === "history" && (
          <GlassCard className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Active Prescriptions & Medications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <span>Statin Therapy</span>
                <GlassBadge variant={patient.statin_history === 1 ? "success" : "neutral"}>
                  {patient.statin_history === 1 ? "Active" : "None"}
                </GlassBadge>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <span>Beta Blockers</span>
                <GlassBadge variant={patient.beta_blocker_history === 1 ? "success" : "neutral"}>
                  {patient.beta_blocker_history === 1 ? "Active" : "None"}
                </GlassBadge>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <span>ACE/ARB Inhibitors</span>
                <GlassBadge variant={patient.ace_arb_history === 1 ? "success" : "neutral"}>
                  {patient.ace_arb_history === 1 ? "Active" : "None"}
                </GlassBadge>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <span>Aspirin therapy</span>
                <GlassBadge variant={patient.aspirin_history === 1 ? "success" : "neutral"}>
                  {patient.aspirin_history === 1 ? "Active" : "None"}
                </GlassBadge>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium pt-2">
              Total Medication Burden Count: {patient.medication_count} active prescriptions.
            </p>
          </GlassCard>
        )}

        {/* Prediction History Tab */}
        {activeTab === "predictions" && (
          <GlassCard className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Calibrated Estimation Timeline
            </h4>
            {patientPredictions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold">
                No past prediction runs found for this patient in the audit trail. 
                Use "Execute Risk Estimation" to run the first analysis.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-slate-200/60 space-y-4 text-xs font-bold">
                {patientPredictions.map((aud: any) => {
                  const isHigh = aud.predicted_risk >= 0.20;
                  return (
                    <div key={aud.id} className="relative">
                      <span className="absolute -left-[30px] top-0.5 h-4.5 w-4.5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <span className={`h-2.5 w-2.5 rounded-full ${isHigh ? "bg-rose-500" : "bg-emerald-500"}`} />
                      </span>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-800">CHD Estimation Executed</p>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Calibrated risk score: {(aud.predicted_risk * 100).toFixed(1)}% ({aud.risk_level})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(aud.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md p-6 relative bg-white/95 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveActionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            {activeActionModal === "demographics" && (
              <form onSubmit={handleUpdateDemographics} className="space-y-4 text-xs font-bold text-slate-700">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b">Edit Demographics</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={demoAge}
                      onChange={(e) => setDemoAge(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Gender</label>
                    <select
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      value={demoGender}
                      disabled={user?.role.toLowerCase() === "nurse"}
                      onChange={(e) => setDemoGender(parseInt(e.target.value))}
                    >
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                    {user?.role.toLowerCase() === "nurse" && (
                      <span className="text-[10px] text-amber-600 block mt-1 font-semibold">
                        Nurses are restricted from modifying gender records.
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={() => setActiveActionModal(null)}>Cancel</GlassButton>
                  <GlassButton type="submit" variant="primary" style={{ backgroundColor: "#4C6F87", color: "#fff" }} disabled={submittingAction}>
                    {submittingAction ? "Saving..." : "Save Demographics"}
                  </GlassButton>
                </div>
              </form>
            )}

            {activeActionModal === "vitals" && (
              <form onSubmit={handleUpdateVitals} className="space-y-4 text-xs font-bold text-slate-700">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b">Update Telemetry Vitals</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      max="250"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={vitalSbp}
                      onChange={(e) => setVitalSbp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="150"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={vitalDbp}
                      onChange={(e) => setVitalDbp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="220"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={vitalHr}
                      onChange={(e) => setVitalHr(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">BMI (kg/m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="10"
                      max="80"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={vitalBmi}
                      onChange={(e) => setVitalBmi(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={() => setActiveActionModal(null)}>Cancel</GlassButton>
                  <GlassButton type="submit" variant="primary" style={{ backgroundColor: "#4C6F87", color: "#fff" }} disabled={submittingAction}>
                    {submittingAction ? "Saving..." : "Save Vitals"}
                  </GlassButton>
                </div>
              </form>
            )}

            {activeActionModal === "labs" && (
              <form onSubmit={handleUploadLabs} className="space-y-4 text-xs font-bold text-slate-700">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b">Upload Lab Results</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Lab Parameter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Capillary Glucose, Serum Cholesterol"
                      required
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Result Value</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                        value={labValue}
                        onChange={(e) => setLabValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Unit of Measure</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                        value={labUnit}
                        onChange={(e) => setLabUnit(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Clinician Comments</label>
                    <textarea
                      placeholder="Notes regarding abnormal values..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                      value={labComments}
                      onChange={(e) => setLabComments(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={() => setActiveActionModal(null)}>Cancel</GlassButton>
                  <GlassButton type="submit" variant="primary" style={{ backgroundColor: "#4C6F87", color: "#fff" }} disabled={submittingAction}>
                    {submittingAction ? "Uploading..." : "Upload Result"}
                  </GlassButton>
                </div>
              </form>
            )}

            {activeActionModal === "ecg" && (
              <form onSubmit={handleUploadEcg} className="space-y-4 text-xs font-bold text-slate-700">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b">Upload ECG Trace Parameters</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="250"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={ecgHr}
                      onChange={(e) => setEcgHr(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">PR Interval (ms)</label>
                    <input
                      type="number"
                      placeholder="e.g. 160"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={ecgPr}
                      onChange={(e) => setEcgPr(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">QRS Duration (ms)</label>
                    <input
                      type="number"
                      placeholder="e.g. 90"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={ecgQrs}
                      onChange={(e) => setEcgQrs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">QT Interval (ms)</label>
                    <input
                      type="number"
                      placeholder="e.g. 400"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={ecgQt}
                      onChange={(e) => setEcgQt(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Interpretation findings</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Normal Sinus Rhythm, Left bundle branch block"
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                    value={ecgInterpretation}
                    onChange={(e) => setEcgInterpretation(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={() => setActiveActionModal(null)}>Cancel</GlassButton>
                  <GlassButton type="submit" variant="primary" style={{ backgroundColor: "#4C6F87", color: "#fff" }} disabled={submittingAction}>
                    {submittingAction ? "Uploading..." : "Upload Trace"}
                  </GlassButton>
                </div>
              </form>
            )}

            {activeActionModal === "radiology" && (
              <form onSubmit={handleUploadRadiology} className="space-y-4 text-xs font-bold text-slate-700">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b">Upload Radiology Report</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Modality</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                        value={radModality}
                        onChange={(e) => setRadModality(e.target.value)}
                      >
                        <option value="CT">CT Scan</option>
                        <option value="MRI">MRI</option>
                        <option value="X-ray">Chest X-ray</option>
                        <option value="Ultrasound">Echocardiogram</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Exam Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Chest CT Angiogram"
                        required
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                        value={radExamName}
                        onChange={(e) => setRadExamName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Diagnostic Findings</label>
                    <textarea
                      placeholder="Detailed findings here..."
                      required
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                      value={radFindings}
                      onChange={(e) => setRadFindings(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Impression / Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Plaque, calcified lesions"
                      required
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-primary"
                      value={radImpression}
                      onChange={(e) => setRadImpression(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={() => setActiveActionModal(null)}>Cancel</GlassButton>
                  <GlassButton type="submit" variant="primary" style={{ backgroundColor: "#4C6F87", color: "#fff" }} disabled={submittingAction}>
                    {submittingAction ? "Uploading..." : "Upload Report"}
                  </GlassButton>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
