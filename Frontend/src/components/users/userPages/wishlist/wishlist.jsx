import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/cartcon";
import { useAuth } from "@/context/authuser";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist, getWishlist } from "@/api/users/shop/wishlistmgt";
import { Footer } from "@/components/common/footer";
import ErrorCommon from "@/components/common/CommonError";
import LoaderSpinner from "@/components/common/spinner";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import Breadcrumbs from "@/components/common/breadCrums";
import watchPlaceholder from "@/assets/watch image.jpg";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");

  // Fetch wishlist data
  const {
    data: wishlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist", userId, email],
    queryFn: () => getWishlist(userId, email),
    enabled: !!userId && isAuthenticated,
  });

  // Remove from wishlist mutation
  const { mutate: removeFromWishlistMutation } = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      toast.success("Timepiece removed from vault wishlist.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        originalPrice: product.originalPrice ?? product.price,
        price: product.discountedPrice ?? product.finalPrice ?? product.price,
        ...(product.offer && {
          offerId: product.offer._id,
          offerName: product.offer.title,
        }),
      });

      removeFromWishlistMutation(product._id);
    } catch (error) {
      // Handled in cart context
    }
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <ErrorCommon />;
  }

  const products = wishlist?.products || [];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault", link: `/profile/${userId}` },
          { label: "Private Wishlist" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-1 font-semibold">
              Curated Favorites
            </span>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Private Vault Wishlist
            </h1>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {products.length} {products.length === 1 ? "Timepiece" : "Timepieces"} Saved
          </span>
        </div>

        {!isAuthenticated ? (
          <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-8 max-w-lg mx-auto space-y-4 shadow-sm">
            <Heart className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
            <h2 className="font-cinzel text-xl font-bold text-slate-900 dark:text-white">
              Private Vault Wishlist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Please sign in to access your curated wishlist of saved timepieces.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider"
            >
              Sign In to Account
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-8 max-w-lg mx-auto space-y-4 shadow-sm">
            <Heart className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
            <h3 className="font-cinzel text-xl font-bold text-slate-900 dark:text-white">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You haven't saved any mastercrafted timepieces to your private vault wishlist yet.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Explore Timepieces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const originalPrice = product.originalPrice ?? product.price ?? 0;
              const discountedPrice = product.discountedPrice ?? product.finalPrice ?? originalPrice;
              const showDiscount = discountedPrice < originalPrice;
              const isOutOfStock = product.stock <= 0;
              const img = product.images?.[0] || watchPlaceholder;

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/shop/product-view/${product._id}`)}
                  className="group rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/90 dark:border-white/5 hover:border-amber-500/40 p-5 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  {/* Image Stage */}
                  <div className="relative aspect-square w-full bg-slate-50 dark:bg-[#080B11] rounded-xl p-4 flex items-center justify-center overflow-hidden mb-4">
                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlistMutation(product._id);
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {showDiscount && (
                      <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow">
                        Privilege
                      </span>
                    )}

                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transform group-hover:scale-106 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = watchPlaceholder;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <span>{product.brand || "Timepiece"}</span>
                        {isOutOfStock ? (
                          <span className="text-rose-500 dark:text-rose-400 font-medium">Out of Stock</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                        )}
                      </div>
                      <h3 className="font-cinzel text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-cinzel text-lg font-bold text-amber-700 dark:text-amber-300">
                          ₹{Number(discountedPrice).toLocaleString("en-IN")}
                        </span>
                        {showDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Number(originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to bag action */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isOutOfStock ? "Allocated (Sold Out)" : "Move to Shopping Bag"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default WishlistPage;
