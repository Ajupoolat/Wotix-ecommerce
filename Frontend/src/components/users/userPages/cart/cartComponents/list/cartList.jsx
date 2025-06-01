import React from "react";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const CartList = ({
  items = [],
  onQuantityChange,
  setItemToDelete,
  setShowDeleteDialog,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-2/3">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase"
              >
                Stock Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/shop/product-view/${item.product._id}`)
                        }
                      >
                        {item.product.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.product.brand}
                      </div>
                      {item.offer && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded mt-1 inline-block">
                          {item.offer.title} {item.offer.discountValue}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.quantity <= item.product.stock ? (
                    <span className="text-green-600 text-sm">Available</span>
                  ) : (
                    <span className="text-red-600 text-sm">Out of stock</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onQuantityChange(item.product._id, "decrease")
                      }
                      disabled={item.quantity <= 1}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-gray-700 w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onQuantityChange(item.product._id, "increase")
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      {item.discountedPrice < item.originalPrice ? (
                        <>
                          <span className="text-sm font-medium text-green-600">
                            ₹
                            {(
                              item.discountedPrice * item.quantity
                            ).toLocaleString("en-IN")}
                            /-
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            ₹
                            {(
                              item.originalPrice * item.quantity
                            ).toLocaleString("en-IN")}
                            /-
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          ₹
                          {(
                            item.discountedPrice * item.quantity
                          ).toLocaleString("en-IN")}
                          /-
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setItemToDelete(item.product._id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CartList;
