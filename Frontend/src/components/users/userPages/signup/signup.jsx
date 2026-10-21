import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "@/api/users/signup/signupcall";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import logo from "@/assets/Wotix removed-BG.png";
import bannerImg from "@/assets/bannerforhome.jpg";

// Define Zod schema
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "First name must contain only letters and spaces")
      .trim()
      .regex(/^\S.*\S$/, "First name cannot have leading or trailing spaces"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Last name must contain only letters and spaces")
      .trim()
      .regex(/^\S.*\S$/, "Last name cannot have leading or trailing spaces"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_.~`])[A-Za-z\d@$!%*?&#\-_.~`]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    refferalId: z
      .string()
      .optional()
      .refine(
        (val) => !val || (val.length >= 6 && /^[a-zA-Z0-9]+$/.test(val)),
        {
          message: "Referral code must be at least 6 alphanumeric characters",
        }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const navigate = useNavigate();
  const [showReferrerID, setShowReferrerID] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const API_URL_ = import.meta.env.VITE_API_URL_USER;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      refferalId: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      toast.success("Verification OTP dispatched to your email!");
      // CRIT-01 FIXED: Navigate to /verify-otp (not broken /otp)
      navigate("/verify-otp", { state: { email, mode: "signup" } });
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong sending OTP");
    },
  });

  const onSubmit = (data) => {
    setEmail(data.email);
    const formData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      refferalId: showReferrerID ? data.refferalId : "",
    };
    localStorage.setItem("signupData", JSON.stringify(formData));
    mutate(data.email);
  };

  const handleGoogleSignup = (e) => {
    e.preventDefault();
    window.open(`${API_URL_}/google`, "_self");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0B0F17] border border-amber-500/20 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Cinematic Horology Heritage Showcase */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-[#080C14] border-r border-white/5 overflow-hidden">
          <img
            src={bannerImg}
            alt="Wotix Haute Horlogerie"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/80" />

          {/* Top Brand */}
          <div className="relative z-10 space-y-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="WOTIX" className="h-10 w-auto filter drop-shadow" />
              <span className="font-cinzel text-xl font-bold tracking-[0.25em] text-amber-300">
                WOTIX
              </span>
            </Link>
            <p className="text-[10px] uppercase font-cinzel tracking-[0.3em] text-slate-400">
              Haute Horlogerie
            </p>
          </div>

          {/* Center Quotation */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-cinzel uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Private Horology Guild</span>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white leading-snug">
              Begin Your Journey of Horological Distinction.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Create your account to unlock serialized timepiece reservations, VIP allocations, and guaranteed international authenticity provenance.
            </p>
          </div>

          {/* Bottom Reassurance */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 font-sans border-t border-white/10 pt-4">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>256-Bit SSL Encrypted Vault Registration</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Create Collector Account
              </h1>
              <Link
                to="/login"
                className="text-xs font-cinzel text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
              >
                Sign In &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Enter your credentials to initiate your member allocation profile.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alexander"
                  className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-rose-400">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Laurent"
                  className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-rose-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                placeholder="connoisseur@luxury.com"
                className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-2.5 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-2.5 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Referrer ID Checkbox & Input */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showReferrerID}
                  onChange={() => setShowReferrerID(!showReferrerID)}
                  className="rounded border-white/20 bg-[#111622] text-amber-400 focus:ring-amber-400"
                />
                <span>I possess a Collector Invitation / Referral Code (+₹100 credit)</span>
              </label>

              {showReferrerID && (
                <div className="mt-2 space-y-1">
                  <input
                    type="text"
                    placeholder="Enter 6-character referral code"
                    className="w-full bg-[#111622] text-xs font-mono uppercase text-amber-300 px-3.5 py-2 rounded-xl border border-amber-500/30 focus:outline-none focus:border-amber-400"
                    {...register("refferalId")}
                  />
                  {errors.refferalId && (
                    <p className="text-[11px] text-rose-400">{errors.refferalId.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <span>Generating Verification Dispatch...</span>
              ) : (
                <>
                  <span>Verify Email & Join</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>

            {/* Google Signup Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0B0F17] px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500 absolute">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full py-3 rounded-xl bg-[#111622] hover:bg-[#161D2E] text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.27 21.43 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
