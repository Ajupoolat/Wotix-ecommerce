import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "../../../../assets/Wotix removed-BG.png";
import basketballHoop from "../../../../assets/baskectBall.jpg";
import { useMutation } from "@tanstack/react-query";
import { usersignup, sendOtp, checkotp } from "@/api/users/signup/signupcall";
import { useLocation, useNavigate } from "react-router-dom";
import { sendOtpforgot } from "@/api/users/signup/signupcall";
import toast from "react-hot-toast";

const Otp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [send, setSend] = useState(false);
  const [timer, setTimer] = useState(30);
  const email = location.state?.email || location.state?.emailid || "hll";
  const mode = location.state?.mode;
  const [otp, setOtp] = useState("");
  const storedData = JSON.parse(localStorage.getItem("signupData"));
  const formData = {
    ...storedData,
    email,
    otp,
  };

  // Mutation to verify OTP and signup
  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      mode === "signup" ? usersignup(formData) : checkotp({ email, otp }),
    onSuccess: () => {
      toast.success(
        mode === "signup" ? "sigup is successfull" : "the otp is verified"
      );
      navigate(mode === "signup" ? "/login" : "/forgotpasswordinput", {
        state: { email, otp },
      });
    },
    onError: (err) => {
      toast.error(
        mode === "signup"
          ? err.message || "otp verification failed"
          : err.message || "the otp is not valid"
      );
    },
  });

  // Mutation to resend OTP
  const { mutate: resendOtpMutation, isPending: isResending } = useMutation({
    mutationFn: () =>
      mode === "signup" ? sendOtp(email) : sendOtpforgot(email),
    onSuccess: () => {
      toast.success("OTP resent Seccussfully!");
      setTimer(30);
    },
    onError: (err) => {
      alert("Failed to resend OTP. Please try again.");
      toast.error(err.message || "the send otp have issue");
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(mode === "signup" ? formData : { email, otp });
  };

  // Handle resend OTP click
  const resendotp = () => {
    toast.success("the otp resent clicked");
    setSend(true);
  };

  // Effect to handle OTP resend when `send` changes
  useEffect(() => {
    if (send) {
      resendOtpMutation();
      setSend(false);
    }
  }, [send, resendOtpMutation]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

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
            <p className="text-sm text-gray-600 mb-2">
              Enter the confirmation code from your email.
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-4">
              Enter the confirmation code
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Enter your confirmation code"
                className="w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {error && (
                <p className="text-red-600">
                  {error.message || "Invalid OTP! Please try again."}
                </p>
              )}
              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Verifying OTP..." : "Verify code"}
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
                    <a
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={resendotp}
                    >
                      Resend now
                    </a>
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

export default Otp;
