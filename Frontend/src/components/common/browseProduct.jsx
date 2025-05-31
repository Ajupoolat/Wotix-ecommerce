import React from 'react'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'

const BrowseProduct = ({message}) => {
    const navigate = useNavigate()
  return (
    <div>
        <div className="text-center py-12">
            
            <h3 className="text-xl font-medium text-gray-600">
                {message}
            </h3>
            <Button className="mt-4" onClick={() => navigate("/shop")}>
              Browse Products
            </Button>
          </div>
    </div>
  )
}

export default BrowseProduct