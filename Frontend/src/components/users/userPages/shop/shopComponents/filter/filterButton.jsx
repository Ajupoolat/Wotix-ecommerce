import React from "react";
import { SlidersHorizontal, ChevronLeft, Sparkles } from "lucide-react";

const FilterButton = ({ showFilters, toggleFilters, totalProducts }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-white/5 gap-4">
      <div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-cinzel tracking-[0.2em] uppercase mb-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haute Horlogerie Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
          The Watch Vault
        </h1>
        {totalProducts !== undefined && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Displaying {totalProducts} Masterpieces
          </p>
        )}
      </div>

      <button
        onClick={toggleFilters}
        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D121D] hover:bg-slate-100 dark:hover:bg-[#131A29] text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-amber-500/30 text-xs font-cinzel font-semibold uppercase tracking-wider transition-all shadow-sm dark:shadow-md cursor-pointer"
      >
        {showFilters ? (
          <>
            <ChevronLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Hide Filters</span>
          </>
        ) : (
          <>
            <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Show Filters</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FilterButton;
