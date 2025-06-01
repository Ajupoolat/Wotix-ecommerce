import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({
  totalPrice,
  shippingFee,
  onCheckout,
  onContinueShopping,
  onClearCart,
}) => {
  const navigate = useNavigate();
  const total = totalPrice + shippingFee;

  return (
    <div className="w-full lg:w-1/3">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}/-</span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-600">Shipping Fee</span>
            <span className="font-medium">₹{shippingFee}/-</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-gray-800 font-medium">TOTAL</span>
            <span className="font-bold text-lg">₹{total.toLocaleString("en-IN")}/-</span>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full bg-black text-white hover:bg-gray-800"
            onClick={onCheckout}
          >
            CHECKOUT
          </Button>
          <Button
            variant="outline"
            className="w-full border-black text-black hover:bg-gray-100"
            onClick={onContinueShopping}
          >
            CONTINUE SHOPPING
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onClearCart}
          >
            CLEAR CART
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;