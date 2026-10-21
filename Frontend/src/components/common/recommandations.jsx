import React from "react";
import { recommandation } from "@/api/users/shop/shopmgt";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/wishlistContext";
import watchImage from "@/assets/watch image.jpg";

const RecommendProducts = ({ id }) => {
  const navigate = useNavigate();
  const { isProductInWishlists, toggleWishlist } = useWishlist();

  const { data: recommendations, isLoading: isRecLoading } = useQuery({
    queryKey: ["productRecommendation", id],
    queryFn: () => recommandation(id),
    enabled: !!id,
  });

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F17] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-700 dark:text-amber-400">Curated For You</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white mt-1">Similar Timepieces</h2>
          </div>
          <button 
            onClick={() => navigate("/shop")}
            className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            Explore All <span>&rarr;</span>
          </button>
        </div>

        {isRecLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#111724] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden p-4 shadow-sm">
                <Skeleton className="h-56 w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-white/5" />
                  <Skeleton className="h-6 w-1/3 bg-slate-200 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="group relative bg-white dark:bg-[#111724] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/60 cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/shop/product-view/${item._id}`)}
              >
                <div className="relative bg-slate-100/70 dark:bg-[#0E131E] p-6 flex items-center justify-center h-64 overflow-hidden">
                  {item.offer && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10 shadow-md">
                      {item.offer.discountValue}% OFF
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item._id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-black/80 transition-all z-10 shadow-sm"
                    aria-label="Toggle Wishlist"
                  >
                    {isProductInWishlists(item._id) ? (
                      <HeartSolid className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                  </button>
                  <img
                    src={item.images?.[0] || watchImage}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-gray-400">
                      {item.categoryRef?.categoryName || "Haute Horlogerie"}
                    </span>
                    <h3 className="font-serif text-slate-900 dark:text-white text-lg font-semibold mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      {item.discountedPrice < item.originalPrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                            ₹{item.discountedPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.originalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          ₹{item.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold group-hover:underline">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendProducts;
