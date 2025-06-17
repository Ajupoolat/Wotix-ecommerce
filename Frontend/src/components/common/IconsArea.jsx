import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authuser";
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
import { useCart } from "@/context/cartcon";
import { useWishlist } from "@/context/wishlistContext";
import logo from "../../../src/assets/Wotix removed-BG.png";
import { Button } from "../ui/button";
import NotificationsUser from "../users/userComponents/nofications";

const IconsArea = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { count } = useWishlist();
  const userId = localStorage.getItem("userId");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const username = localStorage.getItem("username");


  return (
    <div>
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: "150px", width: "150px" }}
          />
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated&&<NotificationsUser/>}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {username}
              </span>
            </div>
          )}
          {/* Icons */}
          <div className="flex items-center justify-evenly gap-4">
            {isAuthenticated ? (
              <div className="flex items-center">
                <ArrowRightStartOnRectangleIcon
                  className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => {
                    setShowLogoutAlert(true);
                  }}
                />
              </div>

            
              
            ) : (
              <Button
                className="h-8 cursor-pointer hover:bg-gray-500 font-bold transition-colors"
                onClick={() => navigate("/signup")}
              >
                Login/Signup
              </Button>
            )}
            <div className="relative flex items-center">
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
            <div className="relative flex items-center">
              <HeartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={() => navigate("/wishlist")}
              />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

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
    </div>
  );
};

export default IconsArea;
