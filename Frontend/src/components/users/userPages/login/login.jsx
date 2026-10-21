import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import logo from "@/assets/Wotix removed-BG.png";
import bannerImg from "@/assets/Banner2.jpg";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authuser";
import { EyeOff, Eye, ShieldCheck, Sparkles, ArrowRight, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const API_URL_ = import.meta.env.VITE_API_URL_USER;
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "blocked") {
      toast.error("Your account has been restricted by the atelier administration.");
    } else if (error === "auth_failed") {
      toast.error("Google authentication failed. Please try again.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.message === "Login successful") {
        toast.success("Welcome back to WOTIX Haute Horlogerie.");
        window.location.href = "/";
      }
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials provided");
    },
  });

  const onSubmit = (data) => {
    localStorage.setItem("emaiofuser", data.email);
    mutate(data);
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    window.open(`${API_URL_}/google`, "_self");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0B0F17] border border-amber-500/20 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Cinematic Watch Showcase */}
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
              <span>Connoisseur Access</span>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white leading-snug">
              Access Your Personal Horological Vault.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Authenticate to manage timepieces in your collection, track white-glove shipments, and view private allocations.
            </p>
          </div>

          {/* Bottom Security */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 font-sans border-t border-white/10 pt-4">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Encrypted Vault Security Protocol</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Collector Sign In
              </h1>
              <Link
                to="/signup"
                className="text-xs font-cinzel text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
              >
                Register &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Enter your registered credentials to access your WOTIX vault.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                placeholder="connoisseur@luxury.com"
                className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-amber-400/90 hover:text-amber-300 font-sans transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-[#111622] text-xs text-slate-200 px-3.5 py-3 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isPending ? (
                <span>Validating Authenticity...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Access Vault Account</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>

            {/* Google Login Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0B0F17] px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500 absolute">
                Or Authenticate With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
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
              <span>Sign In with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
