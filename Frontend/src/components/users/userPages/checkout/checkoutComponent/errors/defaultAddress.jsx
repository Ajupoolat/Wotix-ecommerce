import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
const DefaultAddress = ({userId}) => {

    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            No default address found
          </h3>
          <p className="text-gray-500 mb-6">
            Please add a default address to proceed with checkout
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => navigate(`/address/${userId}`)}
          >
            Add Address
          </Button>
        </div>
      </div>
  )
}

export default DefaultAddress