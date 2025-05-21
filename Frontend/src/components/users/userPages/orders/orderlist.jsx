import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import logo from "@/assets/Wotix removed-BG.png";
import { getorderslist, ordersearch } from "@/api/users/shop/ordermgt";
import { useWishlistCount } from "@/context/wishlistCount";
import { useCart } from "@/context/cartcon";

export function OrderListPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const { countwislist } = useWishlistCount();
  const { totalItems } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [page, setPage] = useState(1); // Current page state
  const [limit] = useState(10); // Items per page

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", userId, debouncedSearchQuery, page],
    queryFn: async () => {
      const response =
        debouncedSearchQuery.trim() === ""
          ? await getorderslist(userId, page, limit)
          : await ordersearch(debouncedSearchQuery);

      return {
        orders: Array.isArray(response)
          ? response
          : response?.orders || response?.data || [],
        pagination: response?.pagination || {},
      };
    },
    enabled: !!userId,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearchQuery(searchQuery);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= ordersData?.pagination?.totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
          <Skeleton className="h-[150px] w-[150px]" />
          <Skeleton className="h-10 w-full max-w-lg mx-4 sm:mx-8" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8 mx-auto" />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="py-3 px-4 border-b">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="py-3 px-4 border-b">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="py-3 px-4 border-b">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="py-3 px-4 border-b">
                    <Skeleton className="h-4 w-24" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4 border-b">
                      <Skeleton className="h-4 w-full" />
                    </td>
                    <td className="py-4 px-4 border-b">
                      <Skeleton className="h-4 w-full" />
                    </td>
                    <td className="py-4 px-4 border-b">
                      <Skeleton className="h-4 w-full" />
                    </td>
                    <td className="py-4 px-4 border-b">
                      <Skeleton className="h-4 w-full" />
                    </td>
                    <td className="py-4 px-4 border-b">
                      <Skeleton className="h-10 w-24" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Error loading orders
          </h3>
          <p className="text-gray-500 mb-6">
            {error.message || "Failed to load order information"}
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
        <div className="flex w-full max-w-lg justify-center mx-4 sm:mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder="Search the orders..."
              className="w-full rounded-full border border-gray-300 bg-gray-100 px-4 py-2 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </form>
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
                className="w-5 h-5 text-gray-700 hover:text-gray-900  cursor-pointer"
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Your Orders</h1>

        {ordersData?.orders?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600 mb-4">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet
            </p>
            <Button
              className="bg-orange-400 hover:bg-orange-500 text-white"
              onClick={() => navigate("/shop")}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersData?.orders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`${
                          order.status === "placed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {order.products.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center">
                            {item.images?.[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-8 h-8 rounded-full object-cover mr-2"
                              />
                            )}
                            <span className="text-sm">
                              {item.name} (×{item.quantity})
                            </span>
                          </div>
                        ))}
                        {order.products.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        ₹{order.finalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/order-details/${order._id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ordersData?.pagination?.totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Prev</span>
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(ordersData?.pagination?.totalPages)].map(
                    (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={page === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={`${
                            page === pageNumber
                              ? "bg-black text-white hover:bg-gray-600"
                              : "text-gray-600 hover:bg-gray-100"
                          } w-10 h-10 rounded-full transition-colors`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === ordersData?.pagination?.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <span>Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* alert */}
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
                // window.location.href('/login')
                // navigate('/login')
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Footer */}
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

export default OrderListPage;
