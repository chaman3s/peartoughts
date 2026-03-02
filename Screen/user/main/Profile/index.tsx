"use client";

import { useEffect, useState } from "react";
import { Card } from "@/Components/ui/Card";
import Button from "@/Components/ui/Button";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  PhoneCall,
  Pencil,
  Pill,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

type Gender = "Male" | "Female" | "Other";

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  bloodGroup: string;
  height: string;
  weight: string;
  lifestyle: string;
  insuranceProvider: string;
  policyNumber: string;
  medicalHistory: string;
  noKnownAllergies: boolean;
  allergyDetail: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
};

const defaultFormState: ProfileFormState = {
  fullName: "Alexander Bennett",
  email: "alex.bennett@schedula.com",
  phone: "+1 (555) 123-4567",
  dob: "1990-05-15",
  gender: "Male",
  bloodGroup: "B+",
  height: "182",
  weight: "78",
  lifestyle: "Moderately Active",
  insuranceProvider: "Blue Cross Shield",
  policyNumber: "BCS-8922-9921",
  medicalHistory: "Mild hypertension. Corrective lenses used for myopia.",
  noKnownAllergies: false,
  allergyDetail: "Peanuts (Severe)",
  emergencyContactName: "Sarah Bennett",
  emergencyRelationship: "Spouse",
  emergencyPhone: "+1 (555) 987-1234",
};

const documents = [
  { title: "Blood Test Results", date: "Oct 24, 2023" },
  { title: "X-Ray Report", date: "Sep 12, 2023" },
];

const inputClassName =
  "h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white";
const labelClassName = "mb-2 block text-sm font-medium text-slate-700";

