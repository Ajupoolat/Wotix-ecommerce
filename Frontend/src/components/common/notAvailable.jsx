import React from "react";

const NotAvailable = ({message}) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <svg
          className="w-20 h-20 mb-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 13h6m2 6H7a2 2 0 01-2-2V7a2 2 0 012-2h2l2-2h2l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2">{message}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Please check back later or try a different category.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-md bg-black hover:bg-gray-600 text-white text-sm transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default NotAvailable;
