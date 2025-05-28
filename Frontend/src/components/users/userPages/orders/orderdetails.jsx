import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/authuser";
import logo from "@/assets/Wotix removed-BG.png";
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
import { useWebSocket } from "@/context/returncon";
import { useWishlistCount } from "@/context/wishlistCount";
import { retry_payment } from "@/api/users/shop/ordermgt";
import { useCart } from "@/context/cartcon";
import { order_details } from "@/api/users/shop/ordermgt";
import {
  cancelOrderApi,
  returnOrderApi,
  downloadInvoiceApi,
} from "../../../../api/users/shop/ordermgt";
import { verifyPayment } from "@/api/users/shop/checkoutmgt";

// ConfirmationDialog component remains unchanged
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700"
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
  const { socket } = useWebSocket();
  const { isAuthenticated, logout } = useAuth();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const queryClient = useQueryClient();
  const { countwislist } = useWishlistCount();
  const { totalItems } = useCart();

  // State for dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showProductCancelDialog, setShowProductCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showProductReturnDialog, setShowProductReturnDialog] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [subtotal, setSubtotal] = useState(0); // New state for subtotal
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
    return () => document.body.removeChild(script);
  }, []);

  // WebSocket setup
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification) => {
      toast.success(`New notification: ${notification.message}`);
    };
    socket.on("new_notification", handleNotification);
    return () => socket.off("new_notification", handleNotification);
  }, [socket]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("register_user", userId);
    }
  }, [socket, userId]);

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
  const { mutate: cancelOrder, isLoading: isCancelling } = useMutation({
    mutationFn: (cancelData) => cancelOrderApi(cancelData, orderId),
    onSuccess: (data) => {
      toast.success(data.message || "Cancellation processed successfully");
      setShowCancelDialog(false);
      setShowProductCancelDialog(false);
      setSelectedProductsToCancel([]);
      setCancellationReason("");
      queryClient.invalidateQueries(["order", orderId]);
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
      queryClient.invalidateQueries(["order", orderId]);
      toast.success(
        <div>
          <p>Return request submitted!</p>
          <p className="text-sm">
            We'll review your request within 24-48 hours.
          </p>
          {data.estimatedRefund && (
            <p className="text-sm">Estimated refund: ₹{data.estimatedRefund}</p>
          )}
        </div>,
        { duration: 5000 }
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to process return";
      toast.error(errorMessage);
    },
  });

  const { mutate: downloadInvoice, isPending: isDownloading } = useMutation({
    mutationFn: () => downloadInvoiceApi(orderId, userId),
    onSuccess: (data) => {
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
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
      key: "rzp_test_deQSgNwu3LlW4n",
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Wotix Watches",
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
            queryClient.invalidateQueries(["order", orderId]);
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
      theme: { color: "#F97316" },
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
    return <OrderDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Error loading order details
          </h3>
          <p className="text-gray-500 mb-6">
            {error.response?.data?.message ||
              "Failed to load order information"}
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => navigate("/orderslist")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Order not found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested order could not be found
          </p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white"
            onClick={() => navigate("/orderslist")}
          >
            View All Orders
          </Button>
        </div>
      </div>
    );
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
    const noPendingReturnRequest = !order.returnRequests.some(
      (req) =>
        req.products.some(
          (p) => p.productId.toString() === product.productId.toString()
        ) && req.status === "requested"
    );
    return (
      validOrderStatus &&
      productNotCancelled &&
      noExistingReturnStatus &&
      noPendingReturnRequest
    );
  };

  const hasReturnableProducts = order.products.some(isProductEligibleForReturn);

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
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
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
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
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
        <a href="/" className="nav-link">
          HOME
        </a>
        <a
          onClick={() => navigate("/shop")}
          className="nav-link cursor-pointer"
        >
          SHOP
        </a>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Order Details</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => downloadInvoice(orderId)}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Download Invoice
              </Button>
              <Button variant="outline" onClick={() => navigate("/orderslist")}>
                Back to Orders
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Summary Section */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-lg font-medium">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={`status-badge ${order.status.replace("_", "-")}`}
                >
                  {order.status
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Shipping Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.landmark && (
                    <p>{order.shippingAddress.landmark}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-4">
                  Payment Method
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="capitalize">{order.paymentMethod}</p>
                  <div className="flex justify-between">
                    <p
                      className={
                        order.paymentStatus
                          ? "text-green-500 mt-2"
                          : "text-red-600 mt-2"
                      }
                    >
                      Status: {order.paymentStatus ? "Paid" : "Pending"}
                    </p>
                    {order.paymentStatus === false &&
                      (order.status === "placed" ||
                        order.status === "processing" ||
                        order.status === "shipped" ||
                        order.status === "partially_cancelled" ||
                        order.status === "return_requested" ||
                        order.status === "partially_returned") && (
                        <Button
                          onClick={() => handle_retry_payment(orderId)}
                          disabled={isRetryingPayment}
                        >
                          {isRetryingPayment ? "processing..." : "Pay Now"}
                        </Button>
                      )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.products.map((item, index) => (
                    <div key={index} className="flex border-b pb-4 relative">
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex justify-between mt-2">
                          <p>Qty: {item.quantity}</p>
                          <p className="font-medium">
                            ₹
                            {(
                              item.discountedPrice || item.price
                            ).toLocaleString()}
                          </p>
                        </div>
                        {item.cancelled && (
                          <Badge variant="destructive" className="mt-2">
                            Cancelled
                          </Badge>
                        )}
                      </div>

                      {/* Cancel button for individual items */}
                      {!item.cancelled &&
                        [
                          "placed",
                          "processing",
                          "partially_cancelled",
                        ].includes(order.status) && (
                          <button
                            onClick={() => {
                              setSelectedProductsToCancel([item.productId]);
                              setShowProductCancelDialog(true);
                            }}
                            className="absolute top-0 right-0 text-xs text-white hover:text-gray-400 bg-red-500 h-5 w-20 rounded font-bold"
                          >
                            Cancel Item
                          </button>
                        )}

                      {/* Return button for individual items */}
                      {isProductEligibleForReturn(item) && (
                        <button
                          onClick={() => handleReturnRequest(item.productId)}
                          className="absolute top-0 right-0 text-xs text-white hover:text-gray-400 bg-blue-500 h-5 w-20 rounded font-bold"
                        >
                          Return Item
                        </button>
                      )}

                      {/* Return status badge */}
                      {item.returnStatus && item.returnStatus !== "none" && (
                        <Badge
                          variant={
                            item.returnStatus === "return_requested"
                              ? "secondary"
                              : item.returnStatus === "return_approved"
                              ? "default"
                              : "destructive"
                          }
                          className="mt-3 ml-2"
                          style={{ height: "60px" }}
                        >
                          {item.returnStatus
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Total */}

                {/* Order Total */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>
                      ₹
                      {order.products.some(
                        (p) => !p.cancelled && p.returnStatus === "none"
                      )
                        ? 50
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>
                      {order.products.some((p) => p.returnStatus !== "none")
                        ? "Returned Amount"
                        : "Cancelled Amount"}
                    </span>
                    <span>₹{cancelledAmount.toLocaleString()}</span>
                  </div>

                  {/* Only show pending amount if payment status is false */}
                  {!order.paymentStatus && (
                    <div className="flex justify-between mb-2 text-yellow-600">
                      <span>Pending Amount</span>
                      <span>₹{(subtotal + 50).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.finalAmount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  {["placed", "processing", "partially_cancelled"].includes(
                    order?.status
                  ) &&
                    order.products.some((p) => !p.cancelled) && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedProductsToCancel(
                            order.products
                              .filter((p) => !p.cancelled)
                              .map((p) => p.productId)
                          );
                          setShowProductCancelDialog(true);
                        }}
                        disabled={isCancelling}
                      >
                        {isCancelling
                          ? "Processing..."
                          : order.status === "partially_cancelled"
                          ? "Cancel Remaining Items"
                          : "Cancel Order"}
                      </Button>
                    )}
                  {[
                    "delivered",
                    "partially_return_requested",
                    "partially_returned",
                  ].includes(order?.status) &&
                    hasReturnableProducts && (
                      <Button
                        variant="outline"
                        onClick={() => handleReturnRequest()}
                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                        disabled={isReturnPending}
                      >
                        {isReturnPending ? "Processing..." : "Request Return"}
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Footer remain unchanged */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          if (!cancellationReason) {
            toast.error("Please select a cancellation reason");
            return;
          }
          cancelOrder({
            productsToCancel: order.products
              .filter((p) => !p.cancelled)
              .map((p) => p.productId),
            cancellationReason,
            cancelEntireOrder: true,
          });
        }}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText={isCancelling ? "Processing..." : "Yes, Cancel Order"}
        confirmDisabled={isCancelling}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Reason for Cancellation
          </label>
          <Select
            value={cancellationReason}
            onValueChange={setCancellationReason}
            disabled={isCancelling}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="changed-mind">Changed my mind</SelectItem>
              <SelectItem value="found-better-price">
                Found better price
              </SelectItem>
              <SelectItem value="shipping-too-long">
                Shipping takes too long
              </SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>
          {cancellationReason === "other" && (
            <textarea
              className="mt-2 w-full p-2 border rounded"
              placeholder="Please specify..."
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={isCancelling}
            />
          )}
        </div>
      </ConfirmationDialog>

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
        title="Cancel Selected Products"
        message={
          selectedProductsToCancel.length === 1
            ? "Are you sure you want to cancel this item?"
            : `Cancel ${selectedProductsToCancel.length} selected items?`
        }
        confirmText={isCancelling ? "Processing..." : "Confirm Cancellation"}
        confirmDisabled={isCancelling || selectedProductsToCancel.length === 0}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Reason for Cancellation
          </label>
          <Select
            value={cancellationReason}
            onValueChange={setCancellationReason}
            disabled={isCancelling}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="changed-mind">Changed my mind</SelectItem>
              <SelectItem value="found-better-price">
                Found better price
              </SelectItem>
              <SelectItem value="shipping-too-long">
                Shipping takes too long
              </SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>
          {cancellationReason === "other" && (
            <textarea
              className="mt-2 w-full p-2 border rounded"
              placeholder="Please specify..."
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={isCancelling}
            />
          )}
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        isOpen={showReturnDialog}
        onClose={() => {
          setShowReturnDialog(false);
          setReturnReason("");
          setReturnAdditionalInfo("");
        }}
        onConfirm={submitReturnRequest}
        title="Request Return"
        message="Please provide details for your return request."
        confirmText={
          isReturnPending ? "Processing..." : "Submit Return Request"
        }
        confirmDisabled={isReturnPending || !returnReason}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason for Return
            </label>
            <Select
              value={returnReason}
              onValueChange={setReturnReason}
              disabled={isReturnPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Product is defective</SelectItem>
                <SelectItem value="wrong-item">Wrong item received</SelectItem>
                <SelectItem value="not-as-described">
                  Not as described
                </SelectItem>
                <SelectItem value="changed-mind">Changed my mind</SelectItem>
                <SelectItem value="other">Other reason</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Information
            </label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Please provide any additional details..."
              rows={3}
              value={returnAdditionalInfo}
              onChange={(e) => setReturnAdditionalInfo(e.target.value)}
              disabled={isReturnPending}
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>Items to be returned:</p>
            <ul className="list-disc pl-5 mt-1">
              {order.products
                .filter((p) => selectedProductsToReturn.includes(p.productId))
                .map((p) => (
                  <li key={p.productId}>
                    {p.name} (Qty: {p.quantity})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        isOpen={showProductReturnDialog}
        onClose={() => {
          setShowProductReturnDialog(false);
          setReturnReason("");
          setReturnAdditionalInfo("");
        }}
        onConfirm={submitReturnRequest}
        title="Request Product Return"
        message="Please provide details for your return request."
        confirmText={
          isReturnPending ? "Processing..." : "Submit Return Request"
        }
        confirmDisabled={isReturnPending || !returnReason}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason for Return
            </label>
            <Select
              value={returnReason}
              onValueChange={setReturnReason}
              disabled={isReturnPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Product is defective</SelectItem>
                <SelectItem value="wrong-item">Wrong item received</SelectItem>
                <SelectItem value="not-as-described">
                  Not as described
                </SelectItem>
                <SelectItem value="changed-mind">Changed my mind</SelectItem>
                <SelectItem value="other">Other reason</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Information
            </label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Please provide any additional details..."
              rows={3}
              value={returnAdditionalInfo}
              onChange={(e) => setReturnAdditionalInfo(e.target.value)}
              disabled={isReturnPending}
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>Item to be returned:</p>
            {order.products
              .filter((p) => selectedProductsToReturn.includes(p.productId))
              .map((p) => (
                <div key={p.productId} className="mt-1">
                  {p.name} (Qty: {p.quantity})
                </div>
              ))}
          </div>
        </div>
      </ConfirmationDialog>

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
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <Skeleton className="h-[150px] w-[150px]" />
        <Skeleton className="h-10 w-full max-w-lg mx-4 sm:mx-8" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex mb-4">
                  <Skeleton className="h-20 w-20 mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
