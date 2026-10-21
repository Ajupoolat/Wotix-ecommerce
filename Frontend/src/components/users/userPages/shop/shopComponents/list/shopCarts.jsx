import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Eye, ShieldCheck } from "lucide-react";
import watchPlaceholder from "@/assets/watch image.jpg";

const ProductCard = ({
  product,
  isProductInWishlists,
  toggleWishlist,
  handleAddToCart,
  showFilters,
  index = 0,
}) => {
  const navigate = useNavigate();

  if (!product) return null;

  const inWishlist = isProductInWishlists ? isProductInWishlists(product._id) : false;
  const isOutOfStock = product.stock < 1 || product.isHidden;
  const hasOffer = product.offer && (product.offer.discountValue > 0 || product.offer.discountPercentage > 0);
  const discountVal = product.offer?.discountValue || product.offer?.discountPercentage;

  // Resolve prices safely
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const discountedPrice = product.discountedPrice ?? product.finalPrice ?? originalPrice;
  const showDiscount = hasOffer && discountedPrice < originalPrice;

  const mainImage = product.images?.[0] || watchPlaceholder;

  return (
    <div
      className="group relative rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/90 dark:border-white/5 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.7)] flex flex-col justify-between overflow-hidden"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-[#080B11] p-5 flex items-center justify-center overflow-hidden">
        {/* Privilege / Discount Badge */}
        {showDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-md">
            {discountVal}% Privilege
          </div>
        )}

        {/* Wishlist Quick Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            inWishlist
              ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
              : "bg-white/90 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm"
          }`}
          title={inWishlist ? "Remove from Vault Wishlist" : "Add to Vault Wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              inWishlist ? "fill-rose-500 text-rose-500 scale-110" : ""
            }`}
          />
        </button>

        {/* Watch Image */}
        <img
          src={mainImage}
          alt={product.name || "Luxury Watch"}
          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transform group-hover:scale-106 transition-transform duration-500 cursor-pointer"
          onClick={() => navigate(`/shop/product-view/${product._id}`)}
          onError={(e) => {
            e.target.src = watchPlaceholder;
          }}
        />

        {/* Desktop Quick Hover Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/shop/product-view/${product._id}`);
            }}
            className="flex-1 py-2 rounded-lg bg-white/95 dark:bg-[#0F1626]/90 hover:bg-slate-100 dark:hover:bg-[#151F35] text-amber-700 dark:text-amber-300 text-xs font-sans font-semibold uppercase tracking-wider border border-slate-200 dark:border-amber-500/30 flex items-center justify-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Examine</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Acquire</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mb-1">
            <span>{product.category || product.categoryRef?.categoryName || "Timepiece"}</span>
            {isOutOfStock ? (
              <span className="text-rose-500 dark:text-rose-400 font-medium">Allocated (Out)</span>
            ) : product.stock < 5 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">{product.stock} Left</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400/90 font-medium">In Vault</span>
            )}
          </div>

          <h3
            onClick={() => navigate(`/shop/product-view/${product._id}`)}
            className="font-heading text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name || "Master Timepiece"}
          </h3>
        </div>

        {/* Pricing & Guarantee */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300">
                ₹{Number(discountedPrice).toLocaleString("en-IN")}
              </span>
              {showDiscount && (
                <span className="text-xs text-slate-400 line-through font-sans">
                  ₹{Number(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider font-sans text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400/80" />
              Swiss Calibre
            </span>
          </div>

          {/* Mobile Direct Action Button */}
          <div className="sm:hidden pt-1">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
