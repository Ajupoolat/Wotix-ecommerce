import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";
import { Footer } from "@/components/common/footer";
import LoaderSpinner from "@/components/common/spinner";
import ErrorCommon from "@/components/common/CommonError";
import Restricter from "@/components/common/restricter";
import Breadcrumbs from "@/components/common/breadCrums";
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  MapPin,
  ShoppingBag,
  Wallet,
  Key,
  Edit3,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const { id } = useParams();
  const email = localStorage.getItem("email");
  const [copied, setCopied] = useState(false);

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => viewprofile(id, email),
  });

  const handleCopyReferral = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Referral invitation code copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError && error.message !== "Oops this page is not get !") {
    return <ErrorCommon />;
  }

  if (error && error.message === "Oops this page is not get !") {
    return <Restricter />;
  }

  const referralCode = profileData?.refferalId || "WOTIX-VIP";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault Profile" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
          {/* Profile Prestige Header Banner */}
          <div className="relative bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-500/10 dark:from-[#0C121E] dark:via-[#161F32] dark:to-[#0C121E] p-8 sm:p-10 border-b border-slate-200 dark:border-amber-500/20 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-cinzel font-bold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                  {(profileData?.firstName?.[0] || username?.[0] || "W").toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold">
                      WOTIX Certified Member
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
                    {profileData?.firstName} {profileData?.lastName || ""}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Collector ID: {id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => navigate(`/profile/${id}/edit-profile/${id}`)}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 dark:border-white/5 bg-slate-100/70 dark:bg-[#080B11] transition-colors">
            <button
              className="py-4 px-4 text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 border-b-2 border-amber-600 dark:border-amber-400 flex items-center justify-center gap-2 bg-amber-500/10 dark:bg-amber-500/5"
            >
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Personal Vault</span>
            </button>
            <button
              onClick={() => navigate(`/address/${id}`)}
              className="py-4 px-4 text-xs font-cinzel uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.02] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Delivery Addresses</span>
            </button>
            <button
              onClick={() => navigate("/orderslist")}
              className="py-4 px-4 text-xs font-cinzel uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.02] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Vault Orders</span>
            </button>
            <button
              onClick={() => navigate(`/profile/${id}/wallet/${id}`)}
              className="py-4 px-4 text-xs font-cinzel uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.02] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Store Wallet</span>
            </button>
          </div>

          {/* Profile Details Content */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 p-5 space-y-1 shadow-sm transition-colors">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="uppercase tracking-wider font-cinzel text-[10px]">
                    Full Name
                  </span>
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white pt-1">
                  {profileData?.firstName} {profileData?.lastName}
                </p>
              </div>

              {/* Email Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 p-5 space-y-1 shadow-sm transition-colors">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="uppercase tracking-wider font-cinzel text-[10px]">
                    Registered Email
                  </span>
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white pt-1">
                  {profileData?.email || email}
                </p>
              </div>

              {/* Referral Privilege Card */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:via-[#0D121D] dark:to-[#0D121D] border border-amber-500/30 dark:border-amber-500/25 p-5 space-y-3 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-cinzel font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Collector Referral Privilege</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                    ₹100 Credit
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Introduce a fellow connoisseur to WOTIX. Receive ₹100 direct wallet credit upon their first verified timepiece acquisition.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 bg-white dark:bg-[#080B11] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono text-amber-800 dark:text-amber-300 text-xs tracking-wider">
                    {referralCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReferral(referralCode)}
                    className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/40 text-xs font-cinzel uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Account Tier Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 p-5 space-y-2 shadow-sm transition-colors">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="uppercase tracking-wider font-cinzel text-[10px]">
                    Membership Tier
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-cinzel font-bold text-amber-800 dark:text-amber-300">
                    VIP Connoisseur
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-white/5 px-2 py-1 rounded">
                    Complimentary White-Glove
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enjoy priority concierge access and early previews of limited-production horological editions.
                </p>
              </div>
            </div>

            {/* Bottom Security / Password Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Account protected by 256-Bit SSL Horology Vault Authentication</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/changePassword/${id}`)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0D121D] dark:hover:bg-[#141C2E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-cinzel uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
