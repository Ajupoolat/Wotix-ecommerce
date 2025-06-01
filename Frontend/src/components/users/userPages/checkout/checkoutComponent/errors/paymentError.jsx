import React from 'react'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PaymentError = ({orderid}) => {
    const navigate = useNavigate()
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Payment Failed
          </h3>
          <p className="text-gray-500 mb-6">
            Your order is placed but the payment is not completed. You can pay
            the amount from the order details page
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => {
              const id = orderid;
              navigate(`/order-details/${id}`);
            }}
          >
            order-details
          </Button>
        </div>
      </div>
  )
}

export default PaymentError