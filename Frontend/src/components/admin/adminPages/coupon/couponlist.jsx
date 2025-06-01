import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "@/api/admin/couponmgt/couponmgt";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import CouponForm from "../../reuse/coupon/couponform";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import CommonError from "../../adminCommon/error";

const CouponList = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const couponsPerPage = 5;

  const {
    data: couponData = {
      coupons: [],
      totalCoupons: 0,
      totalPages: 0,
      currentPage: 1,
    },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["coupons", { searchQuery, statusFilter, currentPage }],
    queryFn: () =>
      getAllCoupons({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: couponsPerPage,
      }),
    keepPreviousData: true,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch coupons");
    },
  });

  const { mutate: createCouponMutate, isPending: isCreating } = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries(["coupons"]);
      setIsDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create coupon");
    },
  });

  const { mutate: updateCouponMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data) => updateCoupon(editingCoupon._id, data),
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries(["coupons"]);
      setIsDialogOpen(false);
      setEditingCoupon(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update coupon");
    },
  });

  const { mutate: deleteCouponMutate } = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries(["coupons"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete coupon");
    },
  });

  const { coupons, totalCoupons, totalPages } = couponData;

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };
  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDeleteCoupon = (couponId) => {
    deleteCouponMutate(couponId);
  };

  const handleCouponSubmit = (data) => {
    if (editingCoupon) {
      updateCouponMutate(data);
    } else {
      createCouponMutate(data);
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) return "destructive";
    if (now < startDate) return "warning";
    if (now > endDate) return "destructive";
    return "success";
  };

  const getStatusText = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) return "unactive";
    if (now < startDate) return "upcoming";
    if (now > endDate) return "expired";
    return "active";
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
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
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" },
    { value: "expired", label: "Expired" },
    { value: "unactive", label: "Unactive" },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (isLoading || isCreating || isUpdating) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/coupon" />
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <CommonError
        Route={"/admin/coupon"}
        m1={"Failed to fetch coupon data"}
        m2={"Error loading coupon"}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeRoute="/admin/coupon" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-20"
            />
            {searchQuery && (
              <div className="absolute right-4 flex space-x-2">
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
            <h2 className="text-2xl font-bold">Coupon Management</h2>
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
              <Button
                onClick={handleCreateCoupon}
                className="bg-black text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Purchase</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell>
                        {coupon.discountType === "flat"
                          ? `₹${coupon.discountValue.toFixed(2)}`
                          : `${coupon.discountValue}%`}
                      </TableCell>
                      <TableCell>
                        ₹{coupon.minPurchaseAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(coupon)}>
                          {getStatusText(coupon)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Coupon?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the coupon "
                                  {coupon.code}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteCoupon(coupon._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No coupons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalCoupons > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * couponsPerPage + 1}-
                {Math.min(currentPage * couponsPerPage, totalCoupons)} of{" "}
                {totalCoupons}
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
                {getPaginationButtons()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <CouponForm
              mode={editingCoupon ? "edit" : "add"}
              initialData={editingCoupon || {}}
              onSubmit={handleCouponSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CouponList;
