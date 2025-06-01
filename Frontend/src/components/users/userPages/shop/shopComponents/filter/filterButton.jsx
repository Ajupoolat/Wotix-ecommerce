import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
const FilterButton = ({ showFilters, toggleFilters }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold">SHOP</h2>
      <Button
        onClick={toggleFilters}
        className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
      >
        {showFilters ? (
          <>
            <ChevronLeftIcon className="w-4 h-4" />
            Hide Filters
          </>
        ) : (
          <>
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Show Filters
          </>
        )}
      </Button>
    </div>
  );
};

export default FilterButton;
