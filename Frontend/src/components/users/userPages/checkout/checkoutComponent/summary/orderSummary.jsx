import React from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tag, Sparkles, X, Check, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import watchPlaceholder from "@/assets/watch image.jpg";

const OrderSummary = ({
  cart,
  appliedCoupons = [],
  subtotal,
  totalDiscount,
  shipping,
  finalTotal,
  availableCoupons = [],
  isApplyingCoupon,
  couponForm,
  applyCouponMutate,
  countapply,
  handleRemoveCoupon,
  couponError,
}) => {
  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
        <div className="pb-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <h2 className="font-cinzel text-xs font-bold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
            Order Review & Valuation
          </h2>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {cart?.items?.length || 0} Timepieces
          </span>
        </div>

        {/* Cart items list */}
        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {cart?.items?.map((item) => {
            const product = item.product || {};
            const img = product.images?.[0] || watchPlaceholder;
            const originalPrice = item.originalPrice ?? product.price ?? 0;
            const discountedPrice = item.discountedPrice ?? item.price ?? originalPrice;
            const hasOffer = discountedPrice < originalPrice;

            return (
              <div
                key={product._id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/5 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-white dark:bg-[#080B11] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      e.target.src = watchPlaceholder;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-cinzel text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Qty: {item.quantity}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-cinzel text-amber-800 dark:text-amber-300 font-bold">
                        ₹{(discountedPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {hasOffer && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                          ₹{(originalPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Coupons Banner */}
        {availableCoupons?.length > 0 && !appliedCoupons.length && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-cinzel font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Privilege Vouchers Available</span>
            </div>
            <div className="space-y-1.5">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  onClick={() => {
                    if (countapply <= 0) {
                      couponForm.setValue("couponCode", coupon.code);
                      applyCouponMutate(coupon.code);
                    } else {
                      toast.error("Only one privilege voucher can be redeemed per transaction.");
                    }
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/90 dark:bg-[#0D121D]/80 hover:bg-slate-100 dark:hover:bg-[#141C2E] border border-amber-500/20 text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-300">{coupon.code}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      ({coupon.discountType === "flat" ? `₹${coupon.discountValue} Off` : `${coupon.discountValue}% Off`})
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-cinzel font-semibold">
                    Tap to Apply
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voucher Input Form */}
        <div>
          <Form {...couponForm}>
            <form
              onSubmit={couponForm.handleSubmit((data) => {
                if (countapply <= 0) {
                  applyCouponMutate(data.couponCode);
                } else {
                  toast.error("Only one privilege voucher can be applied.");
                }
              })}
              className="flex gap-2"
            >
              <FormField
                control={couponForm.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Enter privilege voucher code"
                        className="w-full bg-slate-50 dark:bg-[#111622] text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal"
                        {...field}
                        disabled={isApplyingCoupon}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] text-rose-500 dark:text-rose-400 mt-1" />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={isApplyingCoupon}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-cinzel font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isApplyingCoupon ? "Validating..." : "Apply"}
              </button>
            </form>
          </Form>

          {/* Applied Coupons Tag */}
          {appliedCoupons.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {appliedCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span className="font-mono font-bold">{coupon.code}</span>
                    <span>
                      ({coupon.discountType === "flat" ? `₹${coupon.discountValue} Off` : `${coupon.discountValue}% Off`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoupon(coupon._id)}
                    className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {couponError && (
            <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5">{couponError}</p>
          )}
        </div>

        {/* Valuation Breakdown */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              ₹{Number(subtotal).toLocaleString("en-IN")}
            </span>
          </div>

          {appliedCoupons.length > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Privilege Voucher Discount</span>
              <span className="font-mono font-semibold">
                -₹{Number(totalDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Insured White-Glove Transit</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              ₹{Number(shipping).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex justify-between items-baseline">
            <span className="font-cinzel text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-semibold">
              Total Payable
            </span>
            <div className="text-right">
              <span className="font-cinzel text-2xl font-bold text-amber-800 dark:text-amber-300">
                ₹{Number(finalTotal).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono">
                All Import & Luxury Duties Included
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;