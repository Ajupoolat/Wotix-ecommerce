import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../context/authuser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  MapPinIcon,
  KeyIcon,
  ShoppingBagIcon,
  WalletIcon,
  CreditCardIcon,
  EnvelopeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
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
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import logo from "../../../../assets/Wotix removed-BG.png";
import { useWishlistCount } from "@/context/wishlistCount";
import { useCart } from "@/context/cartcon";
import Restricter from "@/components/common/restricter";

const ProfilePage = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const username = localStorage.getItem("username");
  const { id } = useParams();
  const { countwislist } = useWishlistCount();
  const { totalItems } = useCart();
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email')

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => viewprofile(id,email),
  });


  const handleLogout = () => {
    logout();
    localStorage.removeItem("username");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Restricter />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="object-contain"
              style={{ height: "100px", width: "100px" }}
              onClick={() => navigate("/")}
              cursor="pointer"
            />
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {/* Username Display */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {username}
                </span>
              </div>
            )}

            {/* Icons */}
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
                  className="w-5 h-5 mt-1.5 text-gray-700 hover:text-gray-900 cursor-pointer"
                  onClick={() => navigate("/cart")}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate("/wishlist")}
                className="p-1 rounded-full hover:bg-gray-100"
              >
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
                </div>{" "}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center space-x-6 py-3">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-gray-700 hover:text-black px-3 py-2 rounded-md"
          >
            HOME
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="text-sm font-medium text-gray-700 hover:text-black px-3 py-2 rounded-md"
          >
            SHOP
          </button>
        </div>
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
          <span className="text-gray-900 font-medium">My Profile</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-gray-700 to-black px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>
                <p className="text-gray-200 mt-1">
                  Manage your personal information and preferences
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-300">Welcome back,</span>
                <span className="font-medium">
                  {profileData.firstName || username}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Management Tabs */}
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid grid-cols-4 rounded-none border-b bg-gray-50 h-15">
              <TabsTrigger
                value="personal-info"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Personal Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate(`/address/${id}`)}
              >
                <MapPinIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Address</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate("/orderslist")}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate(`wallet/${id}`)}
              >
                <WalletIcon
                  className="w-5 h-5"
                  onClick={() => navigate(`wallet/${id}`)}
                />
                <span
                  className="hidden sm:inline"
                  onClick={() => navigate(`wallet/${id}`)}
                >
                  Wallet
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info" className="mt-0">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h2>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-black text-black hover:bg-gray-50"
                    onClick={() => navigate(`/profile/:id/edit-profile/${id}`)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Name
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {profileData.firstName} {profileData.lastName}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <EnvelopeIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Email
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {profileData.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <UserPlusIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Refferal Code
                        </h3>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: "12px" }}>
                        Get 100/- rupees for Reffer a User. Share this refferal
                        code to your freind
                      </p>
                      <p className="text-gray-800 font-medium">
                        {profileData.refferalId || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCardIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Account Type
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">Standard User</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-black text-black hover:bg-gray-50"
                    onClick={() => navigate(`/changePassword/${id}`)}
                  >
                    <KeyIcon className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Logout Alert Dialog */}
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

export default ProfilePage;
