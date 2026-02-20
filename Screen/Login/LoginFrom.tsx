import { Card } from "@/Components/ui/Card";
import VerticalContainer from "@/Components/ui/Container/VerticalContainer";
import {LebelFrom} from "@/Components/Form";
import Image from '@/Components/ui/Image'
import logo from '@/assets/img/logo.jpg'

export default function LoginForm({ error }: { error?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl animate-slideIn shadow-lg hover:shadow-xl transition-shadow duration-300">
        <VerticalContainer className="gap-6 sm:gap-8 p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Logo Section */}
          <div className="text-center animate-fadeIn">
            <Image
              src={logo}
              alt="Logo"
              width={100}
              height={100}
              className="mx-auto mb-4 animate-fadeInUp transform transition-transform duration-300 hover:scale-110"
              style={{ animationDelay: "0s" }}
            />
            <p className="text-sm sm:text-base text-gray-600">Welcome back</p>
          </div>

          {/* Form Section */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <LebelFrom
              label={"Login"}
              error={error}
              inputArr={[

                {
                  id: "emailOrMobile",
                  type: "text",
                  placeholder: "Enter email",
                  label :"Mobile/Email"
                },
                {
                  id: "password",
                  type: "password",
                  placeholder: "Enter password",
                  label :"Password"
                },
              ]}
            />
          </div>

          {/* Button Section */}
          <button
            className="w-full px-4 py-2 sm:py-3 md:py-4 text-base sm:text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            Login
          </button>

          {/* Footer Links */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center text-xs sm:text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <label className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" className="mr-2 rounded accent-blue-500" />
              Remember Me
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs sm:text-sm text-gray-500">Or login with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <button className="w-full px-4 py-2 sm:py-3 md:py-4 border border-gray-300 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
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
            Don't have an account?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign up
            </a>
          </p>
        </VerticalContainer>
      </Card>
    </div>
  );
}