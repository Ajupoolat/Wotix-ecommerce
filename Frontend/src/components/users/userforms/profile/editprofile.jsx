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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-20 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-semibold">
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information. Changes will require
              verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? "Sending OTP..." : "Verify Changes"}
                  <PencilIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;
