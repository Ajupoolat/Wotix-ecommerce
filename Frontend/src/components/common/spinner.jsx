import React from 'react'

function LoaderSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default LoaderSpinner