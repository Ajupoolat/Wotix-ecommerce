import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '../../../../assets/Wotix removed-BG.png';
import basketballHoop from '../../../../assets/baskectBall.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { editprofile } from '@/api/users/profile/profilemgt';
import { sendOtpforgot } from '@/api/users/signup/signupcall';
import { checkotp } from '@/api/users/signup/signupcall';
import toast from 'react-hot-toast';

const OtpEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState("");
  const id = localStorage.getItem('userId');
  
  // Get data from navigation state and localStorage
  const email = location.state?.email ||location.state?.emailid||'';
  const userid = location.state?.userId || '';
  const storedData = JSON.parse(localStorage.getItem("editProfileData")) || {};

  // Mutation for sending OTP (resend)
  const { mutate: resendOtpMutation } = useMutation({
    mutationFn: sendOtpforgot,
    onSuccess: () => {
      toast.success('OTP resent successfully!');
      setTimer(30);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to resend OTP');
    },
  });

  // Mutation for verifying OTP for password reset
  const { mutate: verifyOtpMutation } = useMutation({
    mutationFn: checkotp,
    onSuccess: () => {
      toast.success('OTP verified successfully!');
      navigate('/createpassword', { state: { email, otp } });
    },
    onError: (err) => {
      toast.error(err.message || 'OTP verification failed');
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
      toast.success('Profile updated successfully!');
      localStorage.removeItem("editProfileData");
      navigate(`/profile/${id}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Profile update failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (userid) {
      // Password reset flow
      verifyOtpMutation({ email, otp });
    } else {
      // Profile update flow
      updateProfileMutation();
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    if (userid) {
      // For password reset flow
      resendOtpMutation(email);
    } else {
      // For profile update flow (you might need a different resend function)
      resendOtpMutation(email);
    }
  };

  // Timer effect
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
              Enter the confirmation code sent to {email}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-4">
              {userid ? 'Password Reset Verification' : 'Profile Update Verification'}
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Enter your confirmation code"
                className="w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                type="submit"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Verifying..." : 
                 (userid ? "Verify and Reset Password" : "Verify and Update Profile")}
              </Button>
            </form>

            {/* Resend Link with Timer */}
            <div className="mt-4 text-center sm:text-left">
              <p className="text-sm text-gray-600">
                {timer > 0 ? (
                  `Resend OTP in ${timer} seconds`
                ) : (
                  <>
                    Didn't receive confirmation code?{' '}
                    <button
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={handleResendOtp}
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

export default OtpEdit;