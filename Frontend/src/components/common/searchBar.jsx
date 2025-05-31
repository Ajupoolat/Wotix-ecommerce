import React from "react";
import { Input } from "@/components/ui/input";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder,
}) => {
  return (
    <div className={`flex items-center w-400 justify-center mx-4 sm:mx-8 `}>
      <Input
        type="text"
        placeholder={placeholder}
        className={`w-full max-w-md rounded-full border-gray-300 bg-gray-100 placeholder-gray-500`}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchQuery && (
        <button
          onClick={onClear}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;