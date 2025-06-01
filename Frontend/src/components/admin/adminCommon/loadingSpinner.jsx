import React from "react";

function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingSpinner;
