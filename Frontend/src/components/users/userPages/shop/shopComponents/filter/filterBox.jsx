import React from "react";
import { SlidersHorizontal, RotateCcw, Check, Sparkles } from "lucide-react";

const FilterBox = ({
  filterValues,
  handleFilterChange,
  applyFilters,
  clearFilters,
  categories,
  strapMaterials,
}) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <SlidersHorizontal className="w-4 h-4" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em]">
            Vault Filter
          </h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          title="Reset All Filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Complication / Category */}
      <div className="space-y-2">
        <label className="block text-[11px] font-cinzel font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Collection / Category
        </label>
        <select
          onChange={handleFilterChange}
          value={filterValues.category}
          name="category"
          className="w-full bg-slate-50 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all cursor-pointer"
        >
          <option value="">All Masterpieces</option>
          {categories?.map((category) => (
            <option key={category._id} value={category.categoryName}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range (₹) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-cinzel font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            className="w-full bg-slate-50 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            onChange={handleFilterChange}
            value={filterValues.minPrice}
            name="minPrice"
          />
          <input
            type="number"
            placeholder="Max ₹"
            className="w-full bg-slate-50 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            onChange={handleFilterChange}
            value={filterValues.maxPrice}
            name="maxPrice"
          />
        </div>
      </div>

      {/* Strap Material */}
      <div className="space-y-2">
        <label className="block text-[11px] font-cinzel font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Strap & Bracelet Material
        </label>
        <select
          onChange={handleFilterChange}
          value={filterValues.strapMaterial}
          name="strapMaterial"
          className="w-full bg-slate-50 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all cursor-pointer"
        >
          <option value="">All Materials</option>
          {strapMaterials?.map((material, index) => (
            <option key={index} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>

      {/* Chronometry & Sort */}
      <div className="space-y-2">
        <label className="block text-[11px] font-cinzel font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Sort Chronometry
        </label>
        <select
          onChange={handleFilterChange}
          value={filterValues.sortBy}
          name="sortBy"
          className="w-full bg-slate-50 dark:bg-[#111622] text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all cursor-pointer"
        >
          <option value="">Curated Vault Default</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="aToZ">Alphabetical: A to Z</option>
          <option value="zToA">Alphabetical: Z to A</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <button
          onClick={applyFilters}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Curation</span>
        </button>

        <button
          onClick={clearFilters}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 font-cinzel text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Clear Selection
        </button>
      </div>
    </aside>
  );
};

export default FilterBox;