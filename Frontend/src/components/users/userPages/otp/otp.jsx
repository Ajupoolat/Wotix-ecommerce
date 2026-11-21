import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersignup } from "@/api/users/signup/signupcall";
import { requestOtpApi, verifyOtpApi } from "@/api/common/otpApi";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useOtpTimer from "@/hooks/useOtpTimer";
import OtpVerificationCard from "@/components/common/OtpVerificationCard";

const Otp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { timer, resetTimer } = useOtpTimer(30);
  const email = location.state?.email || location.state?.emailid || "";
  const mode = location.state?.mode;
  const [otp, setOtp] = useState("");
  const storedData = JSON.parse(localStorage.getItem("signupData")) || {};
  const formData = {
    ...storedData,
    email,
    otp,
  };

  // Mutation to verify OTP and signup
  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      mode === "signup" ? usersignup(formData) : verifyOtpApi({ email, otp }),
    onSuccess: () => {
      toast.success(
        mode === "signup" ? "Signup is successful" : "The OTP is verified"
      );
      navigate(mode === "signup" ? "/login" : "/reset-password", {
        state: { email, otp },
      });
    },
    onError: (err) => {
      toast.error(
        mode === "signup"
          ? err.message || "OTP verification failed"
          : err.message || "The OTP is not valid"
      );
    },
  });

  // Mutation to resend OTP
  const { mutate: resendOtpMutation } = useMutation({
    mutationFn: () =>
      mode === "signup"
        ? requestOtpApi({ email, type: "signup" })
        : requestOtpApi({ email, type: "forgot" }),
    onSuccess: () => {
      toast.success("OTP resent successfully!");
      resetTimer(30);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to resend OTP. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the confirmation code");
      return;
    }
    mutate();
  };

  const handleResend = () => {
    resendOtpMutation();
  };

  return (
    <OtpVerificationCard
      title="Enter the confirmation code"
      subtitle="Enter the confirmation code from your email."
      otp={otp}
      setOtp={setOtp}
      onSubmit={handleSubmit}
      onResend={handleResend}
      timer={timer}
      isPending={isPending}
      submitText="Verify code"
      loadingText="Verifying OTP..."
      error={error}
    />
  );
};

export default Otp;
