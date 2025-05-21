const express = require("express");
const {
  signup,
  sendOtp,
  login,
  verifyToken,
  logoutuser,
  googleauth,
  sendOtpforgot,
  resetPassword,
  verifyOtp,
  profiledetails,
  verifyOtpAndUpdateProfile,
  sendOtpeditprofile,
  sendotpchangepassword,
  changePassword,
} = require("../controller/userController");
const {
  product_shop,
  Searching,
  productdetails,
  productRecommendation,
  strapfetch,
  getfiltercategory
} = require("../controller/shop/shopController");

const {
  addAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
  setDefaultAddress,
} = require("../controller/addressByUser/addressController");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controller/shop/wishlistController");

const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  
} = require("../controller/shop/cartController");
const { defaultaddress } = require("../controller/shop/checkoutController");
const {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
  orderSearching,
  verifyPayment,
  retrypayment,
} = require("../controller/shop/orderController");
const {
  offershowing,
  products,
  productById,
} = require("../controller/shop/offersController");
const { generateInvoice } = require("../controller/invoiceController");
const { getWallet } = require("../controller/shop/walletController");
const {
  applyCoupon,
  eligiblecoupon,
} = require("../controller/shop/couponController");
const {userAuthorization} = require('../Middleware/authorization/userAuth')
const {getcategory} = require('../controller/categoryByAdmin/categoryController')
const router = express.Router();
const passport = require("passport");

// Public routes (no authentication needed)
router.post("/send-otp", sendOtp); 
router.post("/signup", signup); 
router.post("/login", login);
router.get("/verifyuser", verifyToken);
router.get("/shop", product_shop);
router.get("/search", Searching);
router.get("/viewproduct/:id", productdetails);
router.get("/recommandation/:id", productRecommendation);
router.get("/straps", strapfetch);
router.post("/sendotpforgot", sendOtpforgot);
router.patch("/resetpassword", resetPassword);
router.post("/verifyotp", verifyOtp);
router.get("/products/:id", productById);

// Google auth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=google_auth_failed",
  }),
  googleauth
);

// Protected routes (require user authentication)
router.post("/logoutuser", userAuthorization, logoutuser);
router.get("/profile/:id/:email", userAuthorization, profiledetails);
router.patch("/updateprofile", userAuthorization, verifyOtpAndUpdateProfile);
router.post("/otpediting", userAuthorization, sendOtpeditprofile);
router.post("/sendotpchangepassword", userAuthorization, sendotpchangepassword);
router.get("/alladdress/:id/:email", userAuthorization, getAddresses);
router.post("/newaddress/:id", userAuthorization, addAddress);
router.patch("/updateaddress/:idadd/:id", userAuthorization, updateAddress);
router.delete("/removeaddress/:idadd/:id", userAuthorization, deleteAddress);
router.get("/wishlist/:id/:email", userAuthorization, getWishlist);
router.delete("/wishlistremove/:productid/:id", userAuthorization, removeFromWishlist);
router.post("/wishlistadd/:productid/:id", userAuthorization, addToWishlist);
router.post("/addcart/:id", userAuthorization, addToCart);
router.get("/cart/:id/:email", userAuthorization, getCart);
router.delete("/removecart/:productId/:id", userAuthorization, removeFromCart);
router.patch("/updatecart/:productId/:id", userAuthorization, updateCartQuantity);
router.patch("/clearcart/:id", userAuthorization, clearCart);
router.get("/defaultaddress/:id/:email", userAuthorization, defaultaddress);
router.post("/placeorder/:id", userAuthorization, placeOrder);
router.get("/orderslist/:email/:id", userAuthorization, getOrders);
router.get("/orders-details/:userId/:id", userAuthorization, getOrderDetails);
router.post("/orderscancel/:id", userAuthorization, cancelOrder);
router.post("/ordersreturn/:orderId/return-requests/:id", userAuthorization, returnOrder);
router.get("/invoice/:userId/:id", userAuthorization, generateInvoice);
router.get("/searchorder", userAuthorization, orderSearching);
router.get("/wallet/:email/:id", userAuthorization, getWallet);
router.post("/verify-payment", userAuthorization, verifyPayment);
router.post("/apply-coupon", userAuthorization, applyCoupon);
router.get("/bestcoupon", userAuthorization, eligiblecoupon);
router.patch("/changepassword/:id", userAuthorization, changePassword);
router.get("/retry-payment/:id", userAuthorization, retrypayment);
router.get("/offers",userAuthorization, offershowing);
router.get("/products",userAuthorization, products);
router.get('/categorieslist',userAuthorization,getcategory)
router.get('/filtercat',userAuthorization,getfiltercategory)



module.exports = router;