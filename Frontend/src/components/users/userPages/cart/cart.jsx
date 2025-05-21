import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
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
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import logo from "@/assets/Wotix removed-BG.png";
import { useCart } from "@/context/cartcon";
import { useWishlistCount } from "@/context/wishlistCount";
import ErrorCommon from "@/components/common/CommonError";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { countwislist } = useWishlistCount();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cleardialong, setCleardialong] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    cart,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    error,
  } = useCart();

  // Handle quantity changes
  const handleQuantityChange = (productId, action) => {
    updateQuantity({ productId, action });
  };

  const shippingFee = 50;
  const total = cart?.totalPrice ? cart.totalPrice + shippingFee : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return <ErrorCommon />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: "150px", width: "150px" }}
            onClick={() => navigate("/")}
          />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {username || localStorage.getItem("googleuser")}
              </span>
            </div>
          )}
          <div className="flex justify-evenly gap-4">
            {isAuthenticated ? (
              <ArrowRightStartOnRectangleIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setShowLogoutAlert(true)}
              />
            ) : (
              <UserIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => navigate("/signup")}
              />
            )}
            <div className="relative">
              <ShoppingCartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                onClick={() => navigate("/cart")}
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="relative">
              <HeartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                onClick={() => navigate("/wishlist")}
              />
              {countwislist > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {countwislist}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="flex justify-center space-x-8 py-4 border-b bg-gray-50">
        <a
          href="/"
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors"
        >
          HOME
        </a>
        <a
          onClick={() => navigate("/shop")}
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors cursor-pointer"
        >
          SHOP
        </a>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Shopping Cart</h1>

        {!isAuthenticated ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              Please sign in to view your cart
            </h3>
            <Button className="mt-4" onClick={() => navigate("/signup")}>
              Sign In
            </Button>
          </div>
        ) : !cart?.items?.length || !cart?.success ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              {cart?.message || "Your cart is empty"}
            </h3>
            <Button className="mt-4" onClick={() => navigate("/shop")}>
              Browse Products
            </Button>
          </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                removeFromCart(itemToDelete);
                toast.success("Item removed from cart!");
                setShowDeleteDialog(false);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cleardialong} onOpenChange={setCleardialong}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Clear Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all items from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared successfully!");
                setCleardialong(false);
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                localStorage.removeItem("username");
                localStorage.removeItem("userId");
                navigate("/login");
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-gray-900 text-white mt-20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">WOTIX WATCHES</h3>
              <p className="text-gray-400 text-sm">
                Luxury timepieces crafted with precision and elegance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/shop"
                    className="text-sm hover:underline text-gray-300"
                  >
                    Shop Collection
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">STAY CONNECTED</h3>
              <p className="text-gray-400 text-sm mb-4">
                Follow us on social media for the latest updates.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-gray-300">
                  FB
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  IG
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  TW
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} WOTIX WATCHES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CartPage;
