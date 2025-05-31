import React from "react";
import { Button } from "../ui/button";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8 space-x-2">
      <Button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Previous
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${
            currentPage === page
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {page}
        </Button>
      ))}

      <Button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Next
      </Button>
    </div>
  );
};


export default Pagination;