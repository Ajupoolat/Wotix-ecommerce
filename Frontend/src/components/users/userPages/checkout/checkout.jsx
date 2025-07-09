import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import logo from "@/assets/Wotix removed-BG.png";
import { useCart } from "@/context/cartcon";
import { useMutation, useQuery } from "@tanstack/react-query";
import AddressFormModal from "../../userPages/checkout/checkoutComponent/forms/addressForm";
import DeliveryAddress from "../checkout/checkoutComponent/deliveryAddress/deliveryaddress";
import OrderSummary from "../checkout/checkoutComponent/summary/orderSummary";
import { Footer } from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import { placeOrder, applycoupon, bestCoupon } from "@/api/users/shop/ordermgt";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getdefaultaddress, verifyPayment } from "@/api/users/shop/checkoutmgt";
import IconsArea from "@/components/common/IconsArea";
import BrowseProduct from "@/components/common/browseProduct";
import PleaseLogin from "@/components/common/pleaseLogin";
import DefaultAddress from "./checkoutComponent/errors/defaultAddress";
import AddressError from "./checkoutComponent/errors/addressError";
import PaymentError from "./checkoutComponent/errors/paymentError";
import WalletInfo from "./checkoutComponent/wallet/WalletInfo";

// Schema for coupon validation
const couponSchema = z.object({
  couponCode: z.string().min(3, "Coupon code must be at least 3 characters"),
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const userId = localStorage.getItem("userId");
  const { cart, clearCart, loading: cartLoading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [couponError, setCouponError] = useState(null);
  const [countapply, setCountapply] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [orderid, setorderid] = useState("");
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const email = localStorage.getItem("email");

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
  const subtotal = cart?.totalPrice || 0;
  const shipping = 50;
  const totalDiscount = calculateTotalDiscount(subtotal, appliedCoupons);
  const finalTotal = subtotal - totalDiscount + shipping;

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
    queryFn: () => getdefaultaddress(userId, email),
    enabled: !!userId,
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
        couponForm.reset();
        toast.success("Coupon applied successfully!");
        setCountapply((prev) => prev + 1);
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
      setorderid(data.order._id);
      if (paymentMethod === "cod" || paymentMethod === "wallet") {
        toast.success("Order placed successfully!");
        clearCart();
        localStorage.removeItem("appliedCoupons");
        setAppliedCoupons([]);
        setCountapply(0);
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
      toast.error(error.message || "Failed to place order");
      setProcessingPayment(false);
    },
  });

  const handleRemoveCoupon = (couponId) => {
    const updatedCoupons = appliedCoupons.filter(
      (coupon) => coupon._id !== couponId
    );
    setAppliedCoupons(updatedCoupons);
    setCountapply((prev) => Math.max(0, prev - 1));
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

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderData = {
      products: cart.items.map((item) => {
        const itemSubtotal = item.discountedPrice * item.quantity;
        const discountPerItem = totalItems
          ? (totalDiscount * itemSubtotal) / subtotal / item.quantity
          : 0;
        const finalDiscountedPrice = item.discountedPrice - discountPerItem;
        return {
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.discountedPrice,
          discountedPrice:
            finalDiscountedPrice > 0
              ? finalDiscountedPrice
              : item.discountedPrice,
          originalPrice: item.originalPrice,
          offer: item.offer?._id || null,
        };
      }),
      address: defaultAddress,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      discountAmount: totalDiscount,
      totalPrice: subtotal + shipping,
      finalAmount: finalTotal,
      coupons: appliedCoupons.map((c) => c._id),
    };

   if (paymentMethod === "wallet") {
    setShowWalletInfo(true); // Show WalletInfo modal
  } else if (paymentMethod === "cod") {
    setProcessingPayment(true);
    createOrder(orderData);
  } else {
    // For upi, card, netbanking, create order and trigger Razorpay
    setProcessingPayment(true);
    createOrder(orderData);
  }
  };


  const handleWalletPaymentConfirm = () => {
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderData = {
    products: cart.items.map((item) => {
      const itemSubtotal = item.discountedPrice * item.quantity;
      const discountPerItem = totalItems
        ? (totalDiscount * itemSubtotal) / subtotal / item.quantity
        : 0;
      const finalDiscountedPrice = item.discountedPrice - discountPerItem;
      return {
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.discountedPrice,
        discountedPrice:
          finalDiscountedPrice > 0
            ? finalDiscountedPrice
            : item.discountedPrice,
        originalPrice: item.originalPrice,
        offer: item.offer?._id || null,
      };
    }),
    address: defaultAddress,
    paymentMethod: paymentMethod,
    subtotal: subtotal,
    discountAmount: totalDiscount,
    totalPrice: subtotal + shipping,
    finalAmount: finalTotal,
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
      clearCart();
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
          setProcessingPayment(true);
          const verifyResponse = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id,
          });

          if (verifyResponse.data.success) {
            toast.success("Payment successful! Order placed.");
            localStorage.removeItem("appliedCoupons");
            setAppliedCoupons([]);
            setCountapply(0);
            clearCart();
            navigate("/order-confirm", {
              state: {
                order: verifyResponse.data.order,
                cartItems: cart.items,
              },
            });
          } else {
            setPaymentError("Payment verification failed. Please try again.");
            toast.error("Payment verification failed");
            clearCart();
          }
        } catch (error) {
          setPaymentError("Error verifying payment. Please try again.");
          toast.error("Error verifying payment");
          clearCart();
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
        clearCart();
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
      setPaymentError("Failed to initiate payment. Please try again.");
      toast.error("Failed to initiate payment. Please try again.");
      clearCart();
      setProcessingPayment(false);
    }
  };

  // Loading states
  if (cartLoading || addressLoading) {
    return <LoaderSpinner />;
  }

  // Error states
  if (paymentError) {
    return <PaymentError orderid={orderid} />;
  }

  if (!isAuthenticated) {
    return <PleaseLogin message={"Please sign in to access checkout"} />;
  }

  if (!cart?.items?.length || !cart?.success) {
    return <BrowseProduct message={"Your cart is empty"} />;
  }

  if (!defaultAddress) {
    return <DefaultAddress userId={userId} />;
  }

  if (addressError) {
    return <AddressError />;
  }

  return (
    <div className="min-h-screen bg-white">
      <IconsArea />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* delivery address */}
          <DeliveryAddress
            defaultAddress={defaultAddress}
            setEditingAddress={setEditingAddress}
            setShowAddressForm={setShowAddressForm}
            navigate={navigate}
            userId={userId}
          />
          {/* ordersummary */}
          <div className="w-full lg:w-1/2">
            <OrderSummary
              cart={cart}
              appliedCoupons={appliedCoupons}
              subtotal={subtotal}
              totalDiscount={totalDiscount}
              shipping={shipping}
              finalTotal={finalTotal}
              availableCoupons={availableCoupons}
              isApplyingCoupon={isApplyingCoupon}
              couponForm={couponForm}
              applyCouponMutate={applyCouponMutate}
              countapply={countapply}
              handleRemoveCoupon={handleRemoveCoupon}
              couponError={couponError}
            />

            {/* payment-methods */}
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
                  <RadioGroupItem id="wallet" value="wallet" />
                  <Label htmlFor="card">Wallet</Label>
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
      <WalletInfo
        isOpen={showWalletInfo}
        onClose={() => setShowWalletInfo(false)}
        subtotal={finalTotal}
        onPayNow={handleWalletPaymentConfirm}
      />{" "}
      <Footer />
      <AddressFormModal
        open={showAddressForm}
        setOpen={setShowAddressForm}
        isEditing={!!editingAddress}
        editingAddress={editingAddress}
        onSuccess={refetchAddress}
      />
    </div>
  );
}

export default CheckoutPage;
