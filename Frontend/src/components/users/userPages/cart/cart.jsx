import React, { useState } from "react";
import { useAuth } from "@/context/authuser";
import { useCart } from "@/context/cartcon";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import ErrorCommon from "@/components/common/CommonError";
import BrowseProduct from "@/components/common/browseProduct";
import PleaseLogin from "@/components/common/pleaseLogin";
import AlertBox from "@/components/common/alertBox";
import CartList from "./cartComponents/list/cartList";
import OrderSummary from "./cartComponents/summary/summaryCart";
import Breadcrumbs from "@/components/common/breadCrums";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cleardialog, setCleardialog] = useState(false);

  const {
    cart,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    error,
  } = useCart();

  const handleQuantityChange = (productId, action) => {
    updateQuantity({ productId, action });
  };

  const shippingFee = 50;

  if (loading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <ErrorCommon />;
  }

  const hasItems = isAuthenticated && cart?.items?.length > 0 && cart?.success;

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      {/* Header */}
      <IconsArea />
      <Navbar />

      {/* Breadcrumb Trail */}
      <Breadcrumbs
        items={[
          { label: "Shop", link: "/shop" },
          { label: "Shopping Bag" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-white/5">
          <div>
            <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-1 font-semibold">
              Curated Selection
            </span>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Your Shopping Bag
            </h1>
          </div>
          {hasItems && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {cart.items.length} {cart.items.length === 1 ? "Piece" : "Pieces"} Allocated
            </span>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-8 max-w-lg mx-auto space-y-4 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
            <h2 className="font-cinzel text-xl font-bold text-slate-900 dark:text-white">
              Private Vault Access
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Please sign in to your WOTIX collector account to view and manage your shopping bag.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              Sign In to Account
            </button>
          </div>
        ) : !hasItems ? (
          <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-8 max-w-xl mx-auto space-y-5 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
            <h2 className="font-cinzel text-2xl font-bold text-slate-900 dark:text-white">
              Your Bag is Empty
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your personal horology vault has no active reservations. Explore our mastercrafted collections and discover your next heirloom.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20"
            >
              <span>Explore Timepieces</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items List */}
            <CartList
              items={cart.items}
              onQuantityChange={handleQuantityChange}
              onRemove={removeFromCart}
              setItemToDelete={setItemToDelete}
              setShowDeleteDialog={setShowDeleteDialog}
            />

            {/* Order Summary */}
            <OrderSummary
              totalPrice={cart.totalPrice || 0}
              shippingFee={shippingFee}
              onCheckout={() => navigate("/checkout")}
              onContinueShopping={() => navigate("/shop")}
              onClearCart={() => setCleardialog(true)}
            />
          </div>
        )}
      </div>

      {/* Alert for removing single cart item */}
      <AlertBox
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Remove Timepiece"
        description="Are you certain you wish to release this timepiece from your vault bag?"
        confirmLabel="Remove"
        onConfirm={() => {
          removeFromCart(itemToDelete);
          // Toast is handled in cart context
        }}
      />

      {/* Alert for clearing cart */}
      <AlertBox
        open={cleardialog}
        onOpenChange={setCleardialog}
        title="Clear Entire Bag"
        description="Are you sure you wish to release all reserved timepieces from your shopping bag?"
        confirmLabel="Clear Bag"
        onConfirm={() => {
          clearCart();
          // Toast is handled in cart context
        }}
      />

      <Footer />
    </div>
  );
}

export default CartPage;
