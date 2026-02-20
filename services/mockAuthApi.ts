export type SignupPayload = {
  fullname: string;
  email: string;
  number: string;
  password: string;
};

export type LoginPayload = {
  emailOrMobile: string;
  password: string;
};

type StoredUser = {
  id: string;
  fullname: string;
  email: string;
  number: string;
  password: string;
};

type PendingOtp = {
  contact: string;
  otp: string;
  expiresAt: number;
};

const USERS_KEY = "mock_auth_users";
const OTP_KEY = "mock_auth_pending_otp";
const OTP_TTL_MS = 5 * 60 * 1000;
const MOCK_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readPendingOtp(): PendingOtp | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(OTP_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingOtp;
    if (!parsed?.contact || !parsed?.otp || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(OTP_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePendingOtp(contact: string) {
  if (!canUseStorage()) return;
  const pending: PendingOtp = {
    contact,
    otp: "1234",
    expiresAt: Date.now() + OTP_TTL_MS,
  };
  window.localStorage.setItem(OTP_KEY, JSON.stringify(pending));
}

function clearPendingOtp() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(OTP_KEY);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMobile(value: string) {
  return value.replace(/\D/g, "");
}

export async function signupMockApi(payload: SignupPayload) {
  await sleep(MOCK_DELAY_MS);

  const users = readUsers();
  const email = normalizeEmail(payload.email);
  const number = normalizeMobile(payload.number);

  const alreadyExists = users.some(
    (user) =>
      normalizeEmail(user.email) === email ||
      normalizeMobile(user.number) === number
  );

  if (alreadyExists) {
    throw new Error("Account already exists with this email or mobile");
  }

  const user: StoredUser = {
    id: String(Date.now()),
    fullname: payload.fullname.trim(),
    email,
    number,
    password: payload.password,
  };

  users.push(user);
  writeUsers(users);
  writePendingOtp(number || email);

  return { success: true, message: "Signup successful. OTP sent.", user };
}

export async function loginMockApi(payload: LoginPayload) {
  await sleep(MOCK_DELAY_MS);

  const users = readUsers();
  const identifier = payload.emailOrMobile.trim();
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedNumber = normalizeMobile(identifier);

  const user = users.find(
    (item) =>
      normalizeEmail(item.email) === normalizedEmail ||
      normalizeMobile(item.number) === normalizedNumber
  );

  if (!user || user.password !== payload.password) {
    throw new Error("Invalid email/mobile or password");
  }

  writePendingOtp(user.number || user.email);
  return { success: true, message: "Login successful", user };
}

export async function verifyOtpMockApi(otp: string) {
  await sleep(MOCK_DELAY_MS);

  const pending = readPendingOtp();
  if (!pending) {
    throw new Error("OTP expired. Please request a new code.");
  }

  if (otp !== pending.otp) {
    throw new Error("Invalid OTP");
  }

  clearPendingOtp();
  return { success: true, message: "OTP verified successfully" };
}

export async function resendOtpMockApi() {
  await sleep(MOCK_DELAY_MS);

  const pending = readPendingOtp();
  if (!pending) {
    throw new Error("No active OTP request found");
  }

  writePendingOtp(pending.contact);
  return { success: true, message: "OTP resent successfully" };
}

export function getPendingOtpContact() {
  const pending = readPendingOtp();
  return pending?.contact ?? null;
}
