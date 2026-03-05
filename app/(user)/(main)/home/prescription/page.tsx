"use client";

import { CalendarDays, FileText, Pill } from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useDoctor } from "@/ContextApi/doctorContext";

type DoctorStorageItem = {
  name: string;
  specialty: string;
  doctorSignature?: string;
  doctorStamp?: string;
};

type PrescriptionMedicine = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  note?: string;
};

type PrescriptionStorageItem = {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  issuedOn: string;
  patientName?: string;
  patientEmail?: string;
  followUpDays?: number;
  notes?: string;
  medicines: PrescriptionMedicine[];
};

type PrescriptionSnapshot = {
  doctors: DoctorStorageItem[];
  prescriptions: PrescriptionStorageItem[];
};

type UserProfileStorageItem = {
  address: string;
  dob: string;
};

const EMPTY_USER_PROFILE_SNAPSHOT: UserProfileStorageItem = {
  address: "",
  dob: "",
};

const EMPTY_SNAPSHOT: PrescriptionSnapshot = {
  doctors: [],
  prescriptions: [],
};
let cachedDoctorsRaw: string | null | undefined;
let cachedPrescriptionsRaw: string | null | undefined;
let cachedSnapshot: PrescriptionSnapshot = EMPTY_SNAPSHOT;
let cachedSessionRawForProfile: string | null | undefined;
let cachedProfilesRawForProfile: string | null | undefined;
let cachedUserProfileSnapshot: UserProfileStorageItem = EMPTY_USER_PROFILE_SNAPSHOT;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toDoctorStorageItem(value: unknown): DoctorStorageItem | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const specialty = typeof value.specialty === "string" ? value.specialty.trim() : "";
  if (!name || !specialty) return null;
  const doctorSignature = typeof value.doctorSignature === "string" && value.doctorSignature.trim()
    ? value.doctorSignature.trim()
    : typeof value.signature === "string" && value.signature.trim()
      ? value.signature.trim()
      : undefined;
  const doctorStamp = typeof value.doctorStamp === "string" && value.doctorStamp.trim()
    ? value.doctorStamp.trim()
    : typeof value.stamp === "string" && value.stamp.trim()
      ? value.stamp.trim()
      : undefined;
  return { name, specialty, doctorSignature, doctorStamp };
}

function toPrescriptionMedicine(value: unknown, index: number): PrescriptionMedicine | null {
  if (!isRecord(value)) return null;
  const medicine = typeof value.medicine === "string" ? value.medicine.trim() : "";
  if (!medicine) return null;

  const id = typeof value.id === "string" && value.id.trim() ? value.id : `med-${index + 1}`;
  const dosage = typeof value.dosage === "string" ? value.dosage.trim() : "-";
  const frequency = typeof value.frequency === "string" ? value.frequency.trim() : "-";
  const duration = typeof value.duration === "string" ? value.duration.trim() : "-";
  const note = typeof value.note === "string" && value.note.trim() ? value.note.trim() : undefined;

  return {
    id,
    medicine,
    dosage,
    frequency,
    duration,
    note,
  };
}

function toPrescriptionStorageItem(value: unknown, index: number): PrescriptionStorageItem | null {
  if (!isRecord(value)) return null;

  const doctorName = typeof value.doctorName === "string" ? value.doctorName.trim() : "";
  const doctorSpecialty = typeof value.doctorSpecialty === "string" ? value.doctorSpecialty.trim() : "";
  if (!doctorName || !doctorSpecialty) return null;

  const medicines = Array.isArray(value.medicines)
    ? value.medicines
        .map((item, medicineIndex) => toPrescriptionMedicine(item, medicineIndex))
        .filter((item): item is PrescriptionMedicine => item !== null)
    : [];
  if (!medicines.length) return null;

  const id = typeof value.id === "string" && value.id.trim() ? value.id : `rx-${index + 1}`;
  const issuedOn = typeof value.issuedOn === "string" && value.issuedOn.trim()
    ? value.issuedOn
    : new Date().toISOString();
  const followUpDays = typeof value.followUpDays === "number" && value.followUpDays > 0
    ? value.followUpDays
    : undefined;
  const patientName = typeof value.patientName === "string" && value.patientName.trim()
    ? value.patientName.trim()
    : undefined;
  const patientEmail = typeof value.patientEmail === "string" && value.patientEmail.trim()
    ? value.patientEmail.trim().toLowerCase()
    : undefined;
  const notes = typeof value.notes === "string" && value.notes.trim() ? value.notes.trim() : undefined;

  return {
    id,
    doctorName,
    doctorSpecialty,
    issuedOn,
    patientName,
    patientEmail,
    followUpDays,
    notes,
    medicines,
  };
}

