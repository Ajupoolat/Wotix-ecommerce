import { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getfiltercategory } from "@/api/users/shop/shopmgt";
import { offersdetails } from "@/api/users/shop/shopmgt";

const OffersContext = createContext();

export const OffersCartProvider = ({ children }) => {
  const [isApicall, setIsApiCall] = useState(false);
  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: offersdetails,
    enabled: isApicall,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getfiltercategory,
    enabled: isApicall,
  });

  const callApi = () => {
    setIsApiCall(true);
  };

  // Memoize to avoid unnecessary recalculations
  const getProductCartDiscount = useMemo(() => {
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
            (catId) => product.categoryRef?._id.toString() === catId.toString()
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

  return (
    <OffersContext.Provider value={{ getProductCartDiscount, callApi }}>
      {children}
    </OffersContext.Provider>
  );
};

export const useCartOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error("useOffers must be used within an OffersProvider");
  }
  return context;
};
