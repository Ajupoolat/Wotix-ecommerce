import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeftStartOnRectangleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import {
  getordersdetails,
  updateOrderStatus,
  processReturnRequest,
} from "@/api/admin/ordermanagment/ordermgtad";
import { adminLogout } from "@/api/admin/Login/loginAuth";
import StatusUpdateDialog from "./dropdown/dropdown";
import NotificationDropdown from "./returnrequest/returnrequest";
import CommonError from "../../adminCommon/error";

const OrderDetailsAdmin = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const queryClient = useQueryClient();

  // Fetch order details
  const {
    data: orderDetails,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => getordersdetails(orderId),
    staleTime: 1000 * 60, // Cache for 1 minute
    onError: (err) => {
      toast.error(err.message || "Failed to fetch order details");
    },
  });

  // Mutation for updating order status
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (newStatus) => updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries(["order-details", orderId]);
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update order status");
    },
  });

  // Mutation for canceling order
  const { mutate: cancelOrder, isPending: isCanceling } = useMutation({
    mutationFn: () =>
      updateOrderStatus(orderId, {
        status: "cancelled",
        cancellationReason: "Cancelled by admin",
        cancelledBy: "admin",
        cancelledAt: new Date(),
      }),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries(["order-details", orderId]);
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel order");
    },
  });

  // Mutation for processing return requests
  const { mutate: processReturn, isPending: isProcessingReturn } = useMutation({
    mutationFn: ({ orderId, requestId, status, adminNotes }) =>
      processReturnRequest(orderId, requestId, { status, adminNotes }),
    onSuccess: () => {
      toast.success("Return request processed successfully");
      queryClient.invalidateQueries(["order-details", orderId]);
      queryClient.invalidateQueries(["pending-return-requests"]);
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to process return request");
    },
  });

  // Mutation for logout
  const { mutate: logoutMutate, isPending: isLoggingOut } = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.removeQueries(["auth"]);
      navigate("/adminlogin");
    },
    onError: (err) => {
      toast.error(err.message || "Logout failed");
    },
  });

  // Status badge mapping
  const getStatusBadge = useMemo(
    () => (status) => {
      switch (status) {
        case "delivered":
        case "completed":
          return "success";
        case "processing":
        case "pending":
          return "warning";
        case "cancelled":
        case "returned":
        case "partially_returned":
          return "destructive";
        case "return_requested":
        case "partially_return_requested":
          return "outline";
        case "shipped":
          return "info";
        case "placed":
        default:
          return "default";
      }
    },
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/orders" />
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError || !orderDetails) {
    return (
      <CommonError
        Route={"/admin/orders"}
        m1={"error load the order details"}
        m2={"error loading order details"}
      />
    );
  }

  // Calculate shipping cost (if not explicitly stored in schema)
  const shippingCost =
    orderDetails.finalAmount -
    orderDetails.subtotal +
    orderDetails.discountAmount;

  return (
    <div className="flex min-h-screen bg-gray-100">
<AdminSidebar activeRoute="/admin/orders"/>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/orders")}
            className="flex items-center"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back to Orders
          </Button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-gray-800">Admin</span>
            </div>
          </div>
        </header>
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Order #{orderDetails.orderNumber}
            </h2>
            <div className="flex space-x-2">
              <Badge
                className="h-10 text-sm capitalize"
                variant={getStatusBadge(orderDetails.status)}
              >
                {orderDetails.status.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="h-10 text-sm capitalize">
                {orderDetails.paymentMethod.replace("_", " ")} •{" "}
                {orderDetails.paymentStatus ? "Paid" : "Pending"}
              </Badge>
              {(orderDetails.status === "return_requested" ||
                orderDetails.status === "partially_return_requested") && (
                <NotificationDropdown
                  orderId={orderId}
                  returnRequests={orderDetails.returnRequests}
                  processReturn={processReturn}
                  isProcessing={isProcessingReturn}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-6">
                <p className="font-medium">Order #{orderDetails.orderNumber}</p>
                <p className="text-gray-600">
                  Placed on{" "}
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Return Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <span>{product.name}</span>
                            {product.size && (
                              <p className="text-sm text-gray-500">
                                Size: {product.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {(
                          product.discountedPrice || product.price
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {(
                          (product.discountedPrice || product.price) *
                          product.quantity
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusBadge(product.returnStatus)}>
                          {product.returnStatus.replace(/_/g, " ") || "None"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{orderDetails.subtotal.toLocaleString()}</span>
                </div>
                {orderDetails.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>
                      Discount (
                      {orderDetails.coupons.map((c) => c.code).join(", ") ||
                        "None"}
                      )
                    </span>
                    <span>
                      -₹{orderDetails.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Final Amount</span>
                  <span>₹{orderDetails.finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </Card>
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer</h3>
                <div className="space-y-2">
                  <p className="font-medium">
                    {orderDetails.userId.firstName}{" "}
                    {orderDetails.userId.lastName}
                  </p>
                  <p className="text-gray-600">{orderDetails.userId.email}</p>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Shipping Information
                </h3>
                <div className="space-y-2">
                  <p>{orderDetails.shippingAddress.fullName}</p>
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.postalCode}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                  <p className="text-gray-600">
                    Phone: {orderDetails.shippingAddress.phone}
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-2">
                  <StatusUpdateDialog
                    orderDetails={orderDetails}
                    updateStatus={updateStatus}
                    isUpdating={isUpdatingStatus}
                  />
                  {orderDetails.status !== "cancelled" &&
                    orderDetails.status !== "returned" &&
                    orderDetails.status !== "partially_returned" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={isCanceling || isUpdatingStatus}
                          >
                            {isCanceling ? "Canceling..." : "Cancel Order"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel order #
                              {orderDetails.orderNumber}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelOrder()}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetailsAdmin;
