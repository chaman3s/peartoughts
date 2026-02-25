"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { HorizontalContainer, VerticalContainer } from "@/Components/ui/Container";
import Input from "@/Components/ui/Input";
import Text from "@/Components/ui/Text";
import useApiCall from "@/hooks/useApiCall";
import {
  getPendingOtpContact,
  resendOtpMockApi,
  verifyOtpMockApi,
  type SignupPayload,
} from "@/services/mockAuthApi";

const STORAGE_KEY = "signup_payload";
const OTP_LENGTH = 4;

function parseSignupPayload(value: string | null): SignupPayload | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SignupPayload;
    if (!parsed?.email || !parsed?.number) return null;
    return parsed;
  } catch {
    return null;
  }
}

function maskMobile(number: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 4) return "******";
  return `+91 ${digits.slice(0, 3)} ******${digits.slice(-2)}`;
}

function resolveContactText() {
  if (typeof window === "undefined") return null;

  const pendingContact = getPendingOtpContact();
  if (pendingContact) return maskMobile(pendingContact);

  const payload = parseSignupPayload(sessionStorage.getItem(STORAGE_KEY));
  if (payload?.number) return maskMobile(payload.number);

  return null;
}

export default function OtpVerificationForm() {
  const router = useRouter();
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(55);
  const [formError, setFormError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const contactText = useMemo(() => resolveContactText(), []);

  const verifyApi = useApiCall(verifyOtpMockApi);
  const resendApi = useApiCall(resendOtpMockApi);

  useEffect(() => {
    if (contactText) return;
    router.push("/signup");
  }, [contactText, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = [...otpValues];
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i];
    }
    setOtpValues(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    setActiveIndex(focusIndex);
  };

  const handleResend = async () => {
    setFormError("");

    const response = await resendApi.execute();
    if (!response?.success) return;

    setSecondsLeft(55);
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async () => {
    setFormError("");
    const otp = otpValues.join("");
    if (otp.length !== OTP_LENGTH) {
      setFormError("Please enter complete OTP");
      return;
    }

    const response = await verifyApi.execute(otp);
    if (!response?.success) {
      setFormError("Invalid OTP");
      return;
    }

    router.push("/home/dashBoard");
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <Card className="p-6 sm:p-8">
          <VerticalContainer className="gap-12">
            <HorizontalContainer className="items-center">
              <Text as="h1" className="text-[30px] font-semibold text-[#2b2b2b]">
                OTP Code Verification
              </Text>
            </HorizontalContainer>

            <VerticalContainer className="items-center gap-10">
              <Text className="text-[26px] text-[#2f2f2f] text-center leading-tight">
                Code has been sent to {contactText ?? "+91 111 ******99"}
              </Text>

              <HorizontalContainer className="w-full justify-center gap-4">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    value={value}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    aria-label={`OTP digit ${index + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className={`h-14 w-14 text-center text-2xl font-semibold rounded-xl border outline-none ${
                      index === activeIndex || value
                        ? "bg-[#d6ebef] border-[#54c7ea] text-[#1e1e1e]"
                        : "bg-[#efefef] border-[#e4e4e4] text-[#4b4b4b]"
                    }`}
                  />
                ))}
              </HorizontalContainer>

              <VerticalContainer className="items-center gap-2">
                <Text className="text-[26px] text-[#2f2f2f] text-center">
                  Resend code in{" "}
                  <span className="text-[#3b6df6]">{secondsLeft} s</span>
                </Text>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || resendApi.loading}
                  className="text-[#3b6df6] text-base font-semibold disabled:text-gray-400"
                >
                  Resend
                </button>
                {(formError || resendApi.error || verifyApi.error) && (
                  <Text as="p" className="text-sm text-red-500 text-center">
                    {formError || resendApi.error || verifyApi.error}
                  </Text>
                )}
              </VerticalContainer>
            </VerticalContainer>

            <Button
              type="button"
              loading={verifyApi.loading}
              onClick={handleVerify}
              className="w-full bg-[#4ab9d3] hover:bg-[#3fb0cb] text-white text-xl font-medium py-4 rounded-xl shadow-none hover:scale-100 active:scale-100"
            >
              Verify
            </Button>
          </VerticalContainer>
        </Card>
      </div>
    </div>
  );
}
