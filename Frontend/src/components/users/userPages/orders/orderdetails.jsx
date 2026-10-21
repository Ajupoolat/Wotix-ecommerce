import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoaderSpinner from "@/components/common/spinner";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import ErrorCommon from "@/components/common/CommonError";
import Navbar from "@/components/common/navbar";
import logo from "@/assets/Wotix removed-BG.png";
import watchPlaceholder from "@/assets/watch image.jpg";
import { toast } from "react-hot-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { retry_payment, order_details, cancelOrderApi, returnOrderApi, downloadInvoiceApi } from "@/api/users/shop/ordermgt";
import { verifyPayment } from "@/api/users/shop/checkoutmgt";
import NotAvailable from "@/components/common/notAvailable";
import Breadcrumbs from "@/components/common/breadCrums";
import {
  Package,
  Calendar,
  CreditCard,
  Download,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/30 text-slate-800 dark:text-slate-100 transition-colors">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-cinzel text-slate-900 dark:text-white text-lg">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-xs">{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-cinzel">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-cinzel uppercase tracking-wider"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const userId = localStorage.getItem("userId");
  const queryClient = useQueryClient();

  // State for dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showProductCancelDialog, setShowProductCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showProductReturnDialog, setShowProductReturnDialog] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // State for cancellation
  const [selectedProductsToCancel, setSelectedProductsToCancel] = useState([]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelledAmount, setCancelledAmount] = useState(0);

  // State for returns
  const [returnReason, setReturnReason] = useState("");
  const [selectedProductsToReturn, setSelectedProductsToReturn] = useState([]);
  const [returnAdditionalInfo, setReturnAdditionalInfo] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment gateway");
      setRazorpayLoaded(false);
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => order_details(userId, orderId),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (order?.products) {
      const calculatedSubtotal = order.products.reduce(
        (acc, item) =>
          item.cancelled || item.returnStatus !== "none"
            ? acc
            : acc + (item.discountedPrice || item.price) * item.quantity,
        0
      );
      const calculatedCancelledAmount = order.products.reduce(
        (acc, item) =>
          item.cancelled || item.returnStatus !== "none"
            ? acc + (item.discountedPrice || item.price) * item.quantity
            : acc,
        0
      );
      setSubtotal(calculatedSubtotal);
      setCancelledAmount(calculatedCancelledAmount);
    }
  }, [order]);

  // Cancel order mutation
  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (cancelData) => cancelOrderApi(cancelData, orderId),
    onSuccess: (data) => {
      toast.success(data.message || "Cancellation processed successfully");
      setShowCancelDialog(false);
      setShowProductCancelDialog(false);
      setSelectedProductsToCancel([]);
      setCancellationReason("");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to process cancellation"
      );
    },
  });

  // Retry payment mutation
  const { mutate: handle_retry_payment, isPending: isRetryingPayment } =
    useMutation({
      mutationFn: (orderId) => retry_payment(orderId),
      onSuccess: (data) => {
        handleRazorpayPayment(data);
        toast.success("Payment initiated successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error || "Failed to initiate payment retry"
        );
      },
    });

  // Return order mutation
  const { mutate: returnOrder, isPending: isReturnPending } = useMutation({
    mutationFn: (returnData) => returnOrderApi(returnData, orderId, userId),
    onSuccess: (data) => {
      toast.success(data.message || "Return request submitted successfully");
      setShowReturnDialog(false);
      setShowProductReturnDialog(false);
      setSelectedProductsToReturn([]);
      setReturnReason("");
      setReturnAdditionalInfo("");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to submit return request"
      );
    },
  });

  // Download Invoice mutation
  const { mutate: downloadInvoice, isPending: isDownloadingInvoice } =
    useMutation({
      mutationFn: (orderId) => downloadInvoiceApi(orderId),
      onSuccess: (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `WOTIX_Invoice_${order.orderNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Official horological invoice downloaded!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to download invoice"
        );
      },
    });

  const handleReturnRequest = (productId = null) => {
    if (productId) {
      setSelectedProductsToReturn([productId]);
      setShowProductReturnDialog(true);
    } else {
      const eligibleProducts = order.products
        .filter((p) => !p.cancelled && p.returnStatus === "none")
        .map((p) => p.productId);
      setSelectedProductsToReturn(eligibleProducts);
      setShowReturnDialog(true);
    }
  };

  const submitReturnRequest = () => {
    if (!returnReason) {
      toast.error("Please select a return reason");
      return;
    }
    if (selectedProductsToReturn.length === 0) {
      toast.error("No products selected for return");
      return;
    }
    returnOrder({
      productsToReturn: selectedProductsToReturn,
      returnReason,
      additionalInfo: returnAdditionalInfo,
    });
  };

  const handleRazorpayPayment = (data) => {
    const { order, razorpayOrder } = data;
    if (!razorpayOrder || !razorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway not ready. Please try again.");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_deQSgNwu3LlW4n",
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "WOTIX Haute Horlogerie",
      description: "Payment retry for order #" + order.orderNumber,
      image: logo,
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          const verifyResponse = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id,
          });
          if (verifyResponse.data.success) {
            toast.success("Payment successful! Order updated.");
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
          } else {
            toast.error("Payment verification failed. Please try again.");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error verifying payment"
          );
        }
      },
      prefill: {
        name: order.shippingAddress.fullName || "",
        email: localStorage.getItem("email") || "",
        contact: order.shippingAddress.phone || "",
      },
      theme: { color: "#D4AF37" },
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(
          `Payment failed: ${response.error.description || "Please try again."}`
        );
      });
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <ErrorCommon />;
  }

  if (!order) {
    return <NotAvailable message={"Order not found in vault registry"} />;
  }

  const isProductEligibleForReturn = (product) => {
    const validOrderStatus = [
      "delivered",
      "partially_returned",
      "partially_return_requested",
    ].includes(order.status);
    const productNotCancelled = !product.cancelled;
    const noExistingReturnStatus =
      !product.returnStatus || product.returnStatus === "none";

    const noPendingReturnRequest = !order.returnRequests?.some(
      (req) =>
        req.products?.some(
          (p) => p.productId?.toString() === product.productId?.toString()
        ) && req.status === "requested"
    );
    return (
      validOrderStatus &&
      productNotCancelled &&
      noExistingReturnStatus &&
      noPendingReturnRequest
    );
  };

  const hasReturnableProducts = order.products?.some(isProductEligibleForReturn);

  // 5-Stage Delivery Timeline Calculation
  const timelineStages = [
    { label: "Order Placed", key: "placed" },
    { label: "Atelier Assembly", key: "processing" },
    { label: "Armored Transit", key: "shipped" },
    { label: "Horology Courier", key: "out_for_delivery" },
    { label: "Vault Delivered", key: "delivered" },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case "placed":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "partially_cancelled";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault", link: `/profile/${userId}` },
          { label: "Vault Orders", link: "/orderslist" },
          { label: `Order #${order.orderNumber}` },
        ]}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-cinzel font-semibold tracking-[0.2em] uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Provenance Dossier</span>
            </div>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Registered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadInvoice(orderId)}
              disabled={isDownloadingInvoice}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30 text-xs font-cinzel font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isDownloadingInvoice ? "Generating..." : "Download Invoice"}</span>
            </button>
            <button
              onClick={() => navigate("/orderslist")}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer"
            >
              Back to Orders
            </button>
          </div>
        </div>

        {/* 5-Step Delivery Tracking Timeline */}
        <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 sm:p-8 shadow-sm transition-colors">
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 mb-6">
            Transit & Delivery Progression
          </h3>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>
                This order has been cancelled. If any payment was captured, refunds are credited directly to your store wallet within 24 hours.
              </span>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Bar Line */}
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-white/10 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{
                    width: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                {timelineStages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div
                      key={stage.key}
                      className="flex flex-col items-center text-center space-y-2"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          isCompleted
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30"
                            : "bg-slate-100 dark:bg-[#111622] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10"
                        } ${isCurrent ? "ring-4 ring-amber-400/20 scale-110" : ""}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-cinzel tracking-wider uppercase ${
                          isCurrent
                            ? "text-amber-800 dark:text-amber-300 font-bold"
                            : isCompleted
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Address & Payment Method (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Destination */}
            <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-2 text-xs shadow-sm transition-colors">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
                Delivery Destination
              </h3>
              <div className="text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                <p className="text-slate-900 dark:text-white font-semibold text-sm">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.street || order.shippingAddress.streetAddress}</p>
                {order.shippingAddress.landmark && (
                  <p className="text-slate-500 dark:text-slate-400">Near {order.shippingAddress.landmark}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="font-mono text-slate-500 dark:text-slate-400">{order.shippingAddress.country}</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 pt-1">
                  Contact: {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment Method & Retry */}
            <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-3 text-xs shadow-sm transition-colors">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
                Payment Channel & Status
              </h3>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Method
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-medium uppercase">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Status
                </span>
                <span
                  className={`font-semibold uppercase tracking-wider ${
                    order.paymentStatus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  {order.paymentStatus ? "Verified / Paid" : "Payment Pending"}
                </span>
              </div>

              {/* Payment Retry Action */}
              {!order.paymentStatus &&
                [
                  "placed",
                  "processing",
                  "shipped",
                  "partially_cancelled",
                  "return_requested",
                  "partially_returned",
                ].includes(order.status) && (
                  <div className="pt-2">
                    <button
                      onClick={() => handle_retry_payment(orderId)}
                      disabled={isRetryingPayment}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      {isRetryingPayment ? "Contacting Gateway..." : "Complete Payment Now"}
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column: Order Items & Pricing Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-4 shadow-sm transition-colors">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
                Allocated Timepieces ({order.products?.length || 0})
              </h3>

              <div className="divide-y divide-slate-200 dark:divide-white/5">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[#080B11] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                        <img
                          src={item.image || watchPlaceholder}
                          alt={item.name}
                          className="w-full h-full object-contain filter drop-shadow"
                          onError={(e) => {
                            e.target.src = watchPlaceholder;
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-cinzel text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-cinzel text-amber-800 dark:text-amber-300 font-bold">
                            ₹{(item.discountedPrice || item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {item.cancelled && (
                          <span className="inline-block text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions per item */}
                    <div>
                      {!item.cancelled &&
                        ["placed", "processing", "partially_cancelled"].includes(order.status) && (
                          <button
                            onClick={() => {
                              setSelectedProductsToCancel([item.productId]);
                              setShowProductCancelDialog(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-cinzel uppercase tracking-wider transition-all cursor-pointer font-semibold"
                          >
                            Cancel Item
                          </button>
                        )}

                      {isProductEligibleForReturn(item) && (
                        <button
                          onClick={() => handleReturnRequest(item.productId)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30 text-[11px] font-cinzel uppercase tracking-wider transition-all cursor-pointer font-semibold"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary breakdown */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium">
                    ₹{Number(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Armored Transit</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium">
                    ₹{order.products?.some((p) => !p.cancelled && p.returnStatus === "none") ? 50 : 0}
                  </span>
                </div>
                {cancelledAmount > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Cancelled / Returned Amount</span>
                    <span className="font-mono font-semibold">
                      -₹{Number(cancelledAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex justify-between items-baseline">
                  <span className="font-cinzel text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-semibold">
                    Total Order Valuation
                  </span>
                  <span className="font-cinzel text-2xl font-bold text-amber-800 dark:text-amber-300">
                    ₹{Number(order.finalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Order Level Cancel Action */}
              {["placed", "processing", "partially_cancelled"].includes(order?.status) &&
                order.products?.some((p) => !p.cancelled) && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedProductsToCancel(
                          order.products
                            .filter((p) => !p.cancelled)
                            .map((p) => p.productId)
                        );
                        setShowProductCancelDialog(true);
                      }}
                      disabled={isCancelling}
                      className="w-full py-3 rounded-xl bg-slate-100 hover:bg-rose-500/10 dark:bg-white/[0.03] text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? "Processing..." : "Cancel Remaining Order Items"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Dialog */}
      <ConfirmationDialog
        isOpen={showProductCancelDialog}
        onClose={() => {
          setShowProductCancelDialog(false);
          setSelectedProductsToCancel([]);
          setCancellationReason("");
        }}
        onConfirm={() => {
          if (!cancellationReason) {
            toast.error("Please select a cancellation reason");
            return;
          }
          cancelOrder({
            productsToCancel: selectedProductsToCancel,
            cancellationReason,
            cancelEntireOrder: false,
          });
        }}
        title="Confirm Item Cancellation"
        message="Are you certain you wish to cancel the selected timepieces from this order?"
        confirmText={isCancelling ? "Processing..." : "Confirm Cancellation"}
      >
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-medium">
            Cancellation Reason
          </label>
          <Select
            value={cancellationReason}
            onValueChange={setCancellationReason}
            disabled={isCancelling}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-white/10 text-xs">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-amber-500/20">
              <SelectItem value="changed-mind">Changed my mind</SelectItem>
              <SelectItem value="found-better-price">Found better price</SelectItem>
              <SelectItem value="shipping-too-long">Shipping takes too long</SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>
          {cancellationReason === "other" && (
            <textarea
              className="mt-2 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Please specify your reason..."
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={isCancelling}
            />
          )}
        </div>
      </ConfirmationDialog>

      {/* Return Dialog */}
      <ConfirmationDialog
        isOpen={showProductReturnDialog}
        onClose={() => {
          setShowProductReturnDialog(false);
          setSelectedProductsToReturn([]);
          setReturnReason("");
        }}
        onConfirm={submitReturnRequest}
        title="Request Return Authorization"
        message="Request an atelier inspection and return for this timepiece."
        confirmText={isReturnPending ? "Submitting..." : "Submit Return"}
      >
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 font-medium">
            Reason for Return
          </label>
          <Select
            value={returnReason}
            onValueChange={setReturnReason}
            disabled={isReturnPending}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-white/10 text-xs">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-amber-500/20">
              <SelectItem value="defective">Defective or damaged</SelectItem>
              <SelectItem value="wrong-item">Received incorrect reference</SelectItem>
              <SelectItem value="not-as-described">Did not match horological specifications</SelectItem>
              <SelectItem value="size-fit">Strap / case fit issue</SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ConfirmationDialog>

      <Footer />
    </div>
  );
}

export default OrderDetailsPage;