function formatDate(dateValue: string) {
  if (!dateValue) return "N/A";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function UserProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileFormState>(defaultFormState);
  const [formData, setFormData] = useState<ProfileFormState>(defaultFormState);
  const [showSuccessPopup, setShowSuccessPopup] = useState(() => {
    if (typeof window === "undefined") return false;
    const shouldShow = window.sessionStorage.getItem("profile_updated_success") === "1";
    if (shouldShow) {
      window.sessionStorage.removeItem("profile_updated_success");
    }
    return shouldShow;
  });

  function updateField<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function openEditor() {
    setFormData(savedProfile);
    setIsEditing(true);
  }

  function handleSave() {
    setSavedProfile(formData);
    setIsEditing(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("profile_updated_success", "1");
    }
    setShowSuccessPopup(true);
    router.push("/home/Profile");
  }

  function handleCancel() {
    setFormData(savedProfile);
    setIsEditing(false);
  }

  const heightCm = Number.parseFloat(savedProfile.height);
  const weightKg = Number.parseFloat(savedProfile.weight);
  const bmiValue = heightCm > 0 && weightKg > 0 ? weightKg / ((heightCm / 100) * (heightCm / 100)) : null;
  const bmiText = bmiValue ? `${bmiValue.toFixed(1)} (${bmiValue < 25 ? "Normal" : "High"})` : "N/A";
  const personalInfo = [
    { label: "Full Name", value: savedProfile.fullName },
    { label: "Email", value: savedProfile.email },
    { label: "Phone", value: savedProfile.phone },
    { label: "Gender", value: savedProfile.gender },
    { label: "Date of Birth", value: formatDate(savedProfile.dob) },
    { label: "Blood Group", value: savedProfile.bloodGroup, badge: true },
    { label: "Height", value: savedProfile.height ? `${savedProfile.height} cm` : "N/A" },
    { label: "Weight", value: savedProfile.weight ? `${savedProfile.weight} kg` : "N/A" },
    { label: "BMI", value: bmiText },
    { label: "Lifestyle", value: savedProfile.lifestyle },
  ];
  const medicalConditions = savedProfile.medicalHistory
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ title: item, detail: "From profile form" }));
  const allergies = savedProfile.noKnownAllergies
    ? ["No known allergies"]
    : savedProfile.allergyDetail
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const emergencyContacts = [
    { label: "Contact Name", value: savedProfile.emergencyContactName },
    { label: "Relationship", value: savedProfile.emergencyRelationship },
    { label: "Phone", value: savedProfile.emergencyPhone },
  ];

  useEffect(() => {
    if (!showSuccessPopup) return;
    const timer = window.setTimeout(() => setShowSuccessPopup(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccessPopup]);

  if (isEditing) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">
        <section className="mx-auto max-w-[1400px] space-y-4 md:space-y-5">
          <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900">Edit Profile</h1>
              <p className="mt-1 text-sm text-slate-500">Manage your personal information and health records.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
              >
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          </header>

          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserRound size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Full Name</label>
                <input
                  className={inputClassName}
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Email Address</label>
                <input
                  className={inputClassName}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Phone Number</label>
                <input
                  className={inputClassName}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Date of Birth</label>
                <input
                  type="date"
                  className={inputClassName}
                  value={formData.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className={labelClassName}>Gender</p>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {(["Male", "Female", "Other"] as Gender[]).map((gender) => (
                    <label key={gender} className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === gender}
                        onChange={() => updateField("gender", gender)}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClassName}>Blood Group</label>
                <select
                  className={inputClassName}
                  value={formData.bloodGroup}
                  onChange={(e) => updateField("bloodGroup", e.target.value)}
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className={labelClassName}>Height (cm)</label>
                <input
                  className={inputClassName}
                  value={formData.height}
                  onChange={(e) => updateField("height", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Weight (kg)</label>
                <input
                  className={inputClassName}
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Lifestyle</label>
                <select
                  className={inputClassName}
                  value={formData.lifestyle}
                  onChange={(e) => updateField("lifestyle", e.target.value)}
                >
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-orange-100 bg-orange-50 p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ShieldCheck size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Insurance Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Insurance Provider</label>
                <input
                  className={inputClassName}
                  value={formData.insuranceProvider}
                  onChange={(e) => updateField("insuranceProvider", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Policy Number</label>
                <input
                  className={inputClassName}
                  value={formData.policyNumber}
                  onChange={(e) => updateField("policyNumber", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-red-100 bg-red-50 p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Stethoscope size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Medical History</h2>
            </div>
            <label className={labelClassName}>Conditions / Notes</label>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
              value={formData.medicalHistory}
              onChange={(e) => updateField("medicalHistory", e.target.value)}
            />
          </Card>

          <Card className="rounded-2xl border-yellow-200 bg-yellow-50 p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                <AlertTriangle size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Allergies</h2>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.noKnownAllergies}
                onChange={(e) => updateField("noKnownAllergies", e.target.checked)}
              />
              No known allergies
            </label>
            <div className="mt-4">
              <label className={labelClassName}>Allergy Detail</label>
              <input
                className={inputClassName}
                value={formData.allergyDetail}
                onChange={(e) => updateField("allergyDetail", e.target.value)}
                disabled={formData.noKnownAllergies}
              />
            </div>
          </Card>

          <Card className="rounded-2xl border-blue-100 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <PhoneCall size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Emergency Contact</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Contact Name</label>
                <input
                  className={inputClassName}
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField("emergencyContactName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName}>Relationship</label>
                <input
                  className={inputClassName}
                  value={formData.emergencyRelationship}
                  onChange={(e) => updateField("emergencyRelationship", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Contact Phone</label>
                <input
                  className={inputClassName}
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                />
              </div>
            </div>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      {showSuccessPopup && (
        <div className="fixed right-4 top-4 z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-100 shadow-lg">
          <div className="flex items-center gap-4 border-l-8 border-emerald-500 px-5 py-5">
            <CheckCircle2 size={36} className="text-emerald-600" />
            <p className="text-3xl font-medium text-emerald-700">Profile updated successfully!</p>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-[1400px] space-y-4 md:space-y-5">
        <header className="flex justify-end">
          <Button
            type="button"
            onClick={openEditor}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-5 py-3 text-sm text-white hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Profile
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl border-slate-200 bg-white p-0 xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <UserRound size={14} />
                </span>
                <h2 className="text-2xl font-semibold text-slate-900">Personal Information</h2>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={openEditor}
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2">
              {personalInfo.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
                  {item.badge ? (
                    <span className="mt-1.5 inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                      {item.value}
                    </span>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Stethoscope size={16} />
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">Medical Conditions</h3>
              </div>
              <div className="mt-4 space-y-2.5">
                {medicalConditions.map((condition) => (
                  <div key={condition.title} className="rounded-2xl bg-white px-3.5 py-3">
                    <div className="flex items-start gap-2">
                      <Pill size={14} className="mt-0.5 text-red-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{condition.title}</p>
                        <p className="text-xs text-slate-500">{condition.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-2xl border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                  <AlertTriangle size={16} />
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">Allergies</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="rounded-full border border-yellow-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-0 xl:col-span-2">
            <div className="flex items-center gap-2 px-5 pt-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ShieldCheck size={16} />
              </span>
              <h3 className="text-2xl font-semibold text-slate-900">Insurance Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 pb-5 pt-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Provider</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{savedProfile.insuranceProvider}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Policy Number</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{savedProfile.policyNumber}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Expiry Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Dec 31, 2024</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  <span aria-hidden className="mr-1">
                    •
                  </span>
                  Active
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <h3 className="text-2xl font-semibold text-slate-900">Recent Documents</h3>
            <div className="mt-4 space-y-3">
              {documents.map((doc) => (
                <div key={doc.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FileText size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.date}</p>
                    </div>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-slate-600" aria-label="Download">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl border-blue-100 bg-blue-50 p-0">
          <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <PhoneCall size={16} />
            </span>
            <h3 className="text-2xl font-semibold text-slate-900">Emergency Contact Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {emergencyContacts.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
