import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = "Search by model, reference number, or complication...",
}) => {
  return (
    <div className="relative w-full max-w-xl mx-auto my-6 px-4">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-amber-600 dark:text-amber-400/80 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-white dark:bg-[#0D121D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-amber-500/20 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 dark:focus:ring-amber-400/40 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all font-sans"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;