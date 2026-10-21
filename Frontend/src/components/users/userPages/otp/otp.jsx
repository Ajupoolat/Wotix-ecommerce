import React, { useEffect, useState } from "react";
import logo from "@/assets/Wotix removed-BG.png";
import bannerWatch from "@/assets/Banner2.jpg";
import { useMutation } from "@tanstack/react-query";
import { usersignup, sendOtp, checkotp, sendOtpforgot } from "@/api/users/signup/signupcall";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Sparkles, ArrowRight, RotateCw, Lock } from "lucide-react";

const Otp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [send, setSend] = useState(false);
  const [timer, setTimer] = useState(30);
  const email = location.state?.email || location.state?.emailid || "";
  const mode = location.state?.mode;
  const [otp, setOtp] = useState("");
  const storedData = JSON.parse(localStorage.getItem("signupData") || "{}");
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
        mode === "signup"
          ? "Collector verification successful! Please sign in."
          : "Authentication verified. Proceed to password creation."
      );
      navigate(mode === "signup" ? "/login" : "/reset-password", {
        state: { email, otp },
      });
    },
    onError: (err) => {
      toast.error(
        mode === "signup"
          ? err.message || "OTP verification failed"
          : err.message || "Invalid or expired verification code"
      );
    },
  });

  // Mutation to resend OTP
  const { mutate: resendOtpMutation, isPending: isResending } = useMutation({
    mutationFn: () =>
      mode === "signup" ? sendOtp(email) : sendOtpforgot(email),
    onSuccess: () => {
      toast.success("New verification code dispatched to your inbox.");
      setTimer(30);
    },
    onError: (err) => {
      toast.error(err.message || "Unable to resend verification code");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    mutate(mode === "signup" ? formData : { email, otp });
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setSend(true);
  };

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
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0B0F17] border border-amber-500/20 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Section: Horology Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-[#080C14] border-r border-white/5 overflow-hidden">
          <img
            src={bannerWatch}
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

          {/* Center Message */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-cinzel uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Identity Verification</span>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white leading-snug">
              Guarding the Integrity of Every Collector.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              To preserve authentic allocation provenance, please verify ownership of your registered communication channel.
            </p>
          </div>

          {/* Bottom Security */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 font-sans border-t border-white/10 pt-4">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Time-Sensitive Single Use Passcode</span>
          </div>
        </div>

        {/* Right Section: OTP Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-8">
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Verify Code
            </h1>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              We have dispatched a 6-digit verification code to:
            </p>
            <p className="text-sm font-mono text-amber-300 font-bold truncate">
              {email || "your registered email"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-cinzel uppercase tracking-wider text-slate-300">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl text-amber-300 bg-[#111622] px-4 py-3.5 rounded-2xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600 placeholder:tracking-[0.4em]"
                autoFocus
              />
              {error && (
                <p className="text-xs text-rose-400 mt-1 text-center">
                  {error.message || "Invalid verification code. Please check and retry."}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || otp.length < 4}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span>Validating Passcode...</span>
              ) : (
                <>
                  <span>Authenticate Code</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>

          {/* Resend Link with Timer */}
          <div className="mt-6 text-center text-xs text-slate-400 font-sans border-t border-white/5 pt-4">
            {timer > 0 ? (
              <span className="font-mono text-slate-400">
                Resend code available in{" "}
                <strong className="text-amber-400">{timer}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-amber-400 hover:text-amber-300 font-cinzel font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Dispatching Code..." : "Resend Verification Code"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Otp;
