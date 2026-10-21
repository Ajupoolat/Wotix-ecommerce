import React from "react";
import { MapPin, Edit3, Trash2, CheckCircle2, ShieldCheck, Plus } from "lucide-react";

const AddressList = ({
  addresses = [],
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
        <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
          Saved Destinations ({addresses.length})
        </h3>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-dashed border-amber-500/30 dark:border-amber-500/20 p-12 text-center space-y-4 shadow-sm transition-colors">
          <MapPin className="w-12 h-12 text-amber-600 dark:text-amber-400/50 mx-auto" />
          <h4 className="font-cinzel text-lg font-bold text-slate-900 dark:text-white">
            No Destinations Configured
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            You have not registered any delivery destinations yet. Add an address to facilitate swift white-glove transit.
          </p>
          <button
            onClick={() => onEdit(null)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`rounded-2xl p-6 relative transition-all duration-300 flex flex-col justify-between ${
                address.isDefault
                  ? "bg-amber-500/5 dark:bg-[#0D1424] border-2 border-amber-600/70 dark:border-amber-400/70 shadow-[0_8px_30px_rgba(212,175,55,0.15)]"
                  : "bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 hover:border-amber-500/40 shadow-sm"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Primary Vault Destination</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">
                    Recipient
                  </span>
                  <h4 className="font-cinzel text-base font-bold text-slate-900 dark:text-white">
                    {address.fullName}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Phone: {address.phone}
                    {address.alternatePhone && ` • Alt: ${address.alternatePhone}`}
                  </p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <p className="text-slate-900 dark:text-white font-medium">{address.streetAddress}</p>
                  {address.landmark && (
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p>
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {address.country}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                {!address.isDefault && (
                  <button
                    onClick={() => onSetDefault(address._id)}
                    disabled={isSettingDefault}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30 text-xs font-cinzel uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer font-semibold"
                  >
                    {isSettingDefault ? "Configuring..." : "Set as Primary"}
                  </button>
                )}
                <button
                  onClick={() => onEdit(address)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-cinzel uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(address._id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-cinzel uppercase tracking-wider flex items-center gap-1.5 transition-all ml-auto cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
