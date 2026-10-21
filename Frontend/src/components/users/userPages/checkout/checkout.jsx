import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import logo from "@/assets/Wotix removed-BG.png";
import { useCart } from "@/context/cartcon";
import { useMutation, useQuery } from "@tanstack/react-query";
import AddressFormModal from "./checkoutComponent/forms/addressForm";
import DeliveryAddress from "./checkoutComponent/deliveryAddress/deliveryaddress";
import OrderSummary from "./checkoutComponent/summary/orderSummary";
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
import Breadcrumbs from "@/components/common/breadCrums";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";

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
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
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
        toast.success("Privilege voucher successfully applied!");
        setCountapply((prev) => prev + 1);
      },
      onError: (error) => {
        setCouponError(error.message || "Failed to apply voucher");
        toast.error(error.message || "Failed to apply voucher");
      },
    });

  // Place order mutation
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: (orderData) => placeOrder(userId, orderData),
    onSuccess: (data) => {
      setorderid(data.order._id);
      if (paymentMethod === "cod" || paymentMethod === "wallet") {
        toast.success("Order confirmed and registered to the vault!");
        clearCart(); // Safe to clear cart here upon confirmed order
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
    toast.success("Voucher removed");
  };

  const handlePayNow = () => {
    if (!defaultAddress) {
      toast.error("Please configure a vault delivery address");
      return;
    }
    if (!cart?.items?.length) {
      toast.error("Your shopping bag is empty");
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
      setShowWalletInfo(true);
    } else {
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
      paymentMethod: "wallet",
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
      // NOTE: Cart is NOT cleared here on failure (Bug CRIT-02 resolved)
      setProcessingPayment(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_deQSgNwu3LlW4n",
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "WOTIX Haute Horlogerie",
      description: "Acquisition of Certified Timepieces",
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
            toast.success("Payment verified! Timepiece registered to your vault.");
            localStorage.removeItem("appliedCoupons");
            setAppliedCoupons([]);
            setCountapply(0);
            clearCart(); // Safe to clear cart upon verified success
            navigate("/order-confirm", {
              state: {
                order: verifyResponse.data.order,
                cartItems: cart.items,
              },
            });
          } else {
            setPaymentError("Payment verification failed. Please try again.");
            toast.error("Payment verification failed. Your bag remains intact.");
            // NOTE: Cart preserved on failure
          }
        } catch (error) {
          setPaymentError("Error verifying transaction. Please check order status.");
          toast.error("Error verifying payment");
          // NOTE: Cart preserved on failure
        }
        setProcessingPayment(false);
      },
      prefill: {
        name: defaultAddress?.fullName || "",
        email: localStorage.getItem("email") || "",
        contact: defaultAddress?.phone || "",
      },
      theme: {
        color: "#D4AF37", // Champagne luxury gold
      },
      modal: {
        ondismiss: function () {
          setProcessingPayment(false);
          toast("Payment cancelled. Your bag items are saved.");
          // NOTE: Cart preserved on modal dismiss
        },
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
        // NOTE: Cart is NOT cleared here on failure (Bug CRIT-02 resolved)
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
      setPaymentError("Failed to initiate payment. Please try again.");
      toast.error("Failed to initiate payment. Please try again.");
      // NOTE: Cart preserved on failure
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
    return <PleaseLogin message={"Please sign in to access vault checkout"} />;
  }

  if (!cart?.items?.length || !cart?.success) {
    return <BrowseProduct message={"Your shopping bag is empty"} />;
  }

  if (!defaultAddress) {
    return <DefaultAddress userId={userId} />;
  }

  if (addressError) {
    return <AddressError />;
  }

  const paymentOptions = [
    {
      id: "upi",
      label: "Instant UPI & QR",
      desc: "Google Pay, PhonePe, Paytm, or any UPI App",
      icon: Smartphone,
    },
    {
      id: "card",
      label: "Credit / Debit Card",
      desc: "Visa, MasterCard, RuPay, American Express",
      icon: CreditCard,
    },
    {
      id: "netbanking",
      label: "Net Banking",
      desc: "All major Indian & International banks supported",
      icon: Building2,
    },
    {
      id: "wallet",
      label: "WOTIX Vault Wallet",
      desc: "Pay seamlessly with your stored store balance",
      icon: Wallet,
    },
    ...(subtotal <= 1000
      ? [
          {
            id: "cod",
            label: "Cash on Delivery",
            desc: "Pay via cash/UPI upon courier arrival (Orders ≤ ₹1,000)",
            icon: Banknote,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Shop", link: "/shop" },
          { label: "Shopping Bag", link: "/cart" },
          { label: "Vault Checkout" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-6 mb-8 border-b border-slate-200 dark:border-white/5">
          <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-1 font-semibold">
            Secure Acquisition
          </span>
          <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
            Vault Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-8">
            <DeliveryAddress
              defaultAddress={defaultAddress}
              setEditingAddress={setEditingAddress}
              setShowAddressForm={setShowAddressForm}
              navigate={navigate}
              userId={userId}
            />

            {/* Payment Method Selector */}
            <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.18em]">
                    Payment Gateway Selection
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                          : "bg-slate-50 dark:bg-[#0D121D] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4
                          className={`text-xs font-cinzel font-semibold tracking-wider ${
                            isSelected ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {opt.label}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security reassurance banner */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Curated & Certified by WOTIX Haute Horlogerie</span>
                </span>
                <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300/80 font-medium">
                  Zero Transaction Surcharge
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="lg:col-span-5 space-y-6">
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

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isCreatingOrder || processingPayment || !cart?.items?.length}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isCreatingOrder || processingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Vault Transaction...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>
                    Authorize Payment (₹
                    {Number(finalTotal).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Wallet Info Modal if user selects wallet */}
      <WalletInfo
        isOpen={showWalletInfo}
        onClose={() => setShowWalletInfo(false)}
        subtotal={finalTotal}
        onPayNow={handleWalletPaymentConfirm}
      />

      {/* Address Edit/Add Form Modal */}
      <AddressFormModal
        open={showAddressForm}
        setOpen={setShowAddressForm}
        isEditing={!!editingAddress}
        editingAddress={editingAddress}
        onSuccess={refetchAddress}
      />

      <Footer />
    </div>
  );
}

export default CheckoutPage;
