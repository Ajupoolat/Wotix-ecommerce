const Order = require("../../models/orderSchema");

const getDateRange = (period) => {
  const now = new Date();
  let startDate,
    endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Include full end day

  switch (period) {
    case "daily":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "weekly":
      startDate = new Date(now.setDate(now.getDate() - 7));
      startDate.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
  }

  return { startDate, endDate };
};
// Generate sales report
const generateSalesReport = async (req, res) => {
  try {
    const { period, startDate: customStart, endDate: customEnd } = req.query;

    let startDate, endDate;

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(new Date(customEnd).setHours(23, 59, 59, 999)); // Include full end day
    } else {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Get all delivered orders within the date range
    const orders = await Order.find({
      status: { $in: ["delivered", "returned", "partially_returned"] },
      createdAt: { $gte: startDate, $lt: endDate },
    }).populate("products.productId");

    // Initialize report data
    let totalSales = 0;
    let totalOrders = orders.length;
    let totalItemsSold = 0;
    let totalRefunds = 0;

    const salesByDate = {};
    const salesByCategory = {};
    const salesByProduct = {};

    orders.forEach((order) => {
      const orderDate = order.createdAt.toISOString().split("T")[0];

      let orderTotal = 0;
      let orderItems = 0;

      // Calculate product totals
      order.products.forEach((item) => {
        if (!item.cancelled && item.productId) {
          orderTotal += item.price * item.quantity;
          orderItems += item.quantity;

          // Track by product
          const productId = item.productId._id.toString();
          if (!salesByProduct[productId]) {
            salesByProduct[productId] = {
              name: item.name || item.productId.name,
              quantity: 0,
              revenue: 0,
            };
          }
          salesByProduct[productId].quantity += item.quantity;
          salesByProduct[productId].revenue += item.price * item.quantity;

          // Track by category
          if (item.productId.category) {
            const category = item.productId.category;
            if (!salesByCategory[category]) {
              salesByCategory[category] = {
                quantity: 0,
                revenue: 0,
              };
            }
            salesByCategory[category].quantity += item.quantity;
            salesByCategory[category].revenue += item.price * item.quantity;
          }
        }
      });

      // Calculate refunds
      if (order.returnRequests && order.returnRequests.length > 0) {
        const refunds = order.returnRequests
          .filter((r) => r.status === "completed")
          .reduce((sum, r) => sum + (r.estimatedRefund || 0), 0);
        totalRefunds += refunds;
      }

      // Track by date
      if (!salesByDate[orderDate]) {
        salesByDate[orderDate] = {
          orders: 0,
          revenue: 0,
          items: 0,
        };
      }
      salesByDate[orderDate].orders += 1;
      salesByDate[orderDate].revenue += orderTotal;
      salesByDate[orderDate].items += orderItems;

      totalSales += orderTotal;
      totalItemsSold += orderItems;
    });

    // Convert to arrays
    const productSales = Object.keys(salesByProduct).map((key) => ({
      productId: key,
      ...salesByProduct[key],
    }));

    const categorySales = Object.keys(salesByCategory).map((key) => ({
      category: key,
      ...salesByCategory[key],
    }));

    const dailySales = Object.keys(salesByDate)
      .map((date) => ({
        date,
        ...salesByDate[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      report: {
        dateRange: {
          start: startDate,
          end: endDate,
        },
        summary: {
          totalSales,
          totalOrders,
          totalItemsSold,
          totalRefunds,
          netSales: totalSales - totalRefunds,
        },
        dailySales,
        categorySales,
        productSales,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
    });
  }
};

// Get sales statistics for dashboard with pagination
const getSalesStatistics = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const weeklyStart = new Date(now);
    weeklyStart.setDate(weeklyStart.getDate() - 7);
    weeklyStart.setHours(0, 0, 0, 0);

    const monthlyStart = new Date(now);
    monthlyStart.setMonth(monthlyStart.getMonth() - 1);
    monthlyStart.setHours(0, 0, 0, 0);

    // Build query for orders
    const orderQuery = {};

    if (status && status !== "all") {
      orderQuery.status = status;
    }

    if (search) {
      orderQuery.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "userId.name": { $regex: search, $options: "i" } },
        { "userId.email": { $regex: search, $options: "i" } },
      ];
    }

    // Get paginated orders
    const [recentOrders, totalOrders] = await Promise.all([
      Order.find(orderQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "name email"),
      Order.countDocuments(orderQuery),
    ]);

    // Get counts and totals for different periods
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd },
      ...orderQuery,
    });

    const todaySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lt: todayEnd },
          status: { $in: ["delivered", "returned", "partially_returned"] },
          ...orderQuery,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.cancelled": { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
    ]);

    const weeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weeklyStart, $lt: todayEnd },
          status: { $in: ["delivered", "returned", "partially_returned"] },
          ...orderQuery,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.cancelled": { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
    ]);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthlyStart, $lt: todayEnd },
          status: { $in: ["delivered", "returned", "partially_returned"] },
          ...orderQuery,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.cancelled": { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
    ]);

    const totalDeliveredOrders = await Order.countDocuments({
      status: "delivered",
      ...orderQuery,
    });

    res.status(200).json({
      success: true,
      statistics: {
        today: {
          orders: todayOrders,
          sales: todaySales[0]?.total || 0,
        },
        weekly: {
          sales: weeklySales[0]?.total || 0,
        },
        monthly: {
          sales: monthlySales[0]?.total || 0,
        },
        overall: {
          orders: totalOrders,
          delivered: totalDeliveredOrders,
        },
        recentOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get sales statistics",
    });
  }
};

const updatestatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Add to status timeline
    order.statusTimeline.push({
      status,
      date: new Date(),
      note: `Status changed to ${status} by admin`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  generateSalesReport,
  getSalesStatistics,
  updatestatus,
};
