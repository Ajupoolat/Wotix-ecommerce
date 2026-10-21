import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Timer, Percent } from "lucide-react";

const SpecialOfferBanner = ({ products }) => {
  const navigate = useNavigate();

  // Safely check for products with offers without throwing runtime exceptions
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  const productsWithOffer = products.filter(
    (p) => p && p.offer && typeof p.offer === "object" && typeof p.offer.discountValue === "number"
  );

  if (productsWithOffer.length === 0) {
    return null;
  }

  const maxDiscount = Math.max(
    ...productsWithOffer.map((p) => p.offer.discountValue || 0)
  );

  if (maxDiscount <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-10 border border-amber-500/30 bg-gradient-to-r from-[#0C101A] via-[#141A28] to-[#0C101A] shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      {/* Ambient gold glow backdrops */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative corner tag */}
      <div className="absolute top-0 right-0">
        <div className="flex items-center gap-1.5 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-bl-xl shadow-lg">
          <Sparkles className="w-3 h-3" />
          <span>Exclusive Vault Access</span>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-10 sm:py-9 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Content */}
        <div className="text-center md:text-left max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-1">
            <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Limited Allocation Window</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-cinzel text-white tracking-wide">
            Private Vault Sale: Up to{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
              {maxDiscount}% Privilege
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-sans">
            Acquire mastercrafted horological complications at curated collector privileges.
            Available strictly while allocated vault reserve lasts.
          </p>
        </div>

        {/* Right CTA */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate("/shop?offers=true")}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-semibold text-xs sm:text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Percent className="w-4 h-4 text-slate-950" />
            <span>Unlock Vault Offers</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferBanner;