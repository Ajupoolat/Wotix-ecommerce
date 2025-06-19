import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getorders,
  processReturnRequest,
  getreturnpending,
} from "@/api/admin/ordermanagment/ordermgtad";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import { toast } from "react-hot-toast";
import CommonError from "../../adminCommon/error";
import NotificationsAdmin from "../../adminCommon/notificationAdmin";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const OrderList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortByDate, setSortByDate] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const ordersPerPage = 5;

  // Fetch orders with server-side pagination
  const {
    data: orderData = { orders: [], totalOrders: 0, totalPages: 0, currentPage: 1 },
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorObj,
  } = useQuery({
    queryKey: ["admin-orders", { searchQuery: debouncedSearchQuery, sortByDate, statusFilter, currentPage }],
    queryFn: () =>
      getorders({
        search: debouncedSearchQuery,
        sortByDate,
        status: statusFilter,
        page: currentPage,
        limit: ordersPerPage,
      }),
    keepPreviousData: true,
    staleTime: 1000 * 60, // Cache for 1 minute
    onError: (err) => {
      toast.error(err.message || "Failed to fetch orders");
    },
  });

  // Fetch pending return requests
  const {
    data: pendingReturns = { data: [] },
    isLoading: pendingReturnsLoading,
    isError: pendingReturnsError,
    error: pendingReturnsErrorObj,
  } = useQuery({
    queryKey: ["pending-return-requests"],
    queryFn: getreturnpending,
    staleTime: 1000 * 60,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch pending return requests");
    },
  });

  // Mutation for processing return requests
  const { mutate: processReturn, isPending: isProcessingReturn } = useMutation({
    mutationFn: ({ orderId, requestId, status, adminNotes }) =>
      processReturnRequest(orderId, requestId, { status, adminNotes }, {}),
    onSuccess: () => {
      toast.success("Return request processed successfully");
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["pending-return-requests"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to process return request");
    },
  });


  // Handlers
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < orderData.totalPages && setCurrentPage(currentPage + 1);
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };
  const handleViewOrder = (orderId) => navigate(`/admin/orders/${orderId}`);
  const handleProcessReturn = (orderId, requestId, status, adminNotes = "") => {
    processReturn({ orderId, requestId, status, adminNotes });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortByDate, statusFilter]);

  // Status badge mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "success";
      case "pending":
      case "processing":
        return "warning";
      case "cancelled":
      case "returned":
      case "partially_returned":
        return "destructive";
      case "return_requested":
      case "partially_return_requested":
        return "outline";
      default:
        return "default";
    }
  };

  // Status options for filtering
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All Statuses" },
      { value: "placed", label: "Placed" },
      { value: "processing", label: "Processing" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
      { value: "returned", label: "Returned" },
      { value: "return_requested", label: "Return Requested" },
      { value: "partially_returned", label: "Partially Returned" },
      { value: "partially_return_requested", label: "Partially Return Requested" },
    ],
    []
  );

  // Dynamic pagination buttons
  const getPaginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(orderData.totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      );
    }
    return buttons;
  }, [currentPage, orderData.totalPages]);

  // Loading state
  if (ordersLoading || pendingReturnsLoading) {
    return (
     <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/orders" />
        <LoadingSpinner/>
      </div>
    );
  }

  // Error state
  if (ordersError || pendingReturnsError) {
    return (
     <CommonError Route={'/admin/orders'} m1={'error to load orders data'} m2={'Error loading orders data'}/>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
 <AdminSidebar activeRoute="/admin/orders"/>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search orders by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-10"
            />
            {searchQuery && (
              <div className="absolute right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="p-1"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <NotificationsAdmin/>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-gray-800">Admin</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Order List</h2>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortByDate} onValueChange={setSortByDate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData.orders.length > 0 ? (
                  orderData.orders.map((order) => {
                    const pendingRequest = pendingReturns.data.find(
                      (o) =>
                        o._id === order._id &&
                        o.returnRequests.some(
                          (req) => req.status === "requested"
                        )
                    );
                    const requestId = pendingRequest
                      ? pendingRequest.returnRequests.find(
                          (req) => req.status === "requested"
                        ).requestId
                      : null;

                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>
                              {order.userId?.firstName +
                                " " +
                                order.userId?.lastName || "Unknown Customer"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.userId?.email || "No email"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{order.products?.length || 0}</TableCell>
                        <TableCell>
                          ₹{order.finalAmount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>
                          {(order.status === "return_requested" ||
                            order.status === "partially_return_requested") &&
                          requestId ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadge(order.status)}>
                                {order.status.replace(/_/g, " ")}
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    disabled={isProcessingReturn}
                                  >
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Approve Return Request
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve the return
                                      request for order #{order.orderNumber}? This
                                      will update the stock and refund ₹
                                      {pendingRequest?.estimatedRefund?.toLocaleString() ||
                                        "0"}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleProcessReturn(
                                          order._id,
                                          requestId,
                                          "approved",
                                          "Return approved by admin"
                                        )
                                      }
                                      disabled={isProcessingReturn}
                                    >
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    disabled={isProcessingReturn}
                                  >
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Reject Return Request
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject the return
                                      request for order #{order.orderNumber}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleProcessReturn(
                                          order._id,
                                          requestId,
                                          "rejected",
                                          "Return rejected by admin"
                                        )
                                      }
                                      disabled={isProcessingReturn}
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <Badge variant={getStatusBadge(order.status)}>
                              {order.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {order.paymentMethod?.replace("_", " ") ||
                              "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {orderData.totalOrders > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ordersPerPage + 1}-
                {Math.min(currentPage * ordersPerPage, orderData.totalOrders)} of{" "}
                {orderData.totalOrders}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                {getPaginationButtons}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === orderData.totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderList;