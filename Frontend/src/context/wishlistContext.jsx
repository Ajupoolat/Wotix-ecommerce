import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist
 
} from "@/api/users/shop/wishlistmgt";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  
  // Wishlist data query
  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
  });

  // Add to wishlist mutation
  const { mutate: addMutation } = useMutation({
    mutationFn: (productId) => addToWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist", userId]);
      toast.success("Added to wishlist!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to wishlist");
    },
  });


    const { mutate: removeMutation } = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist", userId]);
      toast.success("Removed from wishlist!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  // Check if product is in wishlist
  const isProductInWishlists = (productId) => {
    return wishlist?.products?.some(item => item._id === productId) || false;
  };

  // Toggle wishlist status
  const toggleWishlist = (productId) => {
    if (isProductInWishlists(productId)) {
      removeMutation(productId);
    } else {
      addMutation(productId);
    }
  };

  // Count of items in wishlist
  const count = wishlist?.products?.length || 0;

  const value = useMemo(() => ({
    wishlist,
    count,
    isProductInWishlists,
    toggleWishlist
  }), [wishlist, count]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
