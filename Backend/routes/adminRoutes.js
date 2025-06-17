const express = require("express");
const {
  verrifyadmin,
  adminlogin,
  logout,
  getuser,
  blockuser,
  searchuser,
} = require("../controller/adminController");
const websocket = require("../Middleware/WebSockets/websocketMiddleware");
const {
  addcategory,
  getCategoriesWithStock,
  deletecategory,
  editcategory,
  categorySearch,
  toggleCategoryVisibilty,
  getcategory,
} = require("../controller/categoryByAdmin/categoryController");
const {
  addproduct,
  upload,
  getproductdetails,
  deletecproduct,
  editproduct,
  productsearch,
  toggleProductVisibility,
  productsdetails,
} = require("../controller/productByAdmin/productController");

const {
  getorders,
  detailsorder,
  updateOrderStatus,
  processReturnRequest,
  getPendingReturnRequests,
} = require("../controller/orderAdmin/orderListController");

const {
  getalloffers,
  addOffer,
  producslist,
  categorylist,
  editOffer,
  deleteOffer,
  getOfferById,
} = require("../controller/offerByAdmin/offerAdminController");

const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controller/shop/couponController");
const {
  generateSalesReport,
  getSalesStatistics,
  updatestatus,
  processOrder,
} = require("../controller/salesReport/salesreportController");
const { adminAuthorization } = require("../Middleware/authorization/adminAuth");
const {
  getnotificationsAdmin,
  updateNotificationAdmin,
  deletionNotificationAdmin,
} = require("../controller/notifications/notificationControllers");
const router = express.Router();

// Public routes (no authorization needed)
router.post("/adminlogin", adminlogin);
router.post("/adminlogout", logout);
router.get("/verifyadmin", verrifyadmin);

// Protected routes (require admin authorization)
router.get("/getuserdetails", adminAuthorization, getuser);
router.patch("/blockuser/:id", adminAuthorization, websocket, blockuser);
router.get("/searchuser", adminAuthorization, searchuser);
router.post("/addcategory", adminAuthorization, addcategory);
router.get("/categorydetails", adminAuthorization, getCategoriesWithStock);
router.delete("/deletecategory/:id", adminAuthorization, deletecategory);
router.patch("/editcategory/:id", adminAuthorization, editcategory);
router.get("/searchcategory", adminAuthorization, categorySearch);
router.post(
  "/addproduct",
  adminAuthorization,
  upload.array("productImages", 3),
  addproduct
);
router.get("/productdetails", adminAuthorization, getproductdetails);
router.patch(
  "/editproduct/:id",
  adminAuthorization,
  upload.array("productImages", 3),
  editproduct
);
router.get("/searchproduct", adminAuthorization, productsearch);
router.delete("/removeproduct/:id", adminAuthorization, deletecproduct);
router.patch(
  "/toggle-visibility/:id",
  adminAuthorization,
  toggleProductVisibility
);
router.patch(
  "/togglecat-visiblity/:id",
  adminAuthorization,
  toggleCategoryVisibilty
);
router.get("/orders", adminAuthorization, getorders);
router.get("/orders/:id", adminAuthorization, detailsorder);
router.patch("/orders/:id/status", adminAuthorization, updateOrderStatus);
router.put(
  "/process/:orderId/:requestId",
  adminAuthorization,
  processReturnRequest
);
router.get("/pending", adminAuthorization, getPendingReturnRequests);
router.get("/offers", adminAuthorization, getalloffers);
router.patch("/offers/:id", adminAuthorization, editOffer);
router.delete("/offers/:id", adminAuthorization, deleteOffer);
router.post("/offers", adminAuthorization, addOffer);
router.get("/offers/:id", adminAuthorization, getOfferById);
router.get("/productlist", adminAuthorization, producslist);
router.get("/categorylist", adminAuthorization, categorylist);
router.get("/coupon", adminAuthorization, getAllCoupons);
router.get("/coupon/:id", adminAuthorization, getCouponById);
router.post("/coupon", adminAuthorization, createCoupon);
router.delete("/coupon/:id", adminAuthorization, deleteCoupon);
router.patch("/coupon/:id", adminAuthorization, updateCoupon);
router.get("/sales-report", adminAuthorization, generateSalesReport);
router.get("/sales-statistics", adminAuthorization, getSalesStatistics);
router.put("/orders/:id/status", adminAuthorization, updatestatus);
router.get("/allproducts", adminAuthorization, productsdetails);
router.get("/categorieslists", adminAuthorization, getcategory);
router.get("/notificationsAdmin", adminAuthorization, getnotificationsAdmin);
router.patch(
  "/notificationsAdmin/:id",
  adminAuthorization,
  updateNotificationAdmin
);
router.delete(
  "/notificationsAdmin/:id",
  adminAuthorization,
  deletionNotificationAdmin
);

module.exports = router;
