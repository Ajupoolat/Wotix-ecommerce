import React from "react";
import { Button } from "@/components/ui/button";

const FilterBox = ({ filterValues, handleFilterChange, applyFilters, categories, strapMaterials }) => {
  return (
    <div className="w-full lg:w-1/4 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">FILTERS</h3>
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Category</h4>
        <select
          onChange={handleFilterChange}
          value={filterValues.category}
          name="category"
          className="w-full border p-2"
        >
          <option value="">All</option>
          {categories?.map((category) => (
            <option key={category._id} value={category.categoryName}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Price Range</h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            className="border p-2 w-20"
            onChange={handleFilterChange}
            value={filterValues.minPrice}
            name="minPrice"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            className="border p-2 w-20"
            onChange={handleFilterChange}
            value={filterValues.maxPrice}
            name="maxPrice"
          />
        </div>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Strap Material</h4>
        <select
          onChange={handleFilterChange}
          value={filterValues.strapMaterial}
          name="strapMaterial"
          className="w-full border p-2"
        >
          <option value="">All</option>
          {strapMaterials.map((material, index) => (
            <option key={index} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Sort By</h4>
        <select
          onChange={handleFilterChange}
          value={filterValues.sortBy}
          name="sortBy"
          className="w-full border p-2"
        >
          <option value="">Default</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="aToZ">A to Z</option>
          <option value="zToA">Z to A</option>
        </select>
      </div>
      <Button
        onClick={applyFilters}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterBox;