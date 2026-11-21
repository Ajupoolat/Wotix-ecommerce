import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { editprofile } from "@/api/users/profile/profilemgt";
import { requestOtpApi, verifyOtpApi } from "@/api/common/otpApi";
import toast from "react-hot-toast";
import useOtpTimer from "@/hooks/useOtpTimer";
import OtpVerificationCard from "@/components/common/OtpVerificationCard";

const OtpEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { timer, resetTimer } = useOtpTimer(30);
  const [otp, setOtp] = useState("");
  const id = localStorage.getItem("userId");

  // Get data from navigation state and localStorage
  const email = location.state?.email || location.state?.emailid || "";
  const userid = location.state?.userId || "";
  const storedData = JSON.parse(localStorage.getItem("editProfileData")) || {};

  // Mutation for sending OTP (resend)
  const { mutate: resendOtpMutation } = useMutation({
    mutationFn: (email) => requestOtpApi({ email, type: "forgot" }),
    onSuccess: () => {
      toast.success("OTP resent successfully!");
      resetTimer(30);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to resend OTP");
    },
  });

  // Mutation for verifying OTP for password reset
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useMutation({
    mutationFn: ({ email, otp }) => verifyOtpApi({ email, otp }),
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      navigate("/createpassword", { state: { email, otp } });
    },
    onError: (err) => {
      toast.error(err.message || "OTP verification failed");
    },
  });

  // Mutation for updating profile
  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      const updatedProfile = await editprofile({
        ...storedData,
        otp,
      });
      return updatedProfile;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      localStorage.removeItem("editProfileData");
      navigate(`/profile/${id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Profile update failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the confirmation code");
      return;
    }

    if (userid) {
      verifyOtpMutation({ email, otp });
    } else {
      updateProfileMutation();
    }
  };

  const handleResendOtp = () => {
    resendOtpMutation(email);
  };

  const isPending = isVerifyingOtp || isUpdatingProfile;

  return (
    <OtpVerificationCard
      title={userid ? "Password Reset Verification" : "Profile Update Verification"}
      subtitle={`Enter the confirmation code sent to ${email}`}
      otp={otp}
      setOtp={setOtp}
      onSubmit={handleSubmit}
      onResend={handleResendOtp}
      timer={timer}
      isPending={isPending}
      submitText={userid ? "Verify and Reset Password" : "Verify and Update Profile"}
      loadingText="Verifying..."
    />
  );
};

export default OtpEdit;
