import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import { getWallet } from "@/api/users/shop/walletmgt";
import toast from "react-hot-toast";
import Restricter from "@/components/common/restricter";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import ErrorCommon from "@/components/common/CommonError";
import Pagination from "@/components/common/pagination";
import Breadcrumbs from "@/components/common/breadCrums";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw,
  Clock,
  Sparkles,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

const WalletPage = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("balance");

  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: walletData,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["wallet", id, page],
    queryFn: () => getWallet(id, page, limit),
    select: (data) => {
      const transactions = data.wallet?.transactions || [];
      return {
        ...data.wallet,
        totalAdded: transactions
          .filter((t) => t.type === "credit" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0),
        totalSpent: transactions
          .filter((t) => t.type === "debit" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0),
        pendingDebits: transactions
          .filter((t) => t.type === "debit" && t.status === "pending")
          .reduce((sum, t) => sum + t.amount, 0),
        pagination: data.pagination || {},
      };
    },
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => viewprofile(id, email),
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (walletData?.pagination?.totalPages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchWallet().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  if (isProfileLoading || isWalletLoading) {
    return <LoaderSpinner />;
  }

  if (isProfileError || isWalletError) {
    return <ErrorCommon />;
  }

  const transactions = walletData?.transactions || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault", link: `/profile/${id}` },
          { label: "Store Wallet" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block mb-1">
              Collector Credits & Balance
            </span>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              WOTIX Vault Wallet
            </h1>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-cinzel uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Balance"}</span>
          </button>
        </div>

        {/* Hero Balance Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-500/10 dark:from-[#0C121E] dark:via-[#141B2C] dark:to-[#0C121E] border border-amber-500/30 p-8 sm:p-10 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
                Available Horology Reserve
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-cinzel text-4xl sm:text-5xl font-bold text-amber-800 dark:text-amber-300">
                  ₹{Number(walletData?.balance || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">INR</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                Usable instantly toward any certified timepiece or complications in the catalog.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Acquire Timepieces
              </button>
            </div>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-5 space-y-1 shadow-sm transition-colors">
            <span className="text-[10px] uppercase font-cinzel tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Credits Added
            </span>
            <div className="font-cinzel text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{Number(walletData?.totalAdded || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Includes referral bonuses and refund credits
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-5 space-y-1 shadow-sm transition-colors">
            <span className="text-[10px] uppercase font-cinzel tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Disbursed / Spent
            </span>
            <div className="font-cinzel text-2xl font-bold text-amber-800 dark:text-amber-300">
              ₹{Number(walletData?.totalSpent || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Applied toward timepiece checkouts
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-5 space-y-1 shadow-sm transition-colors">
            <span className="text-[10px] uppercase font-cinzel tracking-wider text-slate-500 dark:text-slate-400 block">
              Vault Protection
            </span>
            <div className="font-cinzel text-base font-bold text-slate-900 dark:text-white pt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>100% Encrypted</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Zero unauthorized deductions guaranteed
            </p>
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
              Vault Transaction Ledger ({walletData?.pagination?.totalTransactions || transactions.length})
            </h3>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Clock className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-cinzel text-slate-700 dark:text-slate-300">
                No Transactions Recorded
              </p>
              <p className="text-xs text-slate-500">
                Wallet activity such as returns, referral rewards, or order payments will be cataloged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5 text-xs font-sans">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 font-cinzel text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Date & Time</th>
                    <th className="py-3 px-4 text-left">Classification</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {transactions.map((tx, idx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <tr key={tx._id || idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-cinzel font-semibold text-slate-900 dark:text-white block">
                            {tx.referenceType === "cancellation"
                              ? "Cancellation Refund"
                              : tx.referenceType === "return"
                              ? "Return Refund"
                              : tx.referenceType === "order"
                              ? isCredit
                                ? "Order Adjustment Refund"
                                : "Timepiece Order Payment"
                              : tx.referenceType?.toUpperCase() || "Vault Credit"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              tx.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-sm">
                          <span
                            className={isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-300"}
                          >
                            {isCredit ? "+" : "-"}₹
                            {Number(tx.amount).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {walletData?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={walletData.pagination.currentPage}
              totalPages={walletData.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletPage;
