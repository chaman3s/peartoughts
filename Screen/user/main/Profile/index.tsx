"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { Card } from "@/Components/ui/Card";
import Button from "@/Components/ui/Button";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  Upload,
  PhoneCall,
  Pencil,
  Pill,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

type Gender = "" | "Male" | "Female" | "Other";

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
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  height: "",
  weight: "",
  lifestyle: "",
  insuranceProvider: "",
  policyNumber: "",
  medicalHistory: "",
  noKnownAllergies: false,
  allergyDetail: "",
  emergencyContactName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
};

type TestReportDocument = {
  id: string;
  title: string;
  date: string;
  downloadUrl?: string;
  isUploaded?: boolean;
};

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
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

type SessionSnapshot = {
  userId: string;
  fullname: string;
  email: string;
  number: string;
};

const USER_PROFILE_STORAGE_KEY = "user_profiles";

function getCurrentSessionUser(): SessionSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const usersRaw = window.localStorage.getItem("mock_auth_users");
    if (!sessionRaw || !usersRaw) return null;

    const session = JSON.parse(sessionRaw) as { userId?: string | null };
    const users = JSON.parse(usersRaw) as Array<{ id?: string; fullname?: string; email?: string; number?: string }>;
    if (!session?.userId || !Array.isArray(users)) return null;

    const matchedUser = users.find((item) => item?.id === session.userId);
    if (!matchedUser?.id) return null;

    return {
      userId: matchedUser.id,
      fullname: matchedUser.fullname?.trim() ?? "",
      email: matchedUser.email?.trim() ?? "",
      number: matchedUser.number?.trim() ?? "",
    };
  } catch {
    return null;
  }
}

function readStoredProfiles() {
  if (typeof window === "undefined") return {} as Record<string, ProfileFormState>;

  try {
    const raw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return {} as Record<string, ProfileFormState>;
    const parsed = JSON.parse(raw) as Record<string, ProfileFormState>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, ProfileFormState>;
  }
}

function writeStoredProfiles(data: Record<string, ProfileFormState>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

function getInitialUserProfileSnapshot() {
  if (typeof window !== "undefined") {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const usersRaw = window.localStorage.getItem("mock_auth_users");
    const profilesRaw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);

    if (
      sessionRaw === cachedSessionRaw &&
      usersRaw === cachedUsersRaw &&
      profilesRaw === cachedProfilesRaw &&
      cachedProfileSnapshot
    ) {
      return cachedProfileSnapshot;
    }
  }

  const currentUser = getCurrentSessionUser();
  if (!currentUser) {
    const fallback = {
      userId: "",
      profile: defaultFormState,
    };
    if (typeof window !== "undefined") {
      cachedSessionRaw = window.localStorage.getItem("mock_auth_session");
      cachedUsersRaw = window.localStorage.getItem("mock_auth_users");
      cachedProfilesRaw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      cachedProfileSnapshot = fallback;
    }
    return fallback;
  }

  const baseProfile: ProfileFormState = {
    ...defaultFormState,
    fullName: currentUser.fullname,
    email: currentUser.email,
    phone: currentUser.number,
  };

  const profiles = readStoredProfiles();
  const stored = profiles[currentUser.userId];
  const nextSnapshot = {
    userId: currentUser.userId,
    profile: stored ? { ...baseProfile, ...stored } : baseProfile,
  };
  if (typeof window !== "undefined") {
    cachedSessionRaw = window.localStorage.getItem("mock_auth_session");
    cachedUsersRaw = window.localStorage.getItem("mock_auth_users");
    cachedProfilesRaw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    cachedProfileSnapshot = nextSnapshot;
  }
  return nextSnapshot;
}

function subscribeProfileSnapshot(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("mock-auth-changed", handler as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("mock-auth-changed", handler as EventListener);
  };
}

function getServerUserProfileSnapshot() {
  return SERVER_PROFILE_SNAPSHOT;
}

