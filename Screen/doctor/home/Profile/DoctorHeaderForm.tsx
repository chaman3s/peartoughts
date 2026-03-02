"use client";

import { useMemo, useState } from "react";
import Text from "@/Components/ui/Text";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import type { DoctorHeaderData } from "@/ContextApi/DoctorProfileContext";

type Props = {
  value: DoctorHeaderData;
  onSave: (updates: Partial<DoctorHeaderData>, tags: string[]) => void;
  onCancel: () => void;
};

type FieldErrors = {
  doctorName?: string;
  status?: string;
  doctorImage?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  patientsCount?: string;
  experienceYears?: string;
};

const STATUS_OPTIONS = ["online", "offline", "busy", "on leave"];

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getStatValueByLabel(stats: DoctorHeaderData["stats"], pattern: RegExp) {
  const found = stats.find((item) => pattern.test(item.label));
  return found?.value ?? "";
}

function getSavedTagsByEmail(email: string) {
  if (typeof window === "undefined") return "";
  if (!email.trim()) return "";

  const raw = window.localStorage.getItem("doctor_data");
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "";

    const match = parsed.find(
      (item) => (item?.doctorEmail ?? "").trim().toLowerCase() === email.trim().toLowerCase()
    );

    return Array.isArray(match?.tags) ? match.tags.join(", ") : "";
  } catch {
    return "";
  }
}

