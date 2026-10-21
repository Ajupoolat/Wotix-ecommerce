import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Compass, ShieldCheck, Flame } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category");
  const isShop = location.pathname === "/shop";

  const categories = [
    { label: "All Timepieces", path: "/shop", active: isShop && !currentCategory },
    { label: "Chronograph", path: "/shop?category=Chronograph", active: isShop && currentCategory === "Chronograph" },
    { label: "Automatic", path: "/shop?category=Automatic", active: isShop && currentCategory === "Automatic" },
    { label: "Dress", path: "/shop?category=Dress", active: isShop && currentCategory === "Dress" },
    { label: "Sports & Diver", path: "/shop?category=Sports", active: isShop && currentCategory === "Sports" },
    {
      label: "Vault Offers",
      path: "/shop?offers=true",
      active: isShop && searchParams.get("offers") === "true",
      highlight: true,
    },
  ];

  return (
    <nav className="w-full bg-white/95 dark:bg-[#080B11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-amber-500/15 sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Category Navigation Links (Horizontally scrollable on mobile) */}
          <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-6 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat, idx) => {
              const isSelected = cat.active;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(cat.path)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-medium tracking-[0.14em] uppercase transition-all duration-200 rounded-sm ${
                    isSelected
                      ? "text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/10"
                      : cat.highlight
                      ? "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/5 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-200/90 hover:bg-slate-100 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {cat.highlight && <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />}
                  <span>{cat.label}</span>
                  {isSelected && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-500/40 via-amber-500 dark:via-amber-400 to-amber-500/40 shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Micro Reassurance Badge */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-sans tracking-wider border-l border-slate-200 dark:border-white/10 pl-5">
            <span className="flex items-center gap-1.5 text-amber-700/90 dark:text-amber-300/80 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>100% Certified Horology</span>
            </span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer" onClick={() => navigate("/shop")}>
              Complimentary White-Glove Shipping
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
