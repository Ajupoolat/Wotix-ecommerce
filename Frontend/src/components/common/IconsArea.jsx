import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/authuser";
import { useTheme } from "@/context/themeContext";
import {
  User,
  ShoppingBag,
  Heart,
  LogOut,
  Menu,
  X,
  Search,
  ShieldCheck,
  Package,
  Wallet,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/cartcon";
import { useWishlist } from "@/context/wishlistContext";
import logo from "@/assets/Wotix removed-BG.png";
import NotificationsUser from "../users/userComponents/nofications";

const IconsArea = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { count } = useWishlist();
  const userId = localStorage.getItem("userId");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const username = localStorage.getItem("username") || "Collector";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-header transition-all duration-300">
      {/* Top Reassurance Bar */}
      <div className="bg-amber-500/10 dark:bg-[#070A10] border-b border-amber-500/20 dark:border-white/5 py-1.5 px-4 text-center transition-colors">
        <p className="text-[11px] font-medium tracking-widest text-amber-900 dark:text-amber-200/90 uppercase flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Haute Horlogerie • 100% Certified Authentic • 2-Year International Warranty</span>
        </p>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Wotix Luxury Timepieces"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-serif tracking-[0.25em] text-slate-900 dark:text-white text-lg font-bold">WOTIX</span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-amber-600 dark:text-amber-400/80 -mt-1">Geneve</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 py-1 border-b-2 ${
                isActive("/")
                  ? "text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400"
                  : "text-slate-600 dark:text-gray-300 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30"
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 py-1 border-b-2 ${
                isActive("/shop")
                  ? "text-amber-600 dark:text-amber-400 border-amber-400"
                  : "text-slate-600 dark:text-gray-300 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30"
              }`}
            >
              Timepieces
            </Link>
            {isAuthenticated && (
              <Link
                to="/orderslist"
                className={`text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 py-1 border-b-2 ${
                  isActive("/orderslist")
                    ? "text-amber-600 dark:text-amber-400 border-amber-400"
                    : "text-slate-600 dark:text-gray-300 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30"
                }`}
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Real-time Notifications */}
            {isAuthenticated && (
              <div className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                <NotificationsUser />
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 outline-none"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 hover:text-amber-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
              )}
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md animate-pulse">
                  {count}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer outline-none">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs shadow-sm">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold tracking-wider text-slate-800 dark:text-gray-200 max-w-[90px] truncate">
                    {username}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-[#111724] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 shadow-2xl rounded-xl p-1.5 mt-2">
                  <DropdownMenuLabel className="font-serif text-amber-600 dark:text-amber-400 text-xs tracking-wider uppercase px-3 py-2">
                    Collector Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => navigate(`/profile/${userId}`)}
                  >
                    <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => navigate("/orderslist")}
                  >
                    <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => navigate(`/address/${userId}`)}
                  >
                    <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Manage Addresses</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => navigate(`/profile/${userId}/wallet/${userId}`)}
                  >
                    <Wallet className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Digital Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-500 dark:text-red-400 cursor-pointer rounded-lg hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    onClick={() => setShowLogoutAlert(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-luxury-gold px-4 sm:px-5 py-2 rounded-full text-xs"
                >
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0F17] border-b border-slate-200 dark:border-white/10 px-6 py-6 space-y-4 animate-fadeInUp shadow-xl">
          {/* Theme Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/10">
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-600 dark:text-gray-400">
              Appearance
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:border-amber-500/50 transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold tracking-widest uppercase text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold tracking-widest uppercase text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2"
          >
            Explore Timepieces
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/orderslist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold tracking-widest uppercase text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2"
              >
                Orders
              </Link>
              <Link
                to={`/profile/${userId}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold tracking-widest uppercase text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 py-2"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutAlert(true);
                }}
                className="block w-full text-left text-sm font-semibold tracking-widest uppercase text-red-500 dark:text-red-400 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-300 dark:border-white/20 text-xs font-semibold tracking-wider uppercase text-slate-800 dark:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-luxury-gold w-full text-center py-2.5 rounded-lg text-xs"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="bg-white dark:bg-[#111724] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 rounded-2xl max-w-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-slate-900 dark:text-white">
              Conclude Your Session?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-gray-400 text-sm">
              You will need to sign in again to view your vault, track active deliveries, or manage your digital wallet balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="bg-transparent border border-slate-300 dark:border-white/15 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg">
              Stay Signed In
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                localStorage.removeItem("username");
                localStorage.removeItem("userId");
                localStorage.removeItem("email");
                setShowLogoutAlert(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default IconsArea;