let cachedSessionRaw: string | null | undefined;
let cachedUsersRaw: string | null | undefined;
let cachedProfilesRaw: string | null | undefined;
let cachedProfileSnapshot:
  | {
      userId: string;
      profile: ProfileFormState;
    }
  | undefined;
const SERVER_PROFILE_SNAPSHOT = {
  userId: "",
  profile: defaultFormState,
};

export default function UserProfileScreen() {
  const profileSnapshot = useSyncExternalStore(
    subscribeProfileSnapshot,
    getInitialUserProfileSnapshot,
    getServerUserProfileSnapshot
  );
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const testReportInputRef = useRef<HTMLInputElement | null>(null);
  const reportsRef = useRef<TestReportDocument[]>([]);
  const testReportsRef = useRef<TestReportDocument[]>([]);
  const activeUserId = profileSnapshot.userId;
  const [isEditing, setIsEditing] = useState(false);
  const savedProfile = profileSnapshot.profile;
  const [formData, setFormData] = useState<ProfileFormState>(defaultFormState);
  const [testReports, setTestReports] = useState<TestReportDocument[]>([]);
  const [uploadedTestReports, setUploadedTestReports] = useState<TestReportDocument[]>([]);
  const [documentError, setDocumentError] = useState("");
  const [testReportError, setTestReportError] = useState("");
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
    if (!activeUserId) return;

    const profiles = readStoredProfiles();
    profiles[activeUserId] = formData;
    writeStoredProfiles(profiles);

    if (typeof window !== "undefined") {
      try {
        const usersRaw = window.localStorage.getItem("mock_auth_users");
        if (usersRaw) {
          const users = JSON.parse(usersRaw) as Array<{ id?: string; fullname?: string; email?: string; number?: string }>;
          if (Array.isArray(users)) {
            const updatedUsers = users.map((item) =>
              item?.id === activeUserId
                ? {
                    ...item,
                    fullname: formData.fullName || item.fullname || "",
                    email: formData.email || item.email || "",
                    number: formData.phone || item.number || "",
                  }
                : item
            );
            window.localStorage.setItem("mock_auth_users", JSON.stringify(updatedUsers));
          }
        }
      } catch {
        // ignore storage parse failure
      }
    }

    setIsEditing(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("profile_updated_success", "1");
      window.dispatchEvent(new Event("mock-auth-changed"));
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
    { label: "Lifestyle", value: savedProfile.lifestyle },
  ].filter((item) => {
    if (item.label === "Date of Birth") return Boolean(savedProfile.dob);
    return Boolean(String(item.value || "").trim());
  });
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
  ].filter((item) => Boolean(item.value.trim()));
  const vitalSigns = [
    { label: "Blood Group", value: savedProfile.bloodGroup || "N/A" },
    { label: "Height", value: savedProfile.height ? `${savedProfile.height} cm` : "N/A" },
    { label: "Weight", value: savedProfile.weight ? `${savedProfile.weight} kg` : "N/A" },
    { label: "BMI", value: bmiText },
  ].filter((item) => item.value !== "N/A");
  const completionFields = [
    savedProfile.fullName,
    savedProfile.email,
    savedProfile.phone,
    savedProfile.dob,
    savedProfile.gender,
    savedProfile.bloodGroup,
    savedProfile.height,
    savedProfile.weight,
    savedProfile.lifestyle,
    savedProfile.insuranceProvider,
    savedProfile.policyNumber,
    savedProfile.medicalHistory,
    savedProfile.allergyDetail,
    savedProfile.emergencyContactName,
    savedProfile.emergencyRelationship,
    savedProfile.emergencyPhone,
  ];
  const completionCount = completionFields.filter((value) => String(value).trim().length > 0).length;
  const completionPercent = Math.round((completionCount / completionFields.length) * 100);

  function handleUploadDocuments(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const uploadedDocs: TestReportDocument[] = [];

    Array.from(selectedFiles).forEach((file, index) => {
      const isAllowedByType = allowedTypes.includes(file.type);
      const isAllowedByExtension = /\.(pdf|png|jpe?g|webp|doc|docx)$/i.test(file.name);
      if (!isAllowedByType && !isAllowedByExtension) {
        return;
      }

      uploadedDocs.push({
        id: `upload-${Date.now()}-${index}`,
        title: file.name,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        downloadUrl: URL.createObjectURL(file),
        isUploaded: true,
      });
    });

    if (uploadedDocs.length === 0) {
      setDocumentError("Upload valid files only: PDF, JPG, PNG, WEBP, DOC, DOCX.");
      event.target.value = "";
      return;
    }

    setDocumentError("");
    setTestReports((prev) => [...uploadedDocs, ...prev]);
    event.target.value = "";
  }

  function handleUploadTestReports(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const uploadedDocs: TestReportDocument[] = [];

    Array.from(selectedFiles).forEach((file, index) => {
      const isAllowedByType = allowedTypes.includes(file.type);
      const isAllowedByExtension = /\.(pdf|png|jpe?g|webp|doc|docx)$/i.test(file.name);
      if (!isAllowedByType && !isAllowedByExtension) {
        return;
      }

      uploadedDocs.push({
        id: `test-upload-${Date.now()}-${index}`,
        title: file.name,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        downloadUrl: URL.createObjectURL(file),
        isUploaded: true,
      });
    });

    if (uploadedDocs.length === 0) {
      setTestReportError("Upload valid files only: PDF, JPG, PNG, WEBP, DOC, DOCX.");
      event.target.value = "";
      return;
    }

    setTestReportError("");
    setUploadedTestReports((prev) => [...uploadedDocs, ...prev]);
    event.target.value = "";
  }

  useEffect(() => {
    reportsRef.current = testReports;
  }, [testReports]);

  useEffect(() => {
    testReportsRef.current = uploadedTestReports;
  }, [uploadedTestReports]);

  useEffect(() => {
    return () => {
      reportsRef.current.forEach((report) => {
        if (report.isUploaded && report.downloadUrl) {
          URL.revokeObjectURL(report.downloadUrl);
        }
      });
      testReportsRef.current.forEach((report) => {
        if (report.isUploaded && report.downloadUrl) {
          URL.revokeObjectURL(report.downloadUrl);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!showSuccessPopup) return;
    const timer = window.setTimeout(() => setShowSuccessPopup(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccessPopup]);

  if (isEditing) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)] p-4 md:p-6">
        <section className="mx-auto max-w-[1200px] space-y-4 pb-6 md:space-y-5">
          <div className="sticky top-20 z-20 -mx-1 bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)] px-1 py-1">
          <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Edit Profile</p>
              <h1 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">Profile Details</h1>
              <p className="mt-1 text-sm text-slate-500">Simple and quick update for your health profile.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Save size={16} />
                Save
              </Button>
            </div>
            </div>
          </header>
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserRound size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Personal Information</h2>
            </div>
            <p className="-mt-3 mb-4 text-sm text-slate-500">These details appear in your profile and appointment screens.</p>

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
                  <option value="">Select</option>
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
                  <option value="">Select</option>
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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

          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Stethoscope size={16} />
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Medical History</h2>
            </div>
            <label className={labelClassName}>Conditions / Notes</label>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={formData.medicalHistory}
              onChange={(e) => updateField("medicalHistory", e.target.value)}
            />
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)] p-4 md:p-6">
      {showSuccessPopup && (
        <div className="fixed right-3 top-3 z-50 w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-xl border border-emerald-200 bg-emerald-100 shadow-md">
          <div className="flex items-center gap-3 border-l-4 border-emerald-500 px-4 py-3">
            <CheckCircle2 size={24} className="shrink-0 text-emerald-600" />
            <p className="text-base font-semibold text-emerald-700 sm:text-lg">Profile updated successfully!</p>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-[1400px] space-y-4 md:space-y-5">
        <header className="rounded-3xl border border-blue-100 bg-white/95 p-5 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.3)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">User Profile</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
                {savedProfile.fullName || "Complete your profile"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Keep your health details updated for better appointment and report experience.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion</p>
                <p className="text-lg font-semibold text-slate-900">{completionPercent}%</p>
              </div>
              <Button
                type="button"
                onClick={openEditor}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-5 py-3 text-sm text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Profile
              </Button>
            </div>
          </div>
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
              {personalInfo.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">No profile details added yet.</p>
              ) : null}
              {personalInfo.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
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
                {medicalConditions.length === 0 ? (
                  <p className="rounded-2xl bg-white px-3.5 py-3 text-sm font-medium text-slate-500">
                    No medical condition added yet.
                  </p>
                ) : null}
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
                {allergies.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500">No allergy detail added yet.</p>
                ) : null}
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
          <div className="space-y-4 xl:col-span-2">
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-0">
            <div className="flex items-center gap-2 px-5 pt-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ShieldCheck size={16} />
              </span>
              <h3 className="text-2xl font-semibold text-slate-900">Insurance Details</h3>
            </div>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 pb-5 pt-4 sm:grid-cols-2">
              {!savedProfile.insuranceProvider.trim() && !savedProfile.policyNumber.trim() ? (
                <p className="text-sm font-medium text-slate-500">No insurance detail added yet.</p>
              ) : null}
              {savedProfile.insuranceProvider.trim() ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Provider</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{savedProfile.insuranceProvider}</p>
                </div>
              ) : null}
              {savedProfile.policyNumber.trim() ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Policy Number</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{savedProfile.policyNumber}</p>
                </div>
              ) : null}
            </div>
          </Card>
          <Card className="rounded-2xl border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <FileText size={16} />
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">Test Reports</h3>
              </div>
              <button
                type="button"
                onClick={() => testReportInputRef.current?.click()}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Upload size={14} />
                Upload
              </button>
            </div>
            <input
              ref={testReportInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleUploadTestReports}
              className="hidden"
            />
            {testReportError ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{testReportError}</p>
            ) : null}
            <div className="mt-4 space-y-3">
              {uploadedTestReports.length === 0 ? (
                <p className="rounded-xl bg-white px-3 py-3 text-xs font-medium text-slate-500">
                  No test report yet.
                </p>
              ) : null}
              {uploadedTestReports.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.date}</p>
                  </div>
                  {doc.downloadUrl ? (
                    <a
                      href={doc.downloadUrl}
                      download={doc.title}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download size={14} />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">No file</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
          <Card className="rounded-2xl border-blue-100 bg-blue-50 p-0">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <PhoneCall size={16} />
              </span>
              <h3 className="text-2xl font-semibold text-slate-900">Emergency Contact Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
              {emergencyContacts.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">No emergency contact added yet.</p>
              ) : null}
              {emergencyContacts.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <HeartPulse size={16} />
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">Vital Signs</h3>
              </div>
              <div className="mt-4 space-y-2.5">
                {vitalSigns.length === 0 ? (
                  <p className="rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-slate-500">
                    No vital signs added yet.
                  </p>
                ) : null}
                {vitalSigns.map((vital) => (
                  <div key={vital.label} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{vital.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{vital.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-2xl border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold text-slate-900">Documents</h3>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Upload size={14} />
                  Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleUploadDocuments}
                className="hidden"
              />
              {documentError ? (
                <p className="mt-2 text-xs font-medium text-rose-600">{documentError}</p>
              ) : null}
              <div className="mt-4 space-y-3">
                {testReports.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs font-medium text-slate-500">
                    No uploaded documents yet.
                  </p>
                ) : null}
                {testReports.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <FileText size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500">{doc.date}</p>
                      </div>
                    </div>
                    {doc.downloadUrl ? (
                      <a
                        href={doc.downloadUrl}
                        download={doc.title}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label={`Download ${doc.title}`}
                      >
                        <Download size={14} />
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">No file</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      </section>
    </main>
  );
}

