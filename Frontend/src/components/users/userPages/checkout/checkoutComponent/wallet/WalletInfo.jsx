import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, CreditCard, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getWallet } from "@/api/users/shop/walletmgt";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const WalletInfo = ({ isOpen, onClose, subtotal, onPayNow }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const page = 1;
  const limit = 10;

  const { data: wallet, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWallet(userId, page, limit),
    enabled: !!userId,
  });

  // Validations
  if (!userId) {
    toast.error("User not logged in. Please log in to proceed.");
    return null;
  }

  if (walletLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/30 text-slate-800 dark:text-slate-100 rounded-2xl p-6">
          <p className="text-xs text-slate-500 font-mono text-center py-4">Accessing vault ledger...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (walletError || !wallet?.wallet) {
    toast.error("Failed to load wallet information. Please try again.");
    return null;
  }

  if (typeof subtotal !== "number" || subtotal < 0) {
    toast.error("Invalid order amount. Please check your cart.");
    return null;
  }

  const total = wallet?.wallet?.balance || 0;
  const balanceAmount = total - subtotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/30 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-colors">
        <DialogHeader>
          <DialogTitle className="text-sm font-cinzel font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Vault Horology Reserve
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Wallet Balance Section */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-[10px] font-cinzel uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Reserve Balance
                </p>
                <p className="text-xl font-cinzel font-bold text-amber-800 dark:text-amber-300">
                  ₹{total.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/profile/${userId}/wallet/${userId}`);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-1 font-sans">
            <p className="flex justify-between">
              <span>Payable Order Amount:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                ₹{subtotal.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Remaining Reserve Post-Debit:</span>
              <span className={`font-mono font-bold ${balanceAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                ₹{balanceAmount.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Pay Now Button */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
              onClick={() => {
                if (total <= 0) {
                  toast.error("Your wallet balance is zero");
                  return;
                }
                if (balanceAmount < 0) {
                  toast.error(
                    `Insufficient reserve. Shortfall: ₹${Math.abs(balanceAmount).toFixed(2)}`
                  );
                  return;
                }
                onPayNow();
                onClose();
              }}
              disabled={walletLoading || walletError}
            >
              Authorize Vault Debit
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletInfo;
