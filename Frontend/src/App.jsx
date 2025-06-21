import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/admin/adminPages/Dashboard/dashboard";
import AdminLogin from "./components/admin/adminPages/Login/Login";
import ProtectedadminRoute from "./components/admin/protectedRoutes/adminProtectedRoute";
import PublicRoute from "./components/admin/protectedRoutes/publicRoute";
import Signup from "./components/users/userPages/signup/signup";
import Login from "./components/users/userPages/login/login";
import HomePage from "./components/users/userPages/home/home";
import Otp from "./components/users/userPages/otp/otp";
import PublicUserRoute from "./components/users/userProtect/userPublicRoute";
import ProtecteduserRoute from "./components/users/userProtect/userProtected";
import Userslist from "./components/admin/adminPages/userlist/userlist";

import CategoryListing from "./components/admin/adminPages/categories/categories";
import Productlist from "./components/admin/adminPages/productlisting/productlisting";
import AddProduct from "./components/admin/forms/addproduct";
import EditProduct from "./components/admin/forms/editproduct";
import ShopPage from "./components/users/userPages/shop/shop";
import ProductViewPage from "./components/users/userPages/shop/productdetails";
import ForgotPasswordEmail from "./components/users/forgotpassword/forgot";
import ForgotPasswordInput from "./components/users/forgotpassword/inputforgot";
import ProfilePage from "./components/users/userPages/profilepage/profilepage";
import EditProfilePage from "./components/users/userforms/profile/editprofile";
import OtpEdit from "./components/users/userforms/profile/otpediting";
import ChangePasswordEmail from "./components/users/userforms/profile/emailchange";
import AddressComponent from "./components/users/userPages/address/address";
import WishlistPage from "./components/users/userPages/wishlist/wishlist";
import CartPage from "./components/users/userPages/cart/cart";
import CheckoutPage from "./components/users/userPages/checkout/checkout";
import OrderConfirmationPage from "./components/users/userPages/checkout/orderconfirmation";
import OrderListPage from "./components/users/userPages/orders/orderlist";
import OrderDetailsPage from "./components/users/userPages/orders/orderdetails";
import OrderList from "./components/admin/adminPages/orders/orders";
import OrderDetailsAdmin from "./components/admin/adminPages/orders/orderdetailsadmin";
import WalletPage from "./components/users/userPages/wallet/wallet";
import OfferList from "./components/admin/adminPages/offer/offerlist";
import AddOfferForm from "./components/admin/adminPages/offer/forms/addoffer";
import EditOfferForm from "./components/admin/adminPages/offer/forms/editoffer";
import CouponList from "./components/admin/adminPages/coupon/couponlist";
import ChangePasswordInput from "./components/users/userforms/profile/changepassword";
const App = () => {
  return (
    <Routes>
      <Route element={<PublicUserRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgotpassword" element={<ForgotPasswordEmail />} />
        <Route path="/forgotpasswordinput" element={<ForgotPasswordInput />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtecteduserRoute />}>
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route
          path="/profile/:id/edit-profile/:id"
          element={<EditProfilePage />}
        />
        
        <Route
          path="/profile/:id/edit-profile/:id/otpverify"
          element={<OtpEdit />}
        />
        <Route
          path="/profile/:id/change-password"
          element={<ChangePasswordEmail />}
        />
        <Route path="/otpverification" element={<OtpEdit />} />
        <Route path="/createpassword" element={<ForgotPasswordInput />} />
        <Route path="/address/:id" element={<AddressComponent />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orderslist" element={<OrderListPage />} />
        <Route path="/order-confirm" element={<OrderConfirmationPage />} />
        <Route path="/order-details/:id" element={<OrderDetailsPage />} />
        <Route path="/profile/:id/wallet/:id" element={<WalletPage />} />
        <Route path="/changePassword/:id" element={<ChangePasswordInput />} />
      </Route>

      {/* Common routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/product-view/:id" element={<ProductViewPage />} />
      <Route element={<PublicRoute />}>
        <Route path="/adminlogin" element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedadminRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Userslist />} />
        <Route path="/admin/categories" element={<CategoryListing />} />
        <Route path="/admin/productlist" element={<Productlist />} />
        <Route path="/admin/productlist/addproduct" element={<AddProduct />} />
        <Route
          path="/admin/productlist/editproduct/:id"
          element={<EditProduct />}
        />
        <Route path="/admin/orders" element={<OrderList />} />
        <Route path="/admin/orders/:orderId" element={<OrderDetailsAdmin />} />
        <Route path="/admin/offers" element={<OfferList />} />
        <Route path="/admin/offers/addoffer" element={<AddOfferForm />} />
        <Route
          path="/admin/offers/editoffer/:offerId"
          element={<EditOfferForm />}
        />
        <Route path="/admin/coupon" element={<CouponList />} />
      </Route>

      <Route element={<ProtecteduserRoute />}></Route>
    </Routes>
  );
};

export default App;
