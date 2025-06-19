import React, { useEffect, useState } from "react";
import {useQuery} from "@tanstack/react-query";
import {
  getSalesStatistics,
  generateSalesReport,
} from "@/api/admin/dashboard/dashboardmgt";
import {
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import CommonError from "../../adminCommon/error";
import NotificationsAdmin from "../../adminCommon/notificationAdmin";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState("daily");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [debouncedSearchQuery,setDebouncedSearchQuery] = useState(searchQuery)


  useEffect(()=>{
    const handle = setTimeout(()=>{
      setDebouncedSearchQuery(searchQuery)
    },500)

    return ()=>clearTimeout(handle)
  },[searchQuery])

  const { data: salesData, isLoading: salesLoading ,error:salesError} = useQuery({
    queryKey: ["salesStatistics", statusFilter, debouncedSearchQuery, currentPage],
    queryFn: () =>
      getSalesStatistics({
        status: statusFilter,
        search: debouncedSearchQuery,
        page: currentPage,
        limit: ordersPerPage,
      }),
  });

  const {
    data: salesReport,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery({
    queryKey: ["salesReport", dateRange, customStartDate, customEndDate],
    queryFn: () => {
      const params =
        showCustomRange && customStartDate && customEndDate
          ? {
              startDate: format(customStartDate, "yyyy-MM-dd"),
              endDate: format(customEndDate, "yyyy-MM-dd"),
            }
          : { period: dateRange };
      return generateSalesReport(params);
    },
    enabled:
      !showCustomRange ||
      (customStartDate instanceof Date &&
        customEndDate instanceof Date &&
        !isNaN(customStartDate.getTime()) &&
        !isNaN(customEndDate.getTime())),
  });

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setShowCustomRange(false);
    setCustomStartDate(null);
    setCustomEndDate(null);
  };

  const handleCustomRangeToggle = () => {
    setShowCustomRange(true);
    setDateRange("");
    setCustomStartDate(null);
    setCustomEndDate(null);
  };

  // Get top 5 products and categories
  const topProducts =
    salesReport?.report?.productSales
      ?.sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) || [];
  const topCategories =
    salesReport?.report?.categorySales
      ?.sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) || [];

  // Download PDF report
  const downloadPDF = () => {
    try {
      if (!salesReport?.report) {
        toast.error("No sales report data available");
        return;
      }

      const doc = new jsPDF();
      // Apply autoTable plugin
      autoTable(doc, {});

      const report = salesReport.report;
      const period = showCustomRange
        ? `custom_${format(customStartDate, "yyyy-MM-dd")}_to_${format(
            customEndDate,
            "yyyy-MM-dd"
          )}`
        : dateRange;

      // Title
      doc.setFontSize(16);
      doc.text(
        `Sales Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
        14,
        20
      );

      // Summary Table
      doc.setFontSize(12);
      doc.text("Summary", 14, 30);
      autoTable(doc, {
        startY: 35,
        head: [["Metric", "Value"]],
        body: [
          ["Total Orders", report.summary?.totalOrders || 0],
          [
            "Total Sales",
            `$${report.summary?.totalSales?.toFixed(2) || "0.00"}`,
          ],
          ["Net Sales", `$${report.summary?.netSales?.toFixed(2) || "0.00"}`],
        ],
      });

      // Daily Sales Table
      doc.text("Daily Sales", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Date", "Orders", "Revenue", "Items Sold"]],
        body: (report.dailySales || []).map((item) => [
          item.date || "N/A",
          item.orders || 0,
          `$${item.revenue?.toFixed(2) || "0.00"}`,
          item.items || 0,
        ]),
      });

      // Top Products Table
      doc.text("Top 5 Products", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Product", "Quantity", "Revenue"]],
        body: topProducts.map((item) => [
          item.name || "N/A",
          item.quantity || 0,
          `$${item.revenue?.toFixed(2) || "0.00"}`,
        ]),
      });

      // Top Categories Table
      doc.text("Top 5 Categories", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Category", "Quantity", "Revenue"]],
        body: topCategories.map((item) => [
          item.category || "N/A",
          item.quantity || 0,
          `$${item.revenue?.toFixed(2) || "0.00"}`,
        ]),
      });

      // Save PDF
      doc.save(
        `sales-report-${period}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF.");
    }
  };

  // Download Excel report
  const downloadExcel = () => {
    try {
      if (!salesReport?.report) {
        toast.error("No sales report data available");
        return;
      }

      const report = salesReport.report;
      const period = showCustomRange
        ? `custom_${format(customStartDate, "yyyy-MM-dd")}_to_${format(
            customEndDate,
            "yyyy-MM-dd"
          )}`
        : dateRange;

      // Summary Sheet
      const summaryData = [
        ["Metric", "Value"],
        ["Total Orders", report.summary?.totalOrders || 0],
        ["Total Sales", report.summary?.totalSales?.toFixed(2) || "0.00"],
        ["Net Sales", report.summary?.netSales?.toFixed(2) || "0.00"],
      ];

      // Daily Sales Sheet
      const dailySalesData = [
        ["Date", "Orders", "Revenue", "Items Sold"],
        ...(report.dailySales || []).map((item) => [
          item.date || "N/A",
          item.orders || 0,
          item.revenue?.toFixed(2) || "0.00",
          item.items || 0,
        ]),
      ];

      // Top Products Sheet
      const topProductsData = [
        ["Product", "Quantity", "Revenue"],
        ...topProducts.map((item) => [
          item.name || "N/A",
          item.quantity || 0,
          item.revenue?.toFixed(2) || "0.00",
        ]),
      ];

      // Top Categories Sheet
      const topCategoriesData = [
        ["Category", "Quantity", "Revenue"],
        ...topCategories.map((item) => [
          item.category || "N/A",
          item.quantity || 0,
          item.revenue?.toFixed(2) || "0.00",
        ]),
      ];

      // Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(summaryData),
        "Summary"
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(dailySalesData),
        "Daily Sales"
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(topProductsData),
        "Top Products"
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(topCategoriesData),
        "Top Categories"
      );

      // Generate binary data and download
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${period}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download Excel");
    }
  };

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-4">
      <p className="text-sm text-gray-600">
        Showing {(currentPage - 1) * ordersPerPage + 1}-
        {Math.min(
          currentPage * ordersPerPage,
          salesData?.statistics?.pagination?.totalOrders || 0
        )}{" "}
        of {salesData?.statistics?.pagination?.totalOrders || 0}
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={
            currentPage >=
            Math.ceil(
              (salesData?.statistics?.pagination?.totalOrders || 0) /
                ordersPerPage
            )
          }
        >
          Next
        </Button>
      </div>
    </div>
  );

  if (reportLoading || salesLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin-dashboard" />
        <LoadingSpinner />
      </div>
    );
  }

  if(salesError||reportError){
    return(
      <CommonError Route={'/admin-dashboard'} m1={'error to load dashboard data'} m2={'Error load Dashboard'}/>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activeRoute="/admin-dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
            <NotificationsAdmin />
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

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>

          {/* Sales Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Today's Orders
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {salesLoading
                  ? "Loading..."
                  : salesData?.statistics.today.orders || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Today's Sales
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {salesLoading
                  ? "Loading..."
                  : `$${(salesData?.statistics.today.sales || 0).toFixed(2)}`}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Weekly Sales
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {salesLoading
                  ? "Loading..."
                  : `$${(salesData?.statistics.weekly.sales || 0).toFixed(2)}`}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Monthly Sales
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {salesLoading
                  ? "Loading..."
                  : `$${(salesData?.statistics.monthly.sales || 0).toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Sales Report Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Sales Report
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant={
                    dateRange === "daily" && !showCustomRange
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("daily")}
                >
                  Daily
                </Button>
                <Button
                  variant={
                    dateRange === "weekly" && !showCustomRange
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("weekly")}
                >
                  Weekly
                </Button>
                <Button
                  variant={
                    dateRange === "monthly" && !showCustomRange
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={
                    dateRange === "yearly" && !showCustomRange
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("yearly")}
                >
                  Yearly
                </Button>
                <Button
                  variant={showCustomRange ? "default" : "outline"}
                  size="sm"
                  onClick={handleCustomRangeToggle}
                >
                  Custom
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reportLoading || reportError}
                    >
                      Download sales Report
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={downloadPDF}>
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadExcel}>
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {showCustomRange && (
              <div className="mb-4 flex space-x-4">
                <div>
                  <label className="text-sm text-gray-600">Start Date</label>
                  <DatePicker
                    selected={customStartDate}
                    onChange={(date) => setCustomStartDate(date)}
                    selectsStart
                    startDate={customStartDate}
                    endDate={customEndDate}
                    dateFormat="yyyy-MM-dd"
                    className="border rounded p-2 w-full"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">End Date</label>
                  <DatePicker
                    selected={customEndDate}
                    onChange={(date) => setCustomEndDate(date)}
                    selectsEnd
                    startDate={customStartDate}
                    endDate={customEndDate}
                    minDate={customStartDate}
                    dateFormat="yyyy-MM-dd"
                    className="border rounded p-2 w-full"
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            )}

            {/* Sales Report Summary */}
            {reportLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-600">Loading sales report...</p>
              </div>
            ) : reportError ? (
              <p className="text-red-600">Error: {reportError.message}</p>
            ) : (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  Report Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total Orders delivered
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {salesReport?.report?.summary.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-xl font-bold text-gray-800">
                      $
                      {salesReport?.report?.summary.totalSales.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Net Sales</p>
                    <p className="text-xl font-bold text-gray-800">
                      $
                      {salesReport?.report?.summary.netSales.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Chart */}
            {!reportLoading && !reportError && (
              <div className="h-80">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  Daily Sales Overview
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesReport?.report?.dailySales || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Products and Categories Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Top Products and Categories
            </h3>
            {reportLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : reportError ? (
              <p className="text-red-600">Error: {reportError.message}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Products */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    Top 5 Products
                  </h4>
                  {topProducts.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-sm text-gray-600">
                            Product
                          </th>
                          <th className="py-2 text-sm text-gray-600">
                            Quantity
                          </th>
                          <th className="py-2 text-sm text-gray-600">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 text-sm text-gray-700">
                              {product.name}
                            </td>
                            <td className="py-2 text-sm text-gray-700">
                              {product.quantity}
                            </td>
                            <td className="py-2 text-sm text-gray-700">
                              ${product.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No products sold in this period.
                    </p>
                  )}
                </div>

                {/* Top Categories */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    Top 5 Categories
                  </h4>
                  {topCategories.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-sm text-gray-600">
                            Category
                          </th>
                          <th className="py-2 text-sm text-gray-600">
                            Quantity
                          </th>
                          <th className="py-2 text-sm text-gray-600">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCategories.map((category, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 text-sm text-gray-700">
                              {category.category}
                            </td>
                            <td className="py-2 text-sm text-gray-700">
                              {category.quantity}
                            </td>
                            <td className="py-2 text-sm text-gray-700">
                              ${category.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No categories sold in this period.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order List Content */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Orders
            </h3>

            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
                  className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-8"
                />
                {searchQuery && (
                  <XMarkIcon
                    className="w-4 h-4 absolute right-3 top-3 text-gray-400 cursor-pointer"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>
            </div>

            {salesLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-sm text-gray-600">Order #</th>
                        <th className="py-2 text-sm text-gray-600">Customer</th>
                        <th className="py-2 text-sm text-gray-600">Date</th>
                        <th className="py-2 text-sm text-gray-600">Status</th>
                        <th className="py-2 text-sm text-gray-600">Items</th>
                        <th className="py-2 text-sm text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData?.statistics?.recentOrders?.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 text-sm text-gray-700 font-medium">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 text-sm text-gray-700">
                            {order.userId?.email || "Guest"}
                          </td>
                          <td className="py-3 text-sm text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "success"
                                  : order.status === "cancelled"
                                  ? "destructive"
                                  : order.status === "shipped"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-gray-700">
                            {order.products.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}
                          </td>
                          <td className="py-3 text-sm text-gray-700 font-medium">
                            ₹{order.finalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {salesData?.statistics?.pagination?.totalOrders >
                  ordersPerPage && <PaginationControls />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
