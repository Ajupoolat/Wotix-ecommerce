import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/authuser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
  WalletIcon,
  CreditCardIcon,
  ArrowPathIcon,
  BanknotesIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import { getWallet } from "@/api/users/shop/walletmgt";
import logo from "@/assets/Wotix removed-BG.png";
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
import { useWishlistCount } from "@/context/wishlistCount";
import toast from "react-hot-toast";
import { useCart } from "@/context/cartcon";
import Restricter from "@/components/common/restricter";

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const WalletPage = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { countwislist } = useWishlistCount();
  const { totalItems } = useCart();
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");
  const { id } = useParams();
  const [page, setPage] = useState(1); // Current page state
  const [limit] = useState(10); // Transactions per page

  const {
    data: walletData,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["wallet", id, page],
    queryFn: () => getWallet(id, page, limit),
    select: (data) => {
      const transactions = data.wallet.transactions || [];
      return {
        ...data.wallet,

        totalAdded: transactions
          .filter((t) => t.type === "credit" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0),
        totalSpent: transactions
          .filter((t) => t.type === "debit" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0),
        pendingCredits: transactions
          .filter((t) => t.type === "credit" && t.status === "pending")
          .reduce((sum, t) => sum + t.amount, 0),
        pendingDebits: transactions
          .filter((t) => t.type === "debit" && t.status === "pending")
          .reduce((sum, t) => sum + t.amount, 0),
        refunds: transactions
          .filter((t) => t.type === "credit" && t.referenceType === "order")
          .reduce((sum, t) => sum + t.amount, 0),
        pagination: data.pagination || {},
      };
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load wallet data";
      toast.error(errorMsg);
    },
  });

  let creditedAmount = 0;

  if (walletData?.transactions?.length !== 0) {
    creditedAmount = walletData?.transactions[0].amount;
  } else {
    creditedAmount = 0;
  }

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => viewprofile(id, email),
  });

  const handleLogout = () => {
    logout();
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= walletData?.pagination?.totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading || isWalletLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError || isWalletError) {
    return <Restricter />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="object-contain"
              style={{ height: "150px", width: "150px" }}
            />
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserIcon
                    className="w-4 h-4 text-black"
                    onClick={() => navigate(`/profile/${id}`)}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {username}
                </span>
              </div>
            )}

            <div className="flex justify-evenly gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowLogoutAlert(true)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-gray-700 hover:text-gray-900" />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <UserIcon className="w-5 h-5 text-gray-700 hover:text-gray-900" />
                </button>
              )}
              <div className="relative">
                <ShoppingCartIcon
                  className="w-5 h-5 mt-1 text-gray-700 hover:text-gray-900 cursor-pointer"
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
                  className="w-5 h-5 mt-1 text-gray-700 hover:text-gray-900 cursor-pointer"
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
        </div>
      </header>

      {/* Navigation */}
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <button
            onClick={() => navigate("/")}
            className="hover:text-black cursor-pointer"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={() => navigate(`/profile/${id}`)}
            className="hover:text-black cursor-pointer"
          >
            My Profile
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Wallet</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-black px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Wallet</h1>
                <p className="text-gray-200 mt-1">
                  Manage your wallet balance and transactions
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-300">Welcome back,</span>
                <span className="font-medium">
                  {profileData?.firstName || username}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid grid-cols-2 rounded-none border-b bg-gray-50 h-15">
              <TabsTrigger
                value="balance"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <WalletIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Balance</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
            </TabsList>

            {/* Balance Tab */}
            <TabsContent value="balance" className="mt-0">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Wallet Balance
                    </h2>
                    <p className="text-gray-500">
                      Available funds in your wallet
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsRefreshing(true);
                      refetchWallet().finally(() => {
                        setTimeout(() => setIsRefreshing(false), 1000);
                      });
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                  >
                    <ArrowPathIcon
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-100">
                        Available Balance
                      </p>
                      <h3 className="text-3xl font-bold mt-2">
                        ₹{walletData?.balance?.toFixed(2) || "0.00"}
                      </h3>
                      <p className="text-xs mt-1 text-blue-200">
                        Last updated: {formatDate(walletData?.updatedAt)}
                      </p>
                    </div>
                    <WalletIcon className="w-12 h-12 opacity-80" />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <BanknotesIcon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-medium">Total Added</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      ₹{(walletData?.totalAdded || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <ClockIcon className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-medium">Credits</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{creditedAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-medium">Debits</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      ₹{(walletData?.pendingDebits || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-0">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Transaction History
                    </h2>
                    <p className="text-gray-500">
                      All your wallet transactions (
                      {walletData?.pagination?.totalTransactions || 0} total)
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {walletData?.transactions?.length > 0 ? (
                        walletData.transactions.map((transaction) => {
                          let statusDescription = "";
                          let statusClass = "";

                          if (transaction.referenceType === "cancellation") {
                            statusDescription = "Cancellation Refund";
                            statusClass = "bg-purple-100 text-purple-800";
                          } else if (transaction.referenceType === "return") {
                            statusDescription = "Return Refund";
                            statusClass = "bg-purple-100 text-purple-800";
                          } else if (transaction.referenceType === "order") {
                            statusDescription =
                              transaction.type === "debit"
                                ? "Order Payment"
                                : "Order Refund";
                            statusClass =
                              transaction.type === "debit"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800";
                          } else if (transaction.referenceType === "topup") {
                            statusDescription = "Wallet Top-up";
                            statusClass = "bg-indigo-100 text-indigo-800";
                          } else if (
                            transaction.referenceType === "withdrawal"
                          ) {
                            statusDescription = "Withdrawal";
                            statusClass = "bg-orange-100 text-orange-800";
                          } else {
                            statusDescription =
                              transaction.status?.toUpperCase() ||
                              "Transaction";
                            statusClass =
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800";
                          }

                          return (
                            <tr
                              key={transaction._id || transaction.date}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                                >
                                  {statusDescription}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <span
                                  className={`${
                                    transaction.type === "credit"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "credit" ? "+" : "-"}₹
                                  {transaction.amount.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center">
                            <div className="text-center py-8">
                              <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No transactions
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Your transaction history will appear here
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {walletData?.pagination?.totalPages > 1 && (
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
                      {[...Array(walletData?.pagination?.totalPages)].map(
                        (_, index) => {
                          const pageNumber = index + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                page === pageNumber ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className={`${
                                page === pageNumber
                                  ? "bg-orange-400 text-white hover:bg-orange-500"
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
                      disabled={page === walletData?.pagination?.totalPages}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to log in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-black hover:bg-gray-800 focus-visible:ring-gray-500"
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
};

export default WalletPage;
