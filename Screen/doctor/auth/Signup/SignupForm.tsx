"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/Components/ui/Card";
import VerticalContainer from "@/Components/ui/Container/VerticalContainer";
import { LabelForm } from "@/Components/Form";
import Button from "@/Components/ui/Button";
import Image from "@/Components/ui/Image";
import useApiCall from "@/hooks/useApiCall";
import { signupMockApi, type SignupPayload } from "@/services/mockAuthApi";
import doctorLogo from '@/assets/img/doctorLogo.svg'
const STORAGE_KEY = "signup_payload";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupData(data: SignupPayload) {
  if (data.fullname.trim().length < 2) return "Enter a valid full name";
  if (!EMAIL_REGEX.test(data.email.trim())) return "Enter a valid email";
  if (!/^\d{10}$/.test(data.number.trim())) return "Enter a valid 10-digit mobile number";
  return null;
}

export default function DoctorSignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupPayload>({
    fullname: "",
    email: "",
    number: "",
  });
  const [formError, setFormError] = useState<string>("");

  const signupApi = useApiCall(signupMockApi);

  const handleInputChange = (key: keyof SignupPayload, value: string) => {
    if (key === "number") {
      const sanitized = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [key]: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const error = validateSignupData(formData);
    if (error) {
      setFormError(error);
      return;
    }

    const response = await signupApi.execute(formData);
    if (!response?.success) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setFormData({
      fullname: "",
      email: "",
      number: "",
    });
    router.push("/doctor/otpverification");
  };

  return (
    <div className="flex h-full items-center justify-center  px-3 sm:px-5 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full  mt-10 mb-10 max-w-md animate-slideIn shadow-lg hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit}>
          <VerticalContainer className="gap-2 sm:gap-3 p-3 sm:p-4">
            {/* Logo Section */}
            <div className="text-center animate-fadeIn">
              <Image
                src={doctorLogo}
                alt="Logo"
                width={150}
                height={150}
                className="mx-auto mb-1 animate-fadeInUp transform transition-transform duration-300 hover:scale-110"
                style={{ animationDelay: "0s" }}
              />
              <p className="-mt-8 text-xs sm:text-sm text-gray-600">:Join Us </p>
            </div>

            {/* Form Section */}
            <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <LabelForm
                label={"Doctor Signup"}
                error={formError || signupApi.error || undefined}
                inputArr={[
                  {
                    id: "fullname",
                    type: "text",
                    placeholder: "Enter fullname",
                    label: "Full Name",
                    value: formData.fullname,
                    onChange: (event) => handleInputChange("fullname", event.target.value),
                    clearable: true,
                    onClear: () => handleInputChange("fullname", ""),
                  },
                  {
                    id: "email",
                    type: "email",
                    placeholder: "Enter email",
                    label: "Email",
                    value: formData.email,
                    onChange: (event) => handleInputChange("email", event.target.value),
                    clearable: true,
                    onClear: () => handleInputChange("email", ""),
                  },
                  {
                    id: "number",
                    type: "text",
                    placeholder: "Enter mobile number",
                    label: "Mobile",
                    value: formData.number,
                    onChange: (event) => handleInputChange("number", event.target.value),
                    clearable: true,
                    onClear: () => handleInputChange("number", ""),
                  }
                ]}
              />
            </div>
            <Button
              type="submit"
              loading={signupApi.loading}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              Sign Up
            </Button>

            <button
              type="button"
              onClick={() => console.log("Sign up with Google clicked")}
              className="w-full border border-gray-300 rounded-xl py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 animate-fadeInUp"
              style={{ animationDelay: "0.25s" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              Already have an account?{" "}
              <Link href="/doctor/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Login
              </Link>
            </p>
          </VerticalContainer>
        </form>
      </Card>
    </div>
  );
}
