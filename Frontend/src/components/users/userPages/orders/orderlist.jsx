import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getorderslist, ordersearch } from "@/api/users/shop/ordermgt";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import NotAvailable from "@/components/common/notAvailable";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import Pagination from "@/components/common/pagination";
import SearchBar from "@/components/common/searchBar";
import Breadcrumbs from "@/components/common/breadCrums";

export function OrderListPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= ordersData?.pagination?.totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <NotAvailable message={"No orders Found"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* user-controls */}

      <IconsArea />

      {/* search bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 ">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Search for Orders..."
        />
      </header>
      {/* Navigation Links */}
      <Navbar />

      {/* breadCrumps */}

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "My Profile", link: `/profile/${userId}` },
          { label: " My Orders" },
        ]}
      />

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
          </div>
        )}
        {/* pagination */}

        {ordersData?.pagination?.totalPages > 1 && (
          <Pagination
            currentPage={ordersData?.pagination?.currentPage}
            totalPages={ordersData?.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default OrderListPage;
