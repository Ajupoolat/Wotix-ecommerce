import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWishlist } from "@/api/users/shop/wishlistmgt";

const WishlistCountContext = createContext();

export const WishlistCountProvider = ({ children }) => {
  const userId = localStorage.getItem("userId");

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
  });

  const [countwislist, setcountwislist] = useState(0);

  useEffect(() => {
    if (wishlist) {
      setcountwislist(wishlist.products.length);
    }
  }, [wishlist]);

  const value = useMemo(
    () => ({ countwislist, setcountwislist }),
    [countwislist]
  );

  return (
    <WishlistCountContext.Provider value={value}>
      {children}
    </WishlistCountContext.Provider>
  );
};

export const useWishlistCount = () => {
  const context = useContext(WishlistCountContext);

  if (!context) {
    throw new Error(
      "useWishlistCount must be used within a WishlistCountProvider"
    );
  }

  return context;
};
