import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-12 mb-6 space-x-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0D121D] hover:bg-[#141C2E] text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-cinzel font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center space-x-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-[#0D121D] hover:bg-[#141C2E] text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0D121D] hover:bg-[#141C2E] text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-cinzel font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 text-amber-400" />
      </button>
    </div>
  );
};

export default Pagination;