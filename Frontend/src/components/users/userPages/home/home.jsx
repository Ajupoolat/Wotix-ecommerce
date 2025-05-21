import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "../../../../assets/Wotix removed-BG.png";
import heroWatch from "../../../../assets/Banner2.jpg";
import banner2 from "../../../../assets/bannerforhome.jpg";
import {
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/authuser";
import WebSocketListener from "@/Sockets/webSocketListner";
import { useWishlistCount } from "@/context/wishlistCount";
import { useCart } from "@/context/cartcon";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const { totalItems } = useCart();
  const { countwislist } = useWishlistCount();


 
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: "150px", width: "150px" }}
          />
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          {/* Username Display */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`profile/${userId}`)}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {username}
              </span>
            </div>
          )}

          {/* Icons */}
          <div className="flex justify-evenly gap-4">
            {isAuthenticated ? (
              <ArrowRightStartOnRectangleIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => {
                  setShowLogoutAlert(true);
                }}
              />
            ) : (
              <UserIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => navigate("/signup")}
              />
            )}
            <div className="relative">
              <ShoppingCartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
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
                className="w-5 h-5 text-gray-700 hover:text-gray-900  cursor-pointer"
                onClick={() => navigate("/wishlist")}
              />
              {countwislist > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {countwislist}
                </span>
              )}
            </div>{" "}
          </div>
        </div>
      </header>

      {/* Navigation Links */}
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

      {/* Hero Section */}
      <section className="relative">
        <img
          src={heroWatch}
          alt="Hero Watch"
          className="w-full h-64 sm:h-80 md:h-96 lg:h-112 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 bg-opacity-30" />
        <div className="absolute top-1/2 left-4 sm:left-12 transform -translate-y-1/2 max-w-xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            WELCOME TO WOTIX
          </h1>
          <p className="text-lg sm:text-xl text-white mt-4 drop-shadow-md hidden sm:block">
            Discover precision timepieces that define your style
          </p>
          <Button
            className="mt-6 bg-white text-black hover:bg-gray-200 shadow-lg hidden sm:block"
            onClick={() => navigate("/shop")}
          >
            EXPLORE COLLECTION
          </Button>
        </div>
      </section>

      {/* alert */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                localStorage.removeItem("username");
                localStorage.removeItem("userId");
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quote Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          "A WATCH IS A SMALL WINDOW INTO THE SOUL OF TIME"
        </h2>
      </section>

      {/* Banner2 Section - Now styled like heroWatch */}
      <section className="relative">
        <img
          src={banner2}
          alt="Luxury Watch Collection"
          className="w-full h-64 sm:h-80 md:h-96 lg:h-112 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute top-1/2 left-4 sm:left-12 transform -translate-y-1/2 max-w-md">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Timeless Elegance Awaits
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-white mb-6 drop-shadow-md">
            Discover the perfect blend of luxury and precision with our latest
            collections.
          </p>
          <Button
            className="bg-white text-black hover:bg-gray-200 shadow-lg"
            onClick={() => navigate("/shop")}
          >
            EXPLORE PRODUCTS
          </Button>
        </div>
      </section>

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

export default HomePage;
