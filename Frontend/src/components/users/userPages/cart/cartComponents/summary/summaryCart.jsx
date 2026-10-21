import React from "react";
import { ArrowRight, ShoppingBag, RotateCcw, ShieldCheck, Lock } from "lucide-react";

const OrderSummary = ({
  totalPrice,
  shippingFee,
  onCheckout,
  onContinueShopping,
  onClearCart,
}) => {
  const total = totalPrice + shippingFee;

  return (
    <div className="w-full lg:w-1/3">
      <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 shadow-sm dark:shadow-2xl space-y-6 sticky top-24 transition-colors">
        {/* Title */}
        <div className="pb-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="font-cinzel text-base font-bold text-slate-900 dark:text-white uppercase tracking-[0.18em]">
            Vault Summary
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Complimentary insured white-glove packaging
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-3.5 text-xs font-sans">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Curated Subtotal</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              ₹{Number(totalPrice).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Insured White-Glove Transit</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              ₹{Number(shippingFee).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Certificate & Provenance Vaulting</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              Included
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-baseline">
            <span className="font-cinzel text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-semibold">
              Total Valuation
            </span>
            <div className="text-right">
              <span className="font-cinzel text-2xl font-bold text-amber-700 dark:text-amber-300">
                ₹{Number(total).toLocaleString("en-IN")}
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                Taxes Included
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onCheckout}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Proceed to Vault Checkout</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#0D121D] hover:bg-slate-200 dark:hover:bg-[#131A29] text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-amber-500/25 font-cinzel font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Curating</span>
          </button>

          <button
            type="button"
            onClick={onClearCart}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Shopping Bag</span>
          </button>
        </div>

        {/* Security badge */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400/80" />
          <span>256-Bit SSL Encrypted Horology Vault</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;