export default function DoctorHeaderForm({ value, onSave, onCancel }: Props) {
  const existingTags = getSavedTagsByEmail(value.doctorEmail ?? "");
  const [form, setForm] = useState({
    status: value.status ?? "",
    doctorName: value.doctorName ?? "",
    specialist: value.specialist ?? "",
    doctorDegree: value.doctorDegree ?? "",
    clinicLocation: value.clinicLocation ?? "",
    doctorImage: value.doctorImage ?? "",
    doctorEmail: value.doctorEmail ?? "",
    doctorPhone: String(value.doctorPhone ?? ""),
    patientsCount: getStatValueByLabel(value.stats, /patient/i).replace(/[^\d]/g, ""),
    experienceYears: getStatValueByLabel(value.stats, /experience/i).replace(/[^\d]/g, ""),
    tags: existingTags || "Online, Top Rated",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const canSubmit = useMemo(() => {
    return form.doctorName.trim().length > 0;
  }, [form.doctorName]);

  const updateField = (key: keyof typeof form, next: string) => {
    setForm((prev) => ({ ...prev, [key]: next }));
    if (errors[key as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!form.doctorName.trim()) {
      nextErrors.doctorName = "Doctor name is required.";
    }

    if (!form.status.trim()) {
      nextErrors.status = "Status is required.";
    }

    if (!form.doctorImage.trim()) {
      nextErrors.doctorImage = "Doctor image URL is required.";
    } else if (!isValidUrl(form.doctorImage.trim())) {
      nextErrors.doctorImage = "Enter a valid image URL.";
    }

    if (form.doctorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.doctorEmail.trim())) {
      nextErrors.doctorEmail = "Enter a valid email address.";
    }

    if (form.doctorPhone.trim() && !/^\d{7,15}$/.test(form.doctorPhone.trim())) {
      nextErrors.doctorPhone = "Phone should contain 7 to 15 digits.";
    }

    if (form.patientsCount.trim() && Number(form.patientsCount) < 0) {
      nextErrors.patientsCount = "Patients count cannot be negative.";
    }

    if (form.experienceYears.trim() && Number(form.experienceYears) < 0) {
      nextErrors.experienceYears = "Experience cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const existingPatients = value.stats.find((item) => /patient/i.test(item.label));
    const existingExperience = value.stats.find((item) => /experience/i.test(item.label));
    const otherStats = value.stats.filter(
      (item) => !/patient/i.test(item.label) && !/experience/i.test(item.label)
    );

    const nextStats = [
      {
        id: existingPatients?.id ?? "patients",
        label: existingPatients?.label ?? "Patients Treated",
        icon: existingPatients?.icon ?? null,
        value: form.patientsCount.trim() ? form.patientsCount.trim() : "0",
      },
      {
        id: existingExperience?.id ?? "experience",
        label: existingExperience?.label ?? "Years of Experience",
        icon: existingExperience?.icon ?? null,
        value: form.experienceYears.trim() ? form.experienceYears.trim() : "0",
      },
      ...otherStats,
    ];

    const parsedTags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      status: form.status.trim(),
      doctorName: form.doctorName.trim(),
      specialist: form.specialist.trim(),
      doctorDegree: form.doctorDegree.trim(),
      clinicLocation: form.clinicLocation.trim(),
      doctorImage: form.doctorImage.trim(),
      doctorEmail: form.doctorEmail.trim(),
      doctorPhone: form.doctorPhone.trim() ? Number(form.doctorPhone.trim()) : 0,
      stats: nextStats,
    }, parsedTags);
  };

  return (
    <Card>
      <VerticalContainer>
        <div className="p-6 space-y-5">
          <Text as="h2" className="text-xl font-semibold text-slate-900">
            Doctor Header Details
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Doctor Name *</Text>
              <input
                type="text"
                value={form.doctorName}
                onChange={(e) => updateField("doctorName", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Dr. John Doe"
              />
              {errors.doctorName && <Text className="text-xs text-red-600">{errors.doctorName}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Status *</Text>
              <input
                list="doctor-status-list"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="online"
              />
              <datalist id="doctor-status-list">
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {errors.status && <Text className="text-xs text-red-600">{errors.status}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Specialist</Text>
              <input
                type="text"
                value={form.specialist}
                onChange={(e) => updateField("specialist", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Cardiologist"
              />
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Doctor Degree</Text>
              <input
                type="text"
                value={form.doctorDegree}
                onChange={(e) => updateField("doctorDegree", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="MBBS, MD"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <Text className="text-sm text-slate-600">Clinic Location</Text>
              <input
                type="text"
                value={form.clinicLocation}
                onChange={(e) => updateField("clinicLocation", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="City Hospital, Mumbai"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <Text className="text-sm text-slate-600">Doctor Image URL *</Text>
              <input
                type="url"
                value={form.doctorImage}
                onChange={(e) => updateField("doctorImage", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {errors.doctorImage && <Text className="text-xs text-red-600">{errors.doctorImage}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Doctor Email</Text>
              <input
                type="email"
                value={form.doctorEmail}
                onChange={(e) => updateField("doctorEmail", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="doctor@example.com"
              />
              {errors.doctorEmail && <Text className="text-xs text-red-600">{errors.doctorEmail}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Doctor Phone</Text>
              <input
                type="tel"
                value={form.doctorPhone}
                onChange={(e) => updateField("doctorPhone", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="9876543210"
              />
              {errors.doctorPhone && <Text className="text-xs text-red-600">{errors.doctorPhone}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Number of Patients</Text>
              <input
                type="number"
                min={0}
                value={form.patientsCount}
                onChange={(e) => updateField("patientsCount", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="1500"
              />
              {errors.patientsCount && <Text className="text-xs text-red-600">{errors.patientsCount}</Text>}
            </label>

            <label className="space-y-1">
              <Text className="text-sm text-slate-600">Years of Experience</Text>
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => updateField("experienceYears", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="12"
              />
              {errors.experienceYears && <Text className="text-xs text-red-600">{errors.experienceYears}</Text>}
            </label>

            <label className="space-y-1 md:col-span-2">
              <Text className="text-sm text-slate-600">Tags (comma separated)</Text>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Heart Care, Online, Top Rated"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit}
              className="px-5 py-2 rounded-md bg-black text-white disabled:opacity-40"
            >
              Save Profile
            </button>
          </div>
        </div>
      </VerticalContainer>
    </Card>
  );
}
