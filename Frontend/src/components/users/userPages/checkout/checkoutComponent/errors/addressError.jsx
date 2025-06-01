import React from 'react'
import { Button } from '@/components/ui/button'
const AddressError = () => {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Error loading address
          </h3>
          <p className="text-gray-500 mb-6">
            Failed to load address information
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
  )
}

export default AddressError