import { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getfiltercategory } from "@/api/users/shop/shopmgt";
import { offersdetails } from "@/api/users/shop/shopmgt";
const OffersContext = createContext();

export const OffersProvider = ({ children }) => {
  const [isApiCall, setIsApiCall] = useState(false);

  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: offersdetails,
    enabled: isApiCall,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getfiltercategory,
    enabled: isApiCall,
  });

  const triggerApicall = () => {
    setIsApiCall(true);
  };

  // Memoize to avoid unnecessary recalculations
  const getProductDiscount = useMemo(() => {
    return (product) => {
      if (!offers || !categories || !product)
        return {
          discountedPrice: product?.price || 0,
          offer: null,
        };
      const now = new Date();
      const applicableOffers = offers.filter((offer) => {
        const isActive =
          offer.isActive &&
          new Date(offer.startDate) <= now &&
          new Date(offer.endDate) >= now;

        if (!isActive) return false;

        if (offer.offerType === "product") {
          return offer.applicableProducts.some(
            (id) => id.toString() === product._id.toString()
          );
        } else if (offer.offerType === "category") {
          return offer.applicableCategories.some(
            (_id) => product.categoryRef.toString() === _id.toString()
          );
        }
        return false;
      });

      if (applicableOffers.length === 0) {
        return { discountedPrice: product.price, offer: null };
      }

      const bestOffer = applicableOffers.reduce((max, offer) =>
        offer.discountValue > max.discountValue ? offer : max
      );

      const discountedPrice =
        product.price * (1 - bestOffer.discountValue / 100);

      return {
        discountedPrice: Number(discountedPrice.toFixed(2)),
        offer: bestOffer,
      };
    };
  }, [offers, categories]);

  const contextValue = {
    getProductDiscount,
    triggerApicall,
  };

  return (
    <OffersContext.Provider value={{ getProductDiscount, triggerApicall }}>
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error("useOffers must be used within an OffersProvider");
  }
  return context;
};
