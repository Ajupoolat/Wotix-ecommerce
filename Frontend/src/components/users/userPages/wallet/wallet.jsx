import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/authuser";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WalletIcon,
  CreditCardIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import { getWallet } from "@/api/users/shop/walletmgt";
import toast from "react-hot-toast";
import Restricter from "@/components/common/restricter";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import ErrorCommon from "@/components/common/CommonError";
import Pagination from "@/components/common/pagination";
import Breadcrumbs from "@/components/common/breadCrums";

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
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= walletData?.pagination?.totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading || isWalletLoading) {
    return <LoaderSpinner />;
  }

  if (
    (isError && error.message !== `Oops this page is not get !`) ||
    (isWalletError &&
      walletError.message !==
        `This wallet does not exist or you don't have permission to view it.`)
  ) {
    return <ErrorCommon />;
  }
  if (
    (error && error.message === `Oops this page is not get !`) ||
    (walletError &&
      walletError.message ===
        `This wallet does not exist or you don't have permission to view it.`)
  ) {
    return <Restricter />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <IconsArea />
      {/* Navigation */}
      <Navbar />

      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "My Profile", link: `/profile/${id}` },
          { label: "Wallet" },
        ]}
      />

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
                  <Pagination
                    currentPage={walletData?.pagination?.currentPage}
                    totalPages={walletData?.pagination?.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WalletPage;