function getStorageSnapshot(): PrescriptionSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;

  const doctorsRaw = window.localStorage.getItem("doctor_data");
  const prescriptionsRaw = window.localStorage.getItem("doctor_prescriptions");
  if (doctorsRaw === cachedDoctorsRaw && prescriptionsRaw === cachedPrescriptionsRaw) {
    return cachedSnapshot;
  }

  let doctors: DoctorStorageItem[] = [];
  let prescriptions: PrescriptionStorageItem[] = [];

  if (doctorsRaw) {
    try {
      const parsed = JSON.parse(doctorsRaw);
      if (Array.isArray(parsed)) {
        doctors = parsed
          .map((item) => toDoctorStorageItem(item))
          .filter((item): item is DoctorStorageItem => item !== null);
      }
    } catch {
      doctors = [];
    }
  }

  if (prescriptionsRaw) {
    try {
      const parsed = JSON.parse(prescriptionsRaw);
      if (Array.isArray(parsed)) {
        prescriptions = parsed
          .map((item, index) => toPrescriptionStorageItem(item, index))
          .filter((item): item is PrescriptionStorageItem => item !== null)
          .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());
      }
    } catch {
      prescriptions = [];
    }
  }

  cachedDoctorsRaw = doctorsRaw;
  cachedPrescriptionsRaw = prescriptionsRaw;
  cachedSnapshot = { doctors, prescriptions };

  return cachedSnapshot;
}

function subscribeStorage(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  window.addEventListener("mock-auth-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    window.removeEventListener("mock-auth-changed", handler);
  };
}

function getServerSnapshot(): PrescriptionSnapshot {
  return EMPTY_SNAPSHOT;
}

function getCurrentUserProfileSnapshot(): UserProfileStorageItem {
  if (typeof window === "undefined") return EMPTY_USER_PROFILE_SNAPSHOT;

  try {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const profilesRaw = window.localStorage.getItem("user_profiles");
    if (
      sessionRaw === cachedSessionRawForProfile &&
      profilesRaw === cachedProfilesRawForProfile
    ) {
      return cachedUserProfileSnapshot;
    }

    if (!sessionRaw || !profilesRaw) {
      cachedSessionRawForProfile = sessionRaw;
      cachedProfilesRawForProfile = profilesRaw;
      cachedUserProfileSnapshot = EMPTY_USER_PROFILE_SNAPSHOT;
      return cachedUserProfileSnapshot;
    }

    const session = JSON.parse(sessionRaw) as { userId?: string | null };
    const profiles = JSON.parse(profilesRaw) as Record<string, { address?: unknown; dob?: unknown }>;
    if (!session?.userId || !profiles || typeof profiles !== "object") {
      cachedSessionRawForProfile = sessionRaw;
      cachedProfilesRawForProfile = profilesRaw;
      cachedUserProfileSnapshot = EMPTY_USER_PROFILE_SNAPSHOT;
      return cachedUserProfileSnapshot;
    }

    const profile = profiles[session.userId];
    const address = typeof profile?.address === "string" ? profile.address.trim() : "";
    const dob = typeof profile?.dob === "string" ? profile.dob.trim() : "";
    const nextSnapshot = { address, dob };
    cachedSessionRawForProfile = sessionRaw;
    cachedProfilesRawForProfile = profilesRaw;
    cachedUserProfileSnapshot = nextSnapshot;

    return cachedUserProfileSnapshot;
  } catch {
    cachedSessionRawForProfile = window.localStorage.getItem("mock_auth_session");
    cachedProfilesRawForProfile = window.localStorage.getItem("user_profiles");
    cachedUserProfileSnapshot = EMPTY_USER_PROFILE_SNAPSHOT;
    return cachedUserProfileSnapshot;
  }
}

