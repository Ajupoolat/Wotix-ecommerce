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
  ArrowLeftStartOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getoffer, deleteoffer } from "@/api/admin/offers/offermgt";
import { toast } from "react-hot-toast";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import { adminLogout } from "@/api/admin/Login/loginAuth";
import CommonError from "../../adminCommon/error";

const OfferList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const offersPerPage = 5;

  const {
    data: offerData = {
      offers: [],
      totalOffers: 0,
      totalPages: 0,
      currentPage: 1,
    },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["offerlist", { searchQuery, statusFilter, currentPage }],
    queryFn: () =>
      getoffer({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: offersPerPage,
      }),
    keepPreviousData: true,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch offers");
    },
  });

  const { mutate: deleteoffers } = useMutation({
    mutationFn: (offerId) => deleteoffer(offerId),
    onSuccess: () => {
      toast.success("The offer is deleted");
      queryClient.invalidateQueries(["offerlist"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete offers");
    },
  });

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

  const handleLogout = () => {
    logoutMutate();
  };

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < offerData.totalPages && setCurrentPage(currentPage + 1);
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };
  const handleCreateOffer = () => navigate("/admin/offers/addoffer");
  const handleEditOffer = (offerId) =>
    navigate(`/admin/offers/editoffer/${offerId}`);
  const handleDelete = (offerId) => deleteoffers(offerId);

  const getStatusBadge = (offer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return "warning";
    if (now > endDate) return "destructive";
    return "success";
  };

  const getStatusText = (offer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "expired";
    return "active";
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(offerData.totalPages, startPage + maxButtons - 1);
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
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/offers" />
        <LoadingSpinner/>
      </div>
    );
  }

  if (isError) {
    return (
     <CommonError Route={'/admin/offers'} m1={'error to load the offer data'} m2={'error Loading offer data'}/>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeRoute="/admin/offers"/>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search offers..."
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
            <h2 className="text-2xl font-bold">Offer Management</h2>
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
                onClick={handleCreateOffer}
                className="bg-black text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Offer
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerData.offers.length > 0 ? (
                  offerData.offers.map((offer) => (
                    <TableRow key={offer.offerNumber}>
                      <TableCell className="font-medium">
                        {offer.offerNumber}
                      </TableCell>
                      <TableCell>{offer.title}</TableCell>
                      <TableCell className="capitalize">
                        {offer.offerType}
                      </TableCell>
                      <TableCell>
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}%`
                          : `₹${offer.discountValue}`}
                      </TableCell>
                      <TableCell>
                        {new Date(offer.startDate).toLocaleDateString()} -{" "}
                        {new Date(offer.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(offer)}>
                          {getStatusText(offer)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleEditOffer(offer._id)}
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
                                  Delete Offer?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the offer "
                                  {offer.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(offer._id)}
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
                    <TableCell colSpan={8} className="text-center">
                      No offers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {offerData.totalOffers > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * offersPerPage + 1}-
                {Math.min(currentPage * offersPerPage, offerData.totalOffers)}{" "}
                of {offerData.totalOffers}
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
                  disabled={currentPage === offerData.totalPages}
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

export default OfferList;
