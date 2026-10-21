import React from "react";
import { MapPin, Edit3, ArrowRight, ShieldCheck } from "lucide-react";

const DeliveryAddress = ({
  defaultAddress,
  setEditingAddress,
  setShowAddressForm,
  navigate,
  userId,
}) => {
  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-cinzel text-xs font-bold uppercase tracking-[0.18em]">
              Vault Delivery Destination
            </h2>
          </div>
          {defaultAddress?.isDefault && (
            <span className="bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Primary Vault
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs font-sans text-slate-700 dark:text-slate-300">
          <div className="flex items-start">
            <span className="w-28 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Recipient
            </span>
            <span className="text-slate-900 dark:text-white font-medium">{defaultAddress.fullName}</span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Contact Phone
            </span>
            <span className="text-slate-900 dark:text-white font-mono">{defaultAddress.phone}</span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Address Line
            </span>
            <span className="text-slate-900 dark:text-white">
              {defaultAddress.streetAddress}
              {defaultAddress.landmark && `, Near ${defaultAddress.landmark}`}
            </span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              City & State
            </span>
            <span className="text-slate-900 dark:text-white">
              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
            </span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Country
            </span>
            <span className="text-slate-900 dark:text-white">{defaultAddress.country}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              setEditingAddress(defaultAddress);
              setShowAddressForm(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30 text-xs font-cinzel font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Destination</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/address/${userId}`)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer"
          >
            Choose Alternate Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddress;