import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  RotateCcw,
  Clock,
  Award,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/Wotix removed-BG.png";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-[#070A0F] text-slate-300 border-t border-amber-500/20 overflow-hidden mt-24">
      {/* Subtle ambient gold radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-gradient-to-b from-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Reassurance / Trust Signals Bar */}
      <div className="border-b border-white/5 bg-[#0A0E17]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-cinzel">
                  Certified Authentic
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% verified serial provenance
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-cinzel">
                  5-Year Warranty
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full international coverage
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-cinzel">
                  Insured Delivery
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complimentary armored transit
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-cinzel">
                  14-Day Returns
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seamless collector return policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Navigation & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Wotix Haute Horlogerie"
                  className="h-10 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]"
                />
                <div>
                  <span className="font-cinzel text-xl font-bold tracking-[0.25em] text-amber-300 block">
                    WOTIX
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 block -mt-1">
                    Haute Horlogerie
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              WOTIX curates mastercrafted timepieces for connoisseurs and collectors worldwide.
              Engineered with uncompromising precision, Swiss-inspired movement, and everlasting legacy.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 font-cinzel mb-2">
                Join the Collector's Circle
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Receive private invitations to limited-edition allocations and horological releases.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Welcome to the circle. Invitation dispatched to your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full bg-[#111622] text-xs text-slate-200 pl-9 pr-3 py-2.5 rounded-md border border-white/10 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-semibold tracking-wider uppercase rounded-md shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Complications & Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 font-cinzel mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  All Timepieces
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Chronograph"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Chronograph Series
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Automatic"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Automatic & Mechanical
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Dress"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Dress & Minimalist
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Sports"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Sports & Diver
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?offers=true"
                  className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Vault Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 font-cinzel mb-4">
              Collector Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/orders"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Track Order & Shipment
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Collector Vault Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Private Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Shopping Bag
                </Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-amber-200 transition-colors">
                  Horological Servicing
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-amber-200 transition-colors">
                  Certificate of Authenticity
                </span>
              </li>
            </ul>
          </div>

          {/* Maison & Salons */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 font-cinzel mb-4">
              Maison
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Geneva • London • New York • Dubai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:concierge@wotix.luxury"
                  className="hover:text-amber-200 transition-colors"
                >
                  concierge@wotix.luxury
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+1 (800) 489-WOTIX</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-white/5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2">
                Secure Vault Checkout
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                  256-BIT SSL
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                  RAZORPAY
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                  VISA / MC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="border-t border-white/5 bg-[#05070B] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} WOTIX Haute Horlogerie Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-amber-300 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">
              Terms of Horology
            </span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">
              Provenance & Compliance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
