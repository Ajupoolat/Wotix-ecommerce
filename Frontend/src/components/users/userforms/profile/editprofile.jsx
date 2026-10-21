import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { viewprofile } from "@/api/users/profile/profilemgt";
import { PencilIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import logo from "../../../../assets/Wotix removed-BG.png";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sendotpedit } from "@/api/users/profile/profilemgt";
import toast from "react-hot-toast";

// Zod schema for form validation
const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(500, "first must be less than 500 characters")
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "First name can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "First name cannot have leading or trailing spaces")
    .nonempty("first name is required"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(500, "Last name must be less than 500 characters")
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Last name can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "Last name cannot have leading or trailing spaces")
    .nonempty("Last name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
});

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Mutation for sending OTP
  const { mutate: sendOtpMutation, isPending } = useMutation({
    mutationFn: ({ email, userId }) => sendotpedit(email, userId),

    onSuccess: () => {
      toast.success("OTP sent successfully!");
      // Store form data in localStorage before navigating
      const formData = getValues();
      localStorage.setItem(
        "editProfileData",
        JSON.stringify({
          ...formData,
          userId: userId,
        })
      );
      navigate("/profile/:id/edit-profile/:id/otpverify", {
        state: {
          email: formData.email,
          mode: "edit",
        },
      });
      localStorage.setItem("email", formData.email);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send OTP");
    },
  });

  // API call to fetch profile data
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", id, email],
    queryFn: () => viewprofile(id, email),
  });

  // Reset form with fetched data when profileData is available
  useEffect(() => {
    if (profileData) {
      reset({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
      });
    }
  }, [profileData, reset]);

  const onSubmit = (data) => {
    sendOtpMutation({ email: data.email, userId: id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] flex items-center justify-center text-rose-500 font-cinzel text-sm">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Wotix Logo"
              className="h-14 w-auto cursor-pointer object-contain"
              onClick={() => navigate("/")}
            />
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#0B0F17] shadow-xl dark:shadow-2xl rounded-3xl border border-slate-200 dark:border-amber-500/20 p-6 sm:p-8 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Edit Collector Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your personal credentials. Email modifications will require dual verification.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="firstName"
                className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold"
              >
                First Name *
              </label>
              <input
                id="firstName"
                {...register("firstName")}
                className={`w-full rounded-xl border ${
                  errors.firstName ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                } bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
              />
              {errors.firstName && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="lastName"
                className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                {...register("lastName")}
                className={`w-full rounded-xl border ${
                  errors.lastName ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                } bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
              />
              {errors.lastName && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold"
              >
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full rounded-xl border ${
                  errors.email ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                } bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !isDirty}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span>{isPending ? "Dispatching OTP..." : "Verify & Save"}</span>
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