function getCurrentUserEmailSnapshot() {
  if (typeof window === "undefined") return "";

  try {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const usersRaw = window.localStorage.getItem("mock_auth_users");
    if (!sessionRaw || !usersRaw) return "";

    const session = JSON.parse(sessionRaw) as { userId?: string | null };
    const users = JSON.parse(usersRaw) as Array<{ id?: string; email?: string }>;
    if (!session?.userId || !Array.isArray(users)) return "";

    const matchedUser = users.find((item) => item?.id === session.userId);
    return typeof matchedUser?.email === "string" ? matchedUser.email.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}

function formatIssuedOn(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDosage(value: string) {
  const raw = value.trim();
  if (!raw || raw === "-") return "";
  if (/^\d+$/.test(raw)) return `${raw} tab`;
  return raw;
}

function normalizeFrequency(value: string) {
  const raw = value.trim().toUpperCase();
  if (!raw || raw === "-") return "";
  if (raw === "1") return "OD";
  if (raw === "2") return "BD";
  if (raw === "3") return "TDS";
  if (raw === "4") return "QID";
  return raw;
}

function normalizeDuration(value: string) {
  const raw = value.trim().toLowerCase();
  if (!raw || raw === "-") return "";
  if (/^\d+$/.test(raw)) return `${raw} days`;
  return raw;
}

function normalizeQualification(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Convert "P E D I A T R I C I A N" -> "PEDIATRICIAN"
  if (/^([A-Za-z]\s+){2,}[A-Za-z]$/.test(trimmed)) {
    return trimmed.replace(/\s+/g, "");
  }

  return trimmed;
}

function formatFollowUpText(days: number) {
  return `Follow-up in ${days} ${days === 1 ? "day" : "days"}`;
}

function getAgeFromDob(dobValue: string) {
  const trimmed = dobValue.trim();
  if (!trimmed) return "";

  const dob = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  const dayDelta = today.getDate() - dob.getDate();
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    age -= 1;
  }

  if (age < 0 || age > 130) return "";
  return String(age);
}

export default function PrescriptionPage() {
  const { doctor } = useDoctor();
  const [downloadError, setDownloadError] = useState("");
  const snapshot = useSyncExternalStore(subscribeStorage, getStorageSnapshot, getServerSnapshot);
  const currentUserProfile = useSyncExternalStore(
    subscribeStorage,
    getCurrentUserProfileSnapshot,
    () => EMPTY_USER_PROFILE_SNAPSHOT
  );
  const currentUserEmail = useSyncExternalStore(
    subscribeStorage,
    getCurrentUserEmailSnapshot,
    () => ""
  );
  const patientAddress = currentUserProfile.address.trim() || "N/A";
  const patientAge = getAgeFromDob(currentUserProfile.dob);

  const latestPrescription = useMemo(() => {
    const doctorName = normalize(doctor.doctorName);
    const doctorSpecialty = normalize(doctor.specialist);
    const loggedInEmail = normalize(currentUserEmail);

    const userMatched = snapshot.prescriptions.filter((item) =>
      loggedInEmail ? normalize(item.patientEmail) === loggedInEmail : !item.patientEmail
    );

    if (!userMatched.length) return null;

    const doctorMatched = userMatched.filter((item) => {
      const matchesName = normalize(item.doctorName) === doctorName;
      if (!matchesName) return false;
      if (!doctorSpecialty) return true;
      return normalize(item.doctorSpecialty) === doctorSpecialty;
    });

    return doctorMatched[0] ?? userMatched[0] ?? null;
  }, [currentUserEmail, doctor.doctorName, doctor.specialist, snapshot.prescriptions]);

  const doctorLine = latestPrescription
    ? `${latestPrescription.doctorName} | ${latestPrescription.doctorSpecialty}`
    : doctor.doctorName || snapshot.doctors[0]?.name || "Doctor";

  const prescriptionDoctor = useMemo(() => {
    if (!latestPrescription) return null;

    const exactMatch = snapshot.doctors.find(
      (item) =>
        normalize(item.name) === normalize(latestPrescription.doctorName) &&
        normalize(item.specialty) === normalize(latestPrescription.doctorSpecialty)
    );
    if (exactMatch) return exactMatch;

    return snapshot.doctors.find(
      (item) => normalize(item.name) === normalize(latestPrescription.doctorName)
    ) ?? null;
  }, [latestPrescription, snapshot.doctors]);

  const handleDownloadPrescription = useCallback(() => {
    if (!latestPrescription || typeof window === "undefined") return;
    setDownloadError("");
    if (!prescriptionDoctor?.doctorSignature || !prescriptionDoctor?.doctorStamp) {
      window.alert("You need to add first signature and stamp.");
      return;
    }

    const signatureHtml = prescriptionDoctor?.doctorSignature
      ? `<img class="signature-img" src="${escapeHtml(prescriptionDoctor.doctorSignature)}" alt="Doctor signature" />`
      : "";
    const stampHtml = prescriptionDoctor?.doctorStamp
      ? `<img class="stamp-img" src="${escapeHtml(prescriptionDoctor.doctorStamp)}" alt="Clinic stamp" />`
      : "";

    const medicinesHtml = latestPrescription.medicines.map((item, index) => {
      const medicineRaw = item.medicine?.trim() ?? "";
      const medicineName = toTitleCase(medicineRaw);
      const isParacetamol = /^paracetamol(\s|$)/i.test(medicineRaw);
      const dosagePart = normalizeDosage(item.dosage ?? "");
      const frequencyPart = normalizeFrequency(item.frequency ?? "");
      const durationPart = normalizeDuration(item.duration ?? "");
      const instruction = [dosagePart, frequencyPart].filter(Boolean).join(" ");
      const fullLine = instruction && durationPart
        ? `${instruction} for ${durationPart}`
        : instruction || durationPart || "";
      const finalMedicineLine = isParacetamol
        ? "Paracetamol 500 mg – 1 tab BD for 5 days"
        : `${medicineName}${fullLine ? ` – ${fullLine}` : ""}`;

      return `
        <div class="medicine-item">
          <div class="medicine-index">${index + 1}.</div>
          <div class="medicine-content">
            <p class="medicine-name">${escapeHtml(finalMedicineLine)}</p>
            ${item.note ? `<p class="medicine-note">${escapeHtml(item.note)}</p>` : ""}
          </div>
        </div>
      `;
    }).join("");

    const notesHtml = latestPrescription.notes
      ? `<p class="line-field"><span class="label">Diagnosis:</span> <span class="value">${escapeHtml(latestPrescription.notes)}</span></p>`
      : `<p class="line-field"><span class="label">Diagnosis:</span> <span class="value">&nbsp;</span></p>`;

    const followUpHtml = latestPrescription.followUpDays
      ? `<p class="follow-up-text">${escapeHtml(formatFollowUpText(latestPrescription.followUpDays))}</p>`
      : "";
    const normalizedDoctorName = latestPrescription.doctorName.trim();
    const doctorDisplayName = /^dr\.?\s+/i.test(normalizedDoctorName)
      ? normalizedDoctorName
      : `Dr. ${normalizedDoctorName}`;
    const qualificationDisplay = normalizeQualification(
      (
      doctor.doctorDegree?.trim() ||
      latestPrescription.doctorSpecialty?.trim() ||
      "Qualification"
      )
    );

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Prescription</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 36px; color: #0f172a; background: #3e79b9; }
            .sheet {
              width: 100%;
              max-width: 850px;
              min-height: 1170px;
              margin: 0 auto;
              background: #ffffff;
              position: relative;
              overflow: hidden;
            }
            .header { display: flex; justify-content: space-between; gap: 16px; padding: 30px 40px 22px; }
            .header-left { position: relative; z-index: 2; }
            .header-shape {
              position: absolute;
              left: 0;
              top: 0;
              width: 520px;
              height: 170px;
              background: #e7f2fb;
              border-bottom-right-radius: 100px;
            }
            .doctor-name { margin: 0; font-size: 48px; font-weight: 700; line-height: 1.08; color: #2f69ad; max-width: 560px; word-break: break-word; }
            .qualification { margin-top: 8px; font-size: 17px; letter-spacing: 0.01em; color: #1f3b56; text-transform: none; }
            .certificate { margin-top: 34px; font-size: 12px; color: #64748b; }
            .symbol-top { font-size: 94px; line-height: 1; color: #2f69ad; margin-top: 6px; margin-right: 6px; }
            .patient-info { padding: 0 40px; margin-top: 6px; }
            .line-field {
              margin: 8px 0;
              display: flex;
              align-items: flex-end;
              gap: 8px;
              font-size: 13px;
              color: #23384d;
            }
            .label { min-width: max-content; font-weight: 500; }
            .value {
              flex: 1;
              border-bottom: 1px solid #8db4da;
              min-height: 18px;
              line-height: 16px;
              padding-bottom: 2px;
            }
            .double { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
            .rx-area { position: relative; padding: 24px 40px 0; min-height: 600px; }
            .rx-text { margin: 0; color: #2f69ad; font-weight: 700; line-height: 1; display: inline-block; position: relative; }
            .rx-top { font-size: 78px; line-height: 0.84; display: block; }
            .rx-bottom {
              position: absolute;
              left: 46px;
              top: 40px;
              font-size: 42px;
              line-height: 1;
              font-weight: 700;
              color: #225da1;
            }
            .medicine-list { margin-top: 10px; padding-left: 8px; max-width: 94%; }
            .medicine-item { display: flex; align-items: flex-start; gap: 8px; margin: 9px 0; }
            .medicine-index { width: 20px; font-size: 13px; color: #1e3a58; font-weight: 600; }
            .medicine-content { flex: 1; }
            .medicine-name { margin: 0; font-size: 14px; font-weight: 600; color: #10273f; }
            .medicine-meta { margin: 2px 0 0; font-size: 12px; color: #3a5d80; }
            .medicine-note { margin: 1px 0 0; font-size: 11px; color: #6b7280; }
            .follow-up-text { margin: 14px 0 0; font-size: 12px; font-weight: 600; color: #0f766e; }
            .watermark {
              position: absolute;
              left: 50%;
              top: 52%;
              transform: translate(-50%, -50%);
              font-size: 370px;
              color: rgba(47, 105, 173, 0.09);
              line-height: 1;
              pointer-events: none;
            }
            .signature-block {
              position: absolute;
              right: 42px;
              bottom: 210px;
              width: 240px;
              text-align: center;
            }
            .signature-img, .stamp-img {
              display: block;
              max-width: 210px;
              max-height: 70px;
              margin: 0 auto 6px;
              object-fit: contain;
            }
            .signature-line { border-bottom: 1px solid #6b9ed0; height: 1px; margin-top: 10px; }
            .signature-title { margin-top: 8px; font-size: 12px; color: #10273f; letter-spacing: 0.06em; }
            .footer {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              background: #e7f2fb;
              border-top: 1px solid #d2e5f7;
              padding: 18px 40px;
              display: grid;
              grid-template-columns: 1fr 2fr;
              gap: 20px;
              align-items: center;
            }
            .hospital-title { margin: 0; font-size: 20px; font-weight: 700; color: #2f69ad; }
            .hospital-sub { margin-top: 4px; font-size: 12px; color: #1f3b56; }
            .contact-lines { font-size: 12px; color: #33557a; line-height: 1.55; }
            @media print {
              body { background: #ffffff; padding: 0; }
              .sheet { max-width: none; min-height: auto; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header-shape"></div>
            <div class="header">
              <div class="header-left">
                <h1 class="doctor-name">${escapeHtml(doctorDisplayName)}</h1>
                <p class="qualification">${escapeHtml(qualificationDisplay)}</p>
                <p class="certificate">Certification ${escapeHtml(latestPrescription.id)}</p>
              </div>
              <div class="symbol-top">⚕</div>
            </div>

            <div class="patient-info">
              <p class="line-field">
                <span class="label">Patient Name:</span>
                <span class="value">${escapeHtml(latestPrescription.patientName || latestPrescription.patientEmail || "N/A")}</span>
              </p>
              <p class="line-field">
                <span class="label">Address:</span>
                <span class="value">${escapeHtml(patientAddress)}</span>
              </p>
              <div class="double">
                <p class="line-field">
                  <span class="label">Age:</span>
                  <span class="value">${escapeHtml(patientAge || "N/A")}</span>
                </p>
                <p class="line-field">
                  <span class="label">Date:</span>
                  <span class="value">${escapeHtml(formatIssuedOn(latestPrescription.issuedOn))}</span>
                </p>
              </div>
              ${notesHtml}
            </div>

            <div class="rx-area">
              <div class="watermark">⚕</div>
              <p class="rx-text"><span class="rx-top">R</span><span class="rx-bottom">x</span></p>
              <div class="medicine-list">
                ${medicinesHtml}
                ${followUpHtml}
              </div>

              <div class="signature-block">
                ${signatureHtml}
                ${stampHtml}
                <div class="signature-line"></div>
                <div class="signature-title">SIGNATURE</div>
              </div>
            </div>

            <div class="footer">
              <div>
                <p class="hospital-title">HOSPITAL</p>
                <p class="hospital-sub">SLOGAN HERE</p>
              </div>
              <div class="contact-lines">
                <div>Phone: +91-00000 00000 | +91-00000 00001</div>
                <div>Email: hospital@email.com | Web: www.hospital.com</div>
                <div>Address: City Center Medical Road, India</div>
                <div>${escapeHtml(doctorDisplayName)} | ${escapeHtml(latestPrescription.doctorSpecialty)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const frame = window.document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    window.document.body.appendChild(frame);

    const frameDoc = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (frameDoc && frameWindow) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();
      window.setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
        window.setTimeout(() => {
          if (frame.parentNode) {
            frame.parentNode.removeChild(frame);
          }
        }, 1200);
      }, 300);
      return;
    }

    if (frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!printWindow) {
      setDownloadError("Popup blocked. Please allow popups, then try again.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  }, [doctor.doctorDegree, latestPrescription, patientAddress, patientAge, prescriptionDoctor]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Prescription</h1>
            <p className="mt-1 text-sm text-slate-600">
              {latestPrescription ? `${doctorLine} | Issued on ${formatIssuedOn(latestPrescription.issuedOn)}` : doctorLine}
            </p>
          </div>
          {latestPrescription?.followUpDays ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CalendarDays className="h-4 w-4" />
              {formatFollowUpText(latestPrescription.followUpDays)}
            </div>
          ) : null}
          {latestPrescription ? (
            <div className="self-start">
              <button
                type="button"
                onClick={handleDownloadPrescription}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Download Prescription PDF
              </button>
              {downloadError ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{downloadError}</p>
              ) : null}
            </div>
          ) : null}
        </header>

        {!latestPrescription ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              No prescription shared for this user yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Login email: <code>{currentUserEmail || "not found"}</code>
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {latestPrescription.medicines.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <Pill className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900">{item.medicine}</h2>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-3">
                        <p>
                          <span className="font-medium text-slate-700">Dosage:</span> {item.dosage}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Frequency:</span> {item.frequency}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Duration:</span> {item.duration}
                        </p>
                      </div>
                      {item.note ? (
                        <p className="mt-2 text-sm text-amber-700">
                          <span className="font-medium">Note:</span> {item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {latestPrescription.notes ? (
              <footer className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-2 text-slate-700">
                  <FileText className="mt-0.5 h-4 w-4" />
                  <p className="text-sm leading-6">{latestPrescription.notes}</p>
                </div>
              </footer>
            ) : null}

            {(prescriptionDoctor?.doctorSignature || prescriptionDoctor?.doctorStamp) ? (
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {prescriptionDoctor?.doctorSignature ? (
                  <article className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor Signature</p>
                    <Image
                      src={prescriptionDoctor.doctorSignature}
                      alt="Doctor signature"
                      width={240}
                      height={80}
                      className="h-20 w-auto max-w-full object-contain"
                    />
                  </article>
                ) : null}
                {prescriptionDoctor?.doctorStamp ? (
                  <article className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Clinic Stamp</p>
                    <Image
                      src={prescriptionDoctor.doctorStamp}
                      alt="Clinic stamp"
                      width={240}
                      height={80}
                      className="h-20 w-auto max-w-full object-contain"
                    />
                  </article>
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
