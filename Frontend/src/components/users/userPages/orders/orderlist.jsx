import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getorderslist, ordersearch } from "@/api/users/shop/ordermgt";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import NotAvailable from "@/components/common/notAvailable";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import Pagination from "@/components/common/pagination";
import SearchBar from "@/components/common/searchBar";
import Breadcrumbs from "@/components/common/breadCrums";
import watchPlaceholder from "@/assets/watch image.jpg";
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export function OrderListPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 400);

    return () => clearTimeout(timerId);
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
    if (newPage >= 1 && newPage <= (ordersData?.pagination?.totalPages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "delivered") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (s === "shipped") {
      return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    }
    if (s === "cancelled" || s === "returned") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
    return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault", link: `/profile/${userId}` },
          { label: "Vault Orders" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block mb-1">
              Order Provenance
            </span>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Your Timepiece Acquisitions
            </h1>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {ordersData?.pagination?.totalOrders || orders.length} Total Orders Registered
          </span>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Search by order number or product name..."
        />

        {error ? (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-[#0B0F17] border border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm transition-colors">
            <p>Unable to retrieve orders: {error.message}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white dark:bg-[#0B0F17] border border-amber-500/30 dark:border-amber-500/20 p-8 max-w-lg mx-auto space-y-4 shadow-sm transition-colors">
            <Package className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
            <h3 className="font-cinzel text-xl font-bold text-slate-900 dark:text-white">
              No Orders Found
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {searchQuery
                ? `No acquisitions matched "${searchQuery}". Try a different reference.`
                : "Your personal horology vault has no registered acquisitions yet."}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Explore Timepieces
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadgeStyle = getStatusBadge(order.status);
              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/order-details/${order._id}`)}
                  className="group rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 hover:border-amber-500/40 p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-xl cursor-pointer space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-300">
                        #{order.orderNumber}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusBadgeStyle}`}
                      >
                        {order.status?.replace("_", " ")}
                      </span>
                      <span className="font-cinzel text-base font-bold text-slate-900 dark:text-white">
                        ₹{Number(order.finalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Products Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.products?.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#080B11] p-1 border border-slate-200 dark:border-white/10 shrink-0">
                            <img
                              src={item.images?.[0] || item.image || watchPlaceholder}
                              alt={item.name}
                              className="w-full h-full object-contain filter drop-shadow"
                              onError={(e) => {
                                e.target.src = watchPlaceholder;
                              }}
                            />
                          </div>
                          <div className="max-w-[140px]">
                            <h5 className="font-cinzel text-xs text-slate-800 dark:text-slate-200 truncate font-semibold">
                              {item.name}
                            </h5>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                      {order.products?.length > 4 && (
                        <span className="text-xs text-amber-700 dark:text-amber-400/80 font-mono pl-2">
                          +{order.products.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-cinzel text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 font-semibold tracking-wider shrink-0 self-end sm:self-auto">
                      <span>Examine Dossier</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {ordersData?.pagination?.totalPages > 1 && (
          <Pagination
            currentPage={ordersData.pagination.currentPage}
            totalPages={ordersData.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default OrderListPage;
