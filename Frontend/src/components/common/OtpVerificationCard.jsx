import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Wotix removed-BG.png";
import basketballHoop from "@/assets/baskectBall.jpg";

/**
 * Reusable Card component for OTP Verification across the app
 */
const OtpVerificationCard = ({
  title = "Enter the confirmation code",
  subtitle = "Enter the confirmation code from your email.",
  otp,
  setOtp,
  onSubmit,
  onResend,
  timer = 0,
  isPending = false,
  submitText = "Verify code",
  loadingText = "Verifying code...",
  error = null,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-lg rounded-lg flex flex-col sm:flex-row w-full max-w-4xl">
        {/* Left Section: Image */}
        <div className="w-full sm:w-1/2 hidden sm:block">
          <img
            src={basketballHoop}
            alt="Basketball Hoop"
            className="h-full w-full object-cover rounded-l-lg"
          />
        </div>

        {/* Right Section: Form */}
        <div className="w-full sm:w-1/2 p-6 sm:p-8 bg-[#F5F0E1]">
          {/* Logo */}
          <div className="flex items-center justify-center sm:justify-start mt-25">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24 sm:h-40 sm:w-40 object-contain"
            />
          </div>

          {/* Form */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{title}</h1>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                type="text"
                placeholder="Enter your confirmation code"
                className="w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {error && (
                <p className="text-red-600">
                  {typeof error === "string"
                    ? error
                    : error.message || "Invalid OTP! Please try again."}
                </p>
              )}
              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isPending}
                type="submit"
              >
                {isPending ? loadingText : submitText}
              </Button>
            </form>

            {/* Resend Link with Timer */}
            <div className="mt-4 text-center sm:text-left">
              <p className="text-sm text-gray-600">
                {timer > 0 ? (
                  `Resend OTP in ${timer} seconds`
                ) : (
                  <>
                    Didn't receive confirmation code?{" "}
                    <button
                      type="button"
                      className="text-blue-500 hover:underline cursor-pointer font-medium"
                      onClick={onResend}
                    >
                      Resend now
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationCard;

