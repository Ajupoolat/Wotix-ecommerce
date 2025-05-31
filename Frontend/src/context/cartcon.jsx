import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  getCart as apiGetCart,
  clearCart as apiClearCart,
  updateCartQuantity as apiUpdateCartQuantity,
} from "@/api/users/shop/cartmgt";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");

  const { mutateAsync: addToCart } = useMutation({
    mutationFn: (cartItem) => apiAddToCart(userId, cartItem),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", userId]);
      toast.success("Added to cart!");
    },
    onError: (error) => {
 if (error.message ===`token is missing`) {
        toast.error("please login/signup for add products to cartlist");
      } else {
        toast.error(error.message || "Failed to add to cart");
      }    
    },
  });

  const { mutateAsync: removeFromCart } = useMutation({
    mutationFn: (productId) => apiRemoveFromCart(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", userId]);
      toast.success("Removed from cart!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from cart");
    },
  });

  const { mutateAsync: updateQuantity } = useMutation({
    mutationFn: ({ productId, action }) =>
      apiUpdateCartQuantity(userId, productId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", userId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });

  const { mutate: clearCart } = useMutation({
    mutationFn: () => apiClearCart(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", userId]);
      toast.success("Cart cleared successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  const {
    data: cart,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => apiGetCart(userId),
    enabled: !!userId,
    initialData: { success: true, items: [], totalItems: 0, totalPrice: 0 },
  });

  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalPrice || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
