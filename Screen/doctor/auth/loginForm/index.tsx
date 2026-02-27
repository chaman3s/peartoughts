"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/Components/ui/Card";
import VerticalContainer from "@/Components/ui/Container/VerticalContainer";
import { LabelForm } from "@/Components/Form";
import Button from "@/Components/ui/Button";
import useApiCall from "@/hooks/useApiCall";
import { loginMockApi } from "@/services/mockAuthApi";
import Link from "next/link";
import Image from "@/Components/ui/Image";
import doctorLogo from "@/assets/img/doctorLogo.svg";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";

export default function DoctorLoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const { updateDoctor } = useDoctor();
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  const loginApi = useApiCall(loginMockApi);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!formData.emailOrMobile.trim()) {
      setFormError("Enter email/mobile");
      return;
    }
    if (!formData.password.trim()) {
      setFormError("Enter password");
      return;
    }

    const response = await loginApi.execute({emailOrMobile: formData.emailOrMobile});
    if (!response?.success) return;

    if (response.user) {
      updateDoctor({
        doctorName: response.user.fullname,
        doctorEmail: response.user.email,
        doctorPhone: Number.parseInt(response.user.number, 10) || 0,
        status: "online",
        doctorImage: "data:image/jpeg;base64,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"
      });
    }

    setFormData({ emailOrMobile: "", password: ""});
    router.push("/doctor/otpverification");
  };

  return (
    <div className="flex h-full items-center justify-center  px-3 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="mt-5 mb-10 w-full max-w-md animate-slideIn shadow-lg hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit}>
          <VerticalContainer className="gap-3 sm:gap-4 p-4 sm:p-6">
          {/* Logo Section */}
          <div className="text-center animate-fadeIn">
            <Image
              src={doctorLogo}
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto animate-fadeInUp transform transition-transform duration-300 hover:scale-110"
              style={{ animationDelay: "0s" }}
            />
            <p className="-mt-5 text-sm sm:text-base text-gray-600">Welcome back</p>
          </div>

          {/* Form Section */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <LabelForm
              label={"DoctorLogin"}
              error={formError || loginApi.error || error}
              inputArr={[

                {
                  id: "emailOrMobile",
                  type: "text",
                  placeholder: "Enter email",
                  label :"Mobile/Email",
                  value: formData.emailOrMobile,
                  onChange: (event) => handleInputChange("emailOrMobile", event.target.value),
                  clearable: true,
                  onClear: () => handleInputChange("emailOrMobile", ""),
                },
                
                {
                  id: "password",
                  type: "password",
                  placeholder: "Enter password",
                  label :"password",
                  value: formData.password,
                  onChange: (event) => handleInputChange("password", event.target.value),
                },
              ]}
            />
          </div>

          {/* Button Section */}
          <Button
            type="submit"
            loading={loginApi.loading}
            className="w-full px-4 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            Login
          </Button>

          {/* Footer Links */}
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-0 sm:justify-between items-center text-xs sm:text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <label className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" className="mr-2 rounded accent-blue-500" />
              Remember Me
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Divider */}
          <div className="hidden sm:flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs sm:text-sm text-gray-500">Or login with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <button className="hidden sm:flex w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 items-center justify-center gap-2 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-xs sm:text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
            Don&apos;t have an account?{" "}
            <Link href="/doctor/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
          </VerticalContainer>
        </form>
      </Card>
    </div>
  );
}
