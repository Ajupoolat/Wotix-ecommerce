import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "../../../assets/Wotix removed-BG.png";
import basketballHoop from "../../../assets/baskectBall.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetpassword } from "@/api/users/signup/signupcall";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod schema for password validation
const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters")
    .max(50, "New password must be less than 50 characters")
    .regex(
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_.~`])[A-Za-z\d@$!%*?&#\-_.~`]{8,}$/,
      "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .trim(),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your new password")
    .trim(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ForgotPasswordInput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, otp } = location.state || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userId = localStorage.getItem("userId");

  // React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Mutation for resetting password
  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, otp, newPassword }) =>
      resetpassword(email, otp, newPassword),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      reset();
      localStorage.removeItem("userId"); // Clear userId for security
      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        navigate("/login");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  // Form submission handler
  const onSubmit = (data) => {
    if (!email || !otp) {
      toast.error(
        "Missing email or OTP. Please restart the password reset process."
      );
      navigate("/forgot-password");
      return;
    }
    mutate({ email, otp, newPassword: data.newPassword });
  };

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
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 bg-[#F5F0E1]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo}
              alt="Wotix Logo"
              className="h-24 w-24 sm:h-40 sm:w-40 object-contain"
            />
          </div>

          {/* Form */}
          <div className="text-center w-full max-w-md">
            <p className="text-sm text-gray-600 mb-2">
              Set a strong password to keep your account secure.
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Reset Password</h1>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 text-left mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className={`w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500 pr-10 ${
                      errors.newPassword ? "border-red-500" : ""
                    }`}
                    {...register("newPassword")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 text-left">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 text-left mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className={`w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500 pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    {...register("confirmPassword")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 text-left">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-800 mt-6"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordInput;