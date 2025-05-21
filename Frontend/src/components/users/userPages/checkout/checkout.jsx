import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import logo from "@/assets/Wotix removed-BG.png";
import { useCart } from "@/context/cartcon";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import AddressFormModal from "../../userforms/shopping/addresseditor";
import { Skeleton } from "@/components/ui/skeleton";
import { placeOrder, applycoupon, bestCoupon } from "@/api/users/shop/ordermgt";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useWishlistCount } from "@/context/wishlistCount";

const API_BASE_URL = "http://localhost:5000/userapi/user";

// Schema for coupon validation
const couponSchema = z.object({
  couponCode: z.string().min(3, "Coupon code must be at least 3 characters"),
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const {
    cart,
    clearCart,
    loading: cartLoading,
    totalItems,
    totalPrice,
  } = useCart();
  const { countwislist } = useWishlistCount();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [couponError, setCouponError] = useState(null);
  const [countapply, setCountapply] = useState(0); // Renamed for clarity
  const [paymentError, setPaymentError] = useState(null);
  const email = localStorage.getItem("email");
  const nnn = "681d89c8614d9c397ba7b70d";


  const couponForm = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: "",
    },
  });

  const calculateDiscount = (amount, coupon) => {
    if (coupon.discountType === "flat") {
      return coupon.discountValue;
    } else {
      return (amount * coupon.discountValue) / 100;
    }
  };

  const calculateTotalDiscount = (subtotal, coupons) => {
    return coupons.reduce((total, coupon) => {
      if (subtotal >= coupon.minPurchaseAmount) {
        return total + calculateDiscount(subtotal, coupon);
      }
      return total;
    }, 0);
  };

  // Calculate prices
  const subtotal = cart?.totalPrice || 0; // Sum of original prices
  const shipping = 50;
  const totalDiscount = calculateTotalDiscount(subtotal, appliedCoupons);
  const finalTotal = subtotal - totalDiscount + shipping; // No GST

  const {
    data: availableCoupons,
    isLoading: isCouponsLoading,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ["availableCoupons", subtotal],
    queryFn: () => bestCoupon(subtotal),
    enabled: !!subtotal && subtotal > 0,
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      setRazorpayLoaded(false);
      setPaymentError("Failed to load payment gateway. Please try again.");
      toast.error("Failed to load payment gateway. Please try again.");
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Fetch default address
  const {
    data: defaultAddress,
    isLoading: addressLoading,
    error: addressError,
    refetch: refetchAddress,
  } = useQuery({
    queryKey: ["defaultAddress", userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/defaultaddress/${userId}/${email}`,
          { withCredentials: true }
        );
        return response.data[0];
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred";
        throw new Error(errorMessage);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Apply coupon mutation
  const { mutate: applyCouponMutate, isPending: isApplyingCoupon } =
    useMutation({
      mutationFn: (couponCode) =>
        applycoupon({
          couponcode: couponCode,
          currentSubtotal: subtotal,
        }),
      onSuccess: (data) => {
        const updatedCoupons = [...appliedCoupons, data];
        setAppliedCoupons(updatedCoupons);
        // localStorage.setItem("appliedCoupons", JSON.stringify(updatedCoupons));
        couponForm.reset();
        toast.success("Coupon applied successfully!");
        setCountapply((prev) => prev + 1); // Increment safely
      },
      onError: (error) => {
        setCouponError(error.message || "Failed to apply coupon");
        toast.error(error.message || "Failed to apply coupon");
      },
    });

  // Place order mutation
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: (orderData) => placeOrder(userId, orderData),
    onSuccess: (data) => {
      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        clearCart();
        localStorage.removeItem("appliedCoupons");
        setAppliedCoupons([]); // Clear coupons
        setCountapply(0); // Reset count
        navigate("/order-confirm", {
          state: {
            order: data.order,
            cartItems: cart.items,
          },
        });
      } else {
        handleRazorpayPayment(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order"); // Use error.message
      setProcessingPayment(false);
    },
  });

  const handleRemoveCoupon = (couponId) => {
    const updatedCoupons = appliedCoupons.filter(
      (coupon) => coupon._id !== couponId
    );
    setAppliedCoupons(updatedCoupons);
    // localStorage.setItem("appliedCoupons", JSON.stringify(updatedCoupons));
    setCountapply((prev) => Math.max(0, prev - 1)); // Decrement safely
    toast.success("Coupon removed");
  };

  const handlePayNow = () => {
    if (!defaultAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      return;
    }

    // Calculate discountedPrice for each product
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderData = {

      products: cart.items.map((item) => {
  const itemSubtotal = item.discountedPrice * item.quantity; // Use discountedPrice (after offer)
  const discountPerItem = totalItems
    ? (totalDiscount * itemSubtotal) / subtotal / item.quantity
    : 0; // Coupon discount
  const finalDiscountedPrice = item.discountedPrice - discountPerItem; // Price after coupon
  return {
    productId: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.discountedPrice, // Use price after offer
    discountedPrice: finalDiscountedPrice > 0 ? finalDiscountedPrice : item.discountedPrice,
    originalPrice: item.originalPrice,
    offer: item.offer?._id || null,
    brand: item.product.brand,
    images: item.product.images,
  };
}),
      address: defaultAddress,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      discountAmount: totalDiscount,
      totalPrice: subtotal + shipping, 
      finalAmount: finalTotal, // After discount
      coupons: appliedCoupons.map((c) => c._id),
    };

    setProcessingPayment(true);
    createOrder(orderData);
  };

  const handleRazorpayPayment = (data) => {
    const { order, razorpayOrder } = data;

    if (!razorpayOrder || !razorpayLoaded || !window.Razorpay) {
      setPaymentError("Payment gateway not ready. Please try again.");
      toast.error("Payment gateway not ready. Please try again.");
      clearCart(); // Clear cart on gateway failure
      setProcessingPayment(false);
      return;
    }

    const options = {
      key: "rzp_test_deQSgNwu3LlW4n",
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Wotix Watches",
      description: "Purchase of luxury watches",
      image: logo,
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          const verifyResponse = await axios.post(
            `${API_BASE_URL}/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            },
            { withCredentials: true }
          );

          if (verifyResponse.data.success) {
            toast.success("Payment successful! Order placed.");
            localStorage.removeItem("appliedCoupons");
            setAppliedCoupons([]); // Clear coupons
            setCountapply(0); // Reset count
            clearCart(); // Clear cart on success
            navigate("/order-confirm", {
              state: {
                order: verifyResponse.data.order,
                cartItems: cart.items,
              },
            });
          } else {
            setPaymentError("Payment verification failed. Please try again.");
            toast.error("Payment verification failed");
            clearCart(); // Clear cart on verification failure
          }
        } catch (error) {
          setPaymentError("Error verifying payment. Please try again.");
          toast.error("Error verifying payment");
          clearCart(); // Clear cart on error
        }
        setProcessingPayment(false);
      },
      prefill: {
        name: defaultAddress?.fullName || "",
        email: localStorage.getItem("email") || "",
        contact: defaultAddress?.phone || "",
      },
      theme: {
        color: "#F97316",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setPaymentError(
          `Payment failed: ${response.error.description || "Please try again."}`
        );
        toast.error(
          `Payment failed: ${response.error.description || "Please try again."}`
        );
        clearCart(); // Clear cart on payment failure
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
      setPaymentError("Failed to initiate payment. Please try again.");
      toast.error("Failed to initiate payment. Please try again.");
      clearCart(); // Clear cart on initiation failure
      setProcessingPayment(false);
    }
  };

  // Loading states
  if (cartLoading || addressLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-6xl px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="w-full lg:w-1/2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (paymentError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Payment Failed
          </h3>
          <p className="text-gray-500 mb-6">{paymentError}</p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={handlePayNow}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">
            Please sign in to access checkout
          </h3>
          <Button className="mt-4" onClick={() => navigate("/signup")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length || !cart?.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">
            {cart?.message || "Your cart is empty"}
          </h3>
          <Button className="mt-4" onClick={() => navigate("/shop")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  if (!defaultAddress) {
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
    );
  }

  if (addressError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Error loading address
          </h3>
          <p className="text-gray-500 mb-6">
            {addressError.response?.data?.message ||
              "Failed to load address information"}
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain cursor-pointer"
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
                onClick={() => {
                  logout();
                  localStorage.removeItem("username");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("appliedCoupons"); // Clear coupons on logout
                  navigate("/login");
                }}
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

      {/* Navigation Links */}
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

      {/* Main Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Delivery Address */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Delivery Address</h2>
                {defaultAddress?.isDefault && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500 text-white"
                  >
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

          {/* Right Column - Order Summary and Payment */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart?.items?.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-start border-b pb-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.product.brand}
                      </p>
                      <div className="flex flex-col">
                        {item.discountedPrice < item.originalPrice ? (
                          <>
                            <span className="font-bold text-green-600">
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
                          <span className="font-bold">
                            ₹
                            {(
                              item.discountedPrice * item.quantity
                            ).toLocaleString("en-IN")}
                            /-
                          </span>
                        )}
                        {item.offer && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded mt-1 inline-block">
                            {item.offer.title} {item.offer.discountValue}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="w-24 h-24">
                      <img
                        src={
                          item.product.images?.[0] ||
                          "https://via.placeholder.com/100"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                {availableCoupons?.length > 0 && !appliedCoupons.length && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      Available Coupons:
                    </p>
                    <ul className="space-y-2">
                      {availableCoupons.map((coupon) => (
                        <li
                          key={coupon._id}
                          className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
                          onClick={() => {
                            if (countapply <= 0) {
                              couponForm.setValue("couponCode", coupon.code);
                              applyCouponMutate(coupon.code);
                            } else {
                              toast.error("Only one coupon can be applied");
                            }
                          }}
                        >
                          <div>
                            <span className="font-bold">{coupon.code}</span>
                            {coupon.discountType === "flat"
                              ? ` (₹${coupon.discountValue} off)`
                              : ` (${coupon.discountValue}% off)`}
                            {coupon.minPurchaseAmount > 0 && (
                              <span className="block text-xs">
                                Min. purchase: ₹{coupon.minPurchaseAmount}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Form {...couponForm}>
                  <form
                    onSubmit={couponForm.handleSubmit((data) => {
                      if (countapply <= 0) {
                        applyCouponMutate(data.couponCode);
                      } else {
                        toast.error("Only one coupon can be applied");
                      }
                    })}
                    className="flex"
                  >
                    <FormField
                      control={couponForm.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter coupon code"
                              className="bg-gray-200 border-0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setCouponError(null); // Clear error on input change
                              }}
                              disabled={isApplyingCoupon}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="ml-2 bg-black text-white hover:bg-gray-800"
                      disabled={isApplyingCoupon}
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </form>
                </Form>
                {appliedCoupons.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Applied Coupons:
                    </h4>
                    <ul className="space-y-2">
                      {appliedCoupons.map((coupon) => (
                        <li
                          key={coupon._id}
                          className="flex justify-between items-center bg-gray-200 p-2 rounded"
                        >
                          <div>
                            <span className="font-medium">{coupon.code}</span> -
                            {coupon.discountType === "flat" ? (
                              <span> ₹{coupon.discountValue} off</span>
                            ) : (
                              <span> {coupon.discountValue}% off</span>
                            )}
                            {coupon.minPurchaseAmount > 0 && (
                              <span className="block text-xs">
                                Min. purchase: ₹{coupon.minPurchaseAmount}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCoupon(coupon._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}/-</span>
                </div>
                {appliedCoupons.length > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Discount</span>
                    <span className="text-green-600">
                      -₹{totalDiscount.toLocaleString("en-IN")}/-
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span>Shipping</span>
                  <span>₹{shipping.toLocaleString("en-IN")}/-</span>
                </div>
                <div className="flex justify-between py-2 border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    ₹
                    {finalTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                    /-
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-4">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="upi" value="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="card" value="card" />
                    <Label htmlFor="card">Credit/Debit/ATM Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="netbanking" value="netbanking" />
                    <Label htmlFor="netbanking">Net Banking</Label>
                  </div>
                  {subtotal <= 1000 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="cod" value="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {/* Pay Now Button */}
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
                onClick={handlePayNow}
                disabled={
                  isCreatingOrder || processingPayment || !cart?.items?.length
                }
              >
                {isCreatingOrder || processingPayment ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

      <AddressFormModal
        showForm={showAddressForm}
        setShowForm={setShowAddressForm}
        isEditing={!!editingAddress}
        editingAddress={editingAddress}
        onSuccess={refetchAddress}
      />
    </div>
  );
}

export default CheckoutPage;
