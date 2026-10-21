import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  removeFromCart as apiRemoveFromCart,
  updateCartQuantity as apiUpdateCartQuantity,
  clearCart as apiClearCart,
} from "@/api/users/shop/cartmgt";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");

  const { mutateAsync: addToCart } = useMutation({
    mutationFn: (cartItem) => apiAddToCart(userId, cartItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Added to shopping bag!");
    },
    onError: (error) => {
      if (error.message === "token is missing") {
        toast.error("Please login or create an account to curate your shopping bag.");
      } else {
        toast.error(error.message || "Failed to add timepiece to bag");
      }
    },
  });

  const { mutateAsync: removeFromCart } = useMutation({
    mutationFn: (productId) => apiRemoveFromCart(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Timepiece removed from bag.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  const { mutateAsync: updateQuantity } = useMutation({
    mutationFn: ({ productId, action }) =>
      apiUpdateCartQuantity(userId, productId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });

  const { mutate: clearCart } = useMutation({
    mutationFn: () => apiClearCart(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Shopping bag cleared.");
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

export const useCart = () => useContext(CartContext);
