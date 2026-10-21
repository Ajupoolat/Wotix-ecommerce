import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "../../../../assets/Wotix removed-BG.png";
import bannerImage from "../../../../assets/Banner2.jpg";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { changePassword } from "@/api/users/profile/profilemgt";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod schema for password validation
const passwordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, "Current password is required")
    .min(8, "Current password must be at least 8 characters")
    .max(50, "Current password must be less than 50 characters")
    .trim(),
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

const ChangePasswordInput = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Mutation for changing password
  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      changePassword({
        userId: id,
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      reset();
      navigate(`/profile/${id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  // Form submission handler
  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="bg-white dark:bg-[#0B0F17] shadow-xl dark:shadow-2xl rounded-3xl border border-slate-200 dark:border-amber-500/20 flex flex-col sm:flex-row w-full max-w-4xl overflow-hidden transition-colors">
        {/* Left Section: Image */}
        <div className="w-full sm:w-1/2 hidden sm:block relative bg-slate-900">
          <img
            src={bannerImage}
            alt="Haute Horlogerie"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-8">
            <span className="font-cinzel text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
              Vault Security
            </span>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1">
              Protected Horology Reserve
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Maintain impenetrable encryption over your timepiece allocations, wallet credits, and collector portfolio.
            </p>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 bg-slate-50/50 dark:bg-[#0D121D] transition-colors">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Wotix Logo"
              className="h-16 w-auto object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Form */}
          <div className="text-center w-full max-w-md space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Change Password
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Update credentials to secure your collector vault.
              </p>
            </div>

            <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
              {/* Old Password Field */}
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold text-left mb-1.5"
                >
                  Current Password*
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className={`w-full rounded-xl border ${
                      errors.oldPassword ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                    } bg-white dark:bg-[#111622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs px-3.5 py-2.5 pr-10 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
                    {...register("oldPassword")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    disabled={isPending}
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 text-left font-mono">
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold text-left mb-1.5"
                >
                  New Password*
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Create strong new password"
                    className={`w-full rounded-xl border ${
                      errors.newPassword ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                    } bg-white dark:bg-[#111622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs px-3.5 py-2.5 pr-10 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
                    {...register("newPassword")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isPending}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 text-left font-mono">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold text-left mb-1.5"
                >
                  Confirm New Password*
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className={`w-full rounded-xl border ${
                      errors.confirmPassword ? "border-rose-500" : "border-slate-200 dark:border-white/10"
                    } bg-white dark:bg-[#111622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs px-3.5 py-2.5 pr-10 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
                    {...register("confirmPassword")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 text-left font-mono">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md mt-6 transition-all disabled:opacity-50 cursor-pointer"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Updating Credentials..." : "Authorize Password Change"}
              </button>
            </form>

            {/* Navigation Links */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <Link
                to={`/profile/${id}`}
                className="text-amber-800 dark:text-amber-400 hover:underline font-cinzel flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Profile</span>
              </Link>
              <button
                type="button"
                className="text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-cinzel text-xs cursor-pointer"
                onClick={() => navigate(`/profile/${id}/change-password`)}
              >
                Forgot credentials?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordInput;