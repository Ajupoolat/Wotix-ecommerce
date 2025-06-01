import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DeliveryAddress = ({ defaultAddress, setEditingAddress, setShowAddressForm, navigate, userId }) => {
  return (
    <div className="w-full lg:w-1/2">
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Delivery Address</h2>
          {defaultAddress?.isDefault && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Default
            </Badge>
          )}
        </div>
        <div className="mb-6 space-y-2">
          <p className="flex items-start">
            <span className="font-medium w-24">Name:</span>
            <span>{defaultAddress.fullName}</span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">Phone:</span>
            <span>{defaultAddress.phone}</span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">Address:</span>
            <span>
              {defaultAddress.streetAddress}
              {defaultAddress.landmark && `, ${defaultAddress.landmark}`}
            </span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">City:</span>
            <span>{defaultAddress.city}</span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">State:</span>
            <span>{defaultAddress.state}</span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">ZIP Code:</span>
            <span>{defaultAddress.postalCode}</span>
          </p>
          <p className="flex items-start">
            <span className="font-medium w-24">Country:</span>
            <span>{defaultAddress.country}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => {
              setEditingAddress(defaultAddress);
              setShowAddressForm(true);
            }}
          >
            Edit Address
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/address/${userId}`)}
          >
            Change Address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddress;