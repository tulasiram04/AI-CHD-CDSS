"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";
import { BrainCircuit, Search, ShieldAlert, Cpu, ListCollapse, FileText, Activity } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";

export default function ClinicalPrediction() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const routerPatientId = searchParams.get("patient_id");
  const { toast } = useToast();

  // ALL hooks declared unconditionally BEFORE any early return
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [inputType, setInputType] = useState<"lookup" | "manual">("lookup");
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [age, setAge] = useState(60);
  const [gender, setGender] = useState(1);
  const [bmi, setBmi] = useState<number | string>(25.0);
  const [systolicBp, setSystolicBp] = useState<number | string>(120);
  const [diastolicBp, setDiastolicBp] = useState<number | string>(80);
  const [glucose, setGlucose] = useState<number | string>(90);
  const [heartRate, setHeartRate] = useState<number | string>(70);
  const [cholesterol, setCholesterol] = useState<number | string>(180);
  const [admissionFrequency, setAdmissionFrequency] = useState(1);
  const [medicationCount, setMedicationCount] = useState(1);

  // Comorbidity flags
  const [hypertension, setHypertension] = useState(0);
  const [diabetes, setDiabetes] = useState(0);
  const [smoking, setSmoking] = useState(0);
  const [previousCardiac, setPreviousCardiac] = useState(0);

  // Medication history
  const [statinHistory, setStatinHistory] = useState(0);
  const [betaBlockerHistory, setBetaBlockerHistory] = useState(0);
  const [aceArbHistory, setAceArbHistory] = useState(0);
  const [aspirinHistory, setAspirinHistory] = useState(0);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/api/v1/patients");
      return res.data;
    },
  });

  const autoFillPatient = (pId: string) => {
    const target = patients?.find((p: any) => String(p.patient_id) === pId);
    if (target) {
      setAge(target.age ?? 60);
      setGender(target.gender ?? 1);
      setBmi(target.bmi ?? "");
      setSystolicBp(target.systolic_bp ?? "");
      setDiastolicBp(target.diastolic_bp ?? "");
      setGlucose(target.glucose ?? "");
      setHeartRate(target.heart_rate ?? "");
      setCholesterol(target.cholesterol ?? "");
      setAdmissionFrequency(1);
      setMedicationCount(target.medication_count ?? 0);
      setHypertension(target.hypertension ?? 0);
      setDiabetes(target.diabetes ?? 0);
      setSmoking(target.smoking ?? 0);
      setPreviousCardiac(target.previous_cardiac ?? 0);
      setStatinHistory(target.statin_history ?? 0);
      setBetaBlockerHistory(target.beta_blocker_history ?? 0);
      setAceArbHistory(target.ace_arb_history ?? 0);
      setAspirinHistory(target.aspirin_history ?? 0);
      toast("Autofilled patient records for HADM ID: " + String(target.hadm_id) + ".", "info", "Cohort Autofill");
    }
  };

  useEffect(() => {
    if (routerPatientId && patients) {
      setSelectedPatientId(routerPatientId);
      setInputType("lookup");
      autoFillPatient(routerPatientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerPatientId, patients]);

  const shapMetrics = useMemo(() => {
    if (!inferenceResult) return [];
    const ageVal = Number(age);
    const sbpVal = Number(systolicBp) || 120;
    const glucVal = Number(glucose) || 90;
    const contributions = [
      { name: "Chronological Age",           val: ageVal > 50 ? (ageVal - 50) * 0.006 : -0.015,     color: ageVal > 50 ? "bg-rose-400" : "bg-emerald-400" },
      { name: "Blood Pressure Range",        val: sbpVal > 130 ? (sbpVal - 130) * 0.005 : -0.01,    color: sbpVal > 130 ? "bg-rose-400" : "bg-emerald-400" },
      { name: "Fasting Glucose Levels",      val: glucVal > 100 ? (glucVal - 100) * 0.004 : -0.008, color: glucVal > 100 ? "bg-rose-400" : "bg-emerald-400" },
      { name: "Active Tobacco Smoking",      val: smoking === 1 ? 0.065 : -0.015,                   color: smoking === 1 ? "bg-rose-400" : "bg-emerald-400" },
      { name: "Prior Cardiovascular Events", val: previousCardiac === 1 ? 0.095 : -0.02,            color: previousCardiac === 1 ? "bg-rose-400" : "bg-emerald-400" },
    ];
    return contributions.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  }, [inferenceResult, age, systolicBp, glucose, smoking, previousCardiac]);

  // Access guard -- AFTER all hooks
  const isAllowed = user?.role === "admin" || user?.role === "doctor";
  if (!isAllowed) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Inference Engine Access Restricted
            <ShieldAlert className="h-5 w-5 text-slate-500" />
          </h2>
        </div>
        <GlassCard className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 bg-white/60">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            Access Restricted: Doctor Scope Only
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Running ML inference and 10-year calibrated risk estimations is restricted to doctors and administrators.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInferenceResult(null);
    try {
      if (inputType === "lookup" && selectedPatientId) {
        const target = patients?.find((p: any) => String(p.patient_id) === selectedPatientId);
        if (target && target.hadm_id) {
          const res = await api.post("/api/v1/predict/admission/" + String(target.hadm_id));
          setInferenceResult(res.data);
          toast("Calibrated CHD risk evaluation calculated successfully.", "success", "Evaluation Complete");
        } else {
          toast("Selected patient admission details not found.", "error", "Lookup Failed");
        }
      } else {
        const payload = {
          age: Number(age),
          gender: Number(gender),
          bmi: bmi !== "" ? Number(bmi) : null,
          systolic_bp: systolicBp !== "" ? Number(systolicBp) : null,
          diastolic_bp: diastolicBp !== "" ? Number(diastolicBp) : null,
          glucose: glucose !== "" ? Number(glucose) : null,
          heart_rate: heartRate !== "" ? Number(heartRate) : null,
          cholesterol: cholesterol !== "" ? Number(cholesterol) : null,
          admission_frequency: Number(admissionFrequency),
          medication_count: Number(medicationCount),
          hypertension: Number(hypertension),
          diabetes: Number(diabetes),
          smoking: Number(smoking),
          previous_cardiac: Number(previousCardiac),
          statin_history: Number(statinHistory),
          beta_blocker_history: Number(betaBlockerHistory),
          ace_arb_history: Number(aceArbHistory),
          aspirin_history: Number(aspirinHistory),
        };
        const res = await api.post("/api/v1/predict", payload);
        setInferenceResult(res.data);
        toast("Manual inputs risk estimation calculated successfully.", "success", "Evaluation Complete");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Connection failure with ML Inference Engine.";
      toast(msg, "error", "Inference Failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CIRC = 2 * Math.PI * 68;
  const riskPct = inferenceResult
    ? Math.min(1, Math.max(0, inferenceResult.calibrated_probability))
    : 0;

  /**
   * Centralized risk classification for the Manual Parameter Entry result card.
   * Single source of truth — all display elements (gauge colour, badge variant,
   * badge label, recommendation context) derive from this one function.
   *
   * Thresholds (ACC/AHA borderline-risk stratification):
   *   0.000 – 0.049  →  Low Risk      (green)
   *   0.050 – 0.074  →  Borderline Risk (yellow)
   *   0.075 – 0.199  →  Moderate Risk  (orange/amber)
   *   0.200 +        →  High Risk      (red)
   */
  function classifyRisk(prob: number): {
    label: string;
    variant: "success" | "warning" | "danger";
    gaugeColor: string;
    borderColor: string;
  } {
    if (prob < 0.05) {
      return { label: "Low Risk",       variant: "success", gaugeColor: "#22C55E", borderColor: "border-emerald-200" };
    } else if (prob < 0.075) {
      return { label: "Borderline Risk", variant: "warning", gaugeColor: "#EAB308", borderColor: "border-yellow-200" };
    } else if (prob < 0.20) {
      return { label: "Moderate Risk",  variant: "warning", gaugeColor: "#F97316", borderColor: "border-orange-200" };
    } else {
      return { label: "High Risk",      variant: "danger",  gaugeColor: "#DC2626", borderColor: "border-rose-200" };
    }
  }

  // Derived classification — consistent for every element in the result card
  const riskClass = inferenceResult ? classifyRisk(riskPct) : null;
  const strokeColor = riskClass?.gaugeColor ?? "#22C55E";

  const comorbidityFields = [
    { label: "Essential Hypertension",   val: hypertension,       set: setHypertension },
    { label: "Type 2 Diabetes Mellitus", val: diabetes,           set: setDiabetes },
    { label: "Active Tobacco Smoking",   val: smoking,            set: setSmoking },
    { label: "Prior Cardiac Event",      val: previousCardiac,    set: setPreviousCardiac },
    { label: "Statin Therapy",           val: statinHistory,      set: setStatinHistory },
    { label: "Beta Blocker Therapy",     val: betaBlockerHistory, set: setBetaBlockerHistory },
    { label: "ACE Inhibitor / ARB",      val: aceArbHistory,      set: setAceArbHistory },
    { label: "Aspirin Therapy",          val: aspirinHistory,     set: setAspirinHistory },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical CHD Prediction Engine</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Real-time cardiovascular risk modeling via Staging CatBoost classification pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-6 bg-white/70">
            {/* Mode Tab */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-xl gap-2 select-none border border-slate-200/20">
              <button
                type="button"
                onClick={() => setInputType("lookup")}
                className={"flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition cursor-pointer " + (inputType === "lookup" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800")}
              >
                ICU Patient Lookup
              </button>
              <button
                type="button"
                onClick={() => setInputType("manual")}
                className={"flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition cursor-pointer " + (inputType === "manual" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800")}
              >
                Manual Parameter Entry
              </button>
            </div>

            <form onSubmit={handlePredictSubmit} className="space-y-4">
              {inputType === "lookup" && (
                <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5" /> Select Patient Admission
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => { setSelectedPatientId(e.target.value); autoFillPatient(e.target.value); }}
                    className="w-full bg-white border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-primary transition cursor-pointer"
                  >
                    <option value="">Choose patient (ID / HADM ID)...</option>
                    {patients?.map((p: any) => (
                      <option key={p.hadm_id || p.patient_id} value={String(p.patient_id)}>
                        {"Patient #" + String(p.patient_id).slice(0, 8) + "... (HADM: " + String(p.hadm_id) + " - Age: " + String(p.age) + ")"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vitals Grid */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">
                  Telemetry Vitals &amp; Labs
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Age (Years)</label>
                    <input type="number" value={age} min={0} max={120} step="1" required
                      onChange={(e) => setAge(Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Biological Gender</label>
                    <select value={gender} onChange={(e) => setGender(Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer">
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">BMI</label>
                    <input type="number" step="0.1" value={bmi} placeholder="Optional"
                      onChange={(e) => setBmi(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Systolic BP (mmHg)</label>
                    <input type="number" value={systolicBp} placeholder="Optional"
                      onChange={(e) => setSystolicBp(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Diastolic BP (mmHg)</label>
                    <input type="number" value={diastolicBp} placeholder="Optional"
                      onChange={(e) => setDiastolicBp(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Glucose (mg/dL)</label>
                    <input type="number" value={glucose} placeholder="Optional"
                      onChange={(e) => setGlucose(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Heart Rate (bpm)</label>
                    <input type="number" value={heartRate} placeholder="Optional"
                      onChange={(e) => setHeartRate(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Cholesterol (mg/dL)</label>
                    <input type="number" value={cholesterol} placeholder="Optional"
                      onChange={(e) => setCholesterol(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Admission Count</label>
                    <input type="number" value={admissionFrequency} min={0} step="1"
                      onChange={(e) => setAdmissionFrequency(Number(e.target.value))}
                      disabled={inputType === "lookup"}
                      className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-semibold" />
                  </div>
                </div>
              </div>

              {/* Comorbidities */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">
                  Comorbidity &amp; Medication History
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {comorbidityFields.map(({ label, val, set }) => (
                    <label key={label} className="flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 transition cursor-pointer select-none">
                      <input type="checkbox" checked={val === 1}
                        onChange={(e) => set(e.target.checked ? 1 : 0)}
                        disabled={inputType === "lookup"}
                        className="rounded border-slate-300 h-4 w-4" />
                      <span className="text-xs font-extrabold text-slate-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                className="w-full py-3.5 mt-4 text-xs font-black uppercase tracking-wider"
                disabled={isSubmitting || (inputType === "lookup" && !selectedPatientId)}
              >
                <BrainCircuit className="h-4 w-4 animate-pulse" />
                <span>{isSubmitting ? "Executing Inference Pipeline..." : "Estimate CHD Adverse Event Risk"}</span>
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 flex flex-col items-center text-center gap-6 min-h-[500px] relative overflow-hidden bg-white/70">
            {!inferenceResult ? (
              <div className="my-auto space-y-3 flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-50/50 rounded-full border border-blue-100/30 flex items-center justify-center text-primary animate-pulse">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Awaiting Estimation</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
                  Fill out clinical demographics, vitals, and comorbidity checklists, then run the risk model.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-6">
                {/* Gauge */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stratified Risk Outcome</span>
                  <div className="relative h-44 w-44 flex items-center justify-center mt-2">
                    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                      <circle cx="80" cy="80" r="68" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="80" cy="80" r="68"
                        stroke={strokeColor}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={CIRC}
                        strokeDashoffset={CIRC - CIRC * riskPct}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center space-y-0.5">
                      <span className="text-3xl font-black tracking-tight text-slate-800 leading-none">
                        {(riskPct * 100).toFixed(1)}%
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">10-yr CHD risk</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
                    <GlassBadge variant={riskClass?.variant ?? "success"}>
                      {riskClass?.label ?? ""}
                    </GlassBadge>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      Raw: {(inferenceResult.raw_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Latency */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span className="flex items-center gap-1.5"><Cpu className="h-4 w-4" /> Latency:</span>
                  <span className="text-slate-700">{inferenceResult.execution_latency_ms.toFixed(1)} ms</span>
                </div>

                {/* Recommendations */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ListCollapse className="h-4 w-4" /> Recommendations ({inferenceResult.recommendations.length})
                  </span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {inferenceResult.recommendations.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-3">No specific recommendations generated.</p>
                    ) : (
                      inferenceResult.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-primary uppercase text-[8px] tracking-wider">{rec.category}</span>
                            {rec.clinical_justification && <span className="text-[8px] text-slate-400">Justified</span>}
                          </div>
                          <p className="text-slate-600 font-semibold leading-relaxed">{rec.recommendation_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Feature Contributions */}
                <div className="space-y-2 text-left pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="h-4 w-4" /> Feature Risk Contributions
                  </span>
                  <div className="space-y-2 text-[10px]">
                    {shapMetrics.map((sm, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-600">
                          <span>{sm.name}</span>
                          <span className={sm.val > 0 ? "text-rose-500" : "text-emerald-500"}>
                            {sm.val > 0
                              ? "+" + (sm.val * 100).toFixed(1) + "%"
                              : (sm.val * 100).toFixed(1) + "%"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={"h-full rounded-full " + sm.color + " transition-all duration-700"}
                            style={{ width: String(Math.min(100, Math.abs(sm.val) * 400)) + "%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <GlassButton
                    variant="secondary"
                    className="flex-1 py-2.5 text-[10px] uppercase font-black"
                    onClick={() => { window.print(); toast("Report generated for printing.", "success", "Print"); }}
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>Print Summary</span>
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    className="flex-1 py-2.5 text-[10px] uppercase font-black"
                    onClick={() => { setInferenceResult(null); toast("Ready for new prediction.", "info", "Reset"); }}
                  >
                    <BrainCircuit className="h-4 w-4 text-slate-400" />
                    <span>New Prediction</span>
                  </GlassButton>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
