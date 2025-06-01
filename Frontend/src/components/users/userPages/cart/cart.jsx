import { useState } from "react";
import { useAuth } from "@/context/authuser";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/cartcon";
import Navbar from "@/components/common/navbar";
import LoaderSpinner from "@/components/common/spinner";
import { Footer } from "@/components/common/footer";
import IconsArea from "@/components/common/IconsArea";
import ErrorCommon from "@/components/common/CommonError";
import BrowseProduct from "@/components/common/browseProduct";
import PleaseLogin from "@/components/common/pleaseLogin";
import AlertBox from "@/components/common/alertBox";
import CartList from "../cart/cartComponents/list/cartList";
import OrderSummary from "../cart/cartComponents/summary/summaryCart";
import { useNavigate } from "react-router-dom";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cleardialong, setCleardialong] = useState(false);
  const { cart, loading, removeFromCart, updateQuantity, clearCart, error } =
    useCart();

  // Handle quantity changes
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

  return (
    <div className="min-h-screen bg-white">
      {/* user-controls */}
      <IconsArea />
      {/* navbar */}
      <Navbar />
       {/* list */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Shopping Cart</h1>

        {!isAuthenticated ? (
          <PleaseLogin message={"Please sign in to view your cart"} />
        ) : !cart?.items?.length || !cart?.success ? (
          <BrowseProduct message={"Your cart is empty"} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
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
              onClearCart={() => setCleardialong(true)}
            />
          </div>
        )}
      </div>

      {/* Alert for removing cart items */}
      <AlertBox
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Confirm Removal"
        description="Are you sure you want to remove this item from your cart?"
        confirmLabel="Remove"
        onConfirm={() => {
          removeFromCart(itemToDelete);
          toast.success("Item removed from cart");
        }}
      />

      {/* Alert for clearing the cart */}
      <AlertBox
        open={cleardialong}
        onOpenChange={setCleardialong}
        title="Confirm Clear Cart"
        description="Are you sure you want to clear all items from your cart?"
        confirmLabel="Clear"
        onConfirm={() => {
          clearCart();
          toast.success("Items cleared from cart");
        }}
      />
      {/* Footer */}
      <Footer />
    </div>
  );
}
export default CartPage;
