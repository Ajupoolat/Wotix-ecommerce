import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import { useState } from "react";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/cartcon";
import ErrorCommon from "@/components/common/CommonError";
import BrowseProduct from "@/components/common/browseProduct";
import PleaseLogin from "@/components/common/pleaseLogin";
import AlertBox from "@/components/common/alertBox";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cleardialong, setCleardialong] = useState(false);
  const { cart, loading, removeFromCart, updateQuantity, clearCart, error } =
    useCart();

  // Handle quantity changes
  const handleQuantityChange = (productId, action) => {
    updateQuantity({ productId, action });
  };

  const shippingFee = 50;
  const total = cart?.totalPrice ? cart.totalPrice + shippingFee : 0;

  if (loading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <ErrorCommon />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* user-controls */}
      <IconsArea />
      {/* navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Shopping Cart</h1>

        {!isAuthenticated ? (
          <PleaseLogin message={"Please sign in to view your cart"} />
        ) : !cart?.items?.length || !cart?.success ? (
          <BrowseProduct message={"Your cart is empty"} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
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
                    {cart.items.map((item) => (
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
                                  navigate(
                                    `/shop/product-view/${item.product._id}`
                                  )
                                }
                              >
                                {item.product.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {item.product.brand}
                              </div>
                              {item.offer && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded mt-1 inline-block">
                                  {item.offer.title} {item.offer.discountValue}%
                                  OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity <= item.product.stock ? (
                            <span className="text-green-600 text-sm">
                              Available
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  "decrease"
                                )
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
                                handleQuantityChange(
                                  item.product._id,
                                  "increase"
                                )
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

            <div className="w-full lg:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{cart.totalPrice.toLocaleString("en-IN")}/-
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-medium">₹{shippingFee}/-</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-800 font-medium">TOTAL</span>
                    <span className="font-bold text-lg">
                      ₹{total.toLocaleString("en-IN")}/-
                    </span>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => navigate("/checkout")}
                  >
                    CHECKOUT
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-black text-black hover:bg-gray-100"
                    onClick={() => navigate("/shop")}
                  >
                    CONTINUE SHOPPING
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCleardialong(true)}
                  >
                    CLEAR CART
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* alert for the cart items */}


      <AlertBox
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={"confirm Removal"}
        description={
          "Are you sure you want to remove this items from your cart?"
        }
        confirmLabel="Remove"
        onConfirm={() => {
          removeFromCart(itemToDelete);
          toast.success("item removed from cart");
        }}
      />
      {/* 
    

      {/* alert for clear the cart */}

      <AlertBox
        open={cleardialong}
        onOpenChange={setCleardialong}
        title={"Confim clear cart"}
        description={
          " Are you sure you want to clear all items from your cart?"
        }
        confirmLabel="Clear"
        onConfirm={() => {
          clearCart();
          toast.success("items cleared from cart");
        }}
      />

      {/* footer */}
      <Footer />
    </div>
  );
}

export default CartPage;
