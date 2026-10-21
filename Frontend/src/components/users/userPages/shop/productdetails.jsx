import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { details } from "@/api/users/shop/shopmgt";
import WebSocketListener from "@/Sockets/webSocketListner";
import ImageMagnifier from "@/components/common/zoom";
import { useAuth } from "@/context/authuser";
import { useCart } from "@/context/cartcon";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";
import { Footer } from "@/components/common/footer";
import LoaderSpinner from "@/components/common/spinner";
import NotAvailable from "@/components/common/notAvailable";
import RecommendProducts from "@/components/common/recommandations";
import { useWishlist } from "@/context/wishlistContext";
import Breadcrumbs from "@/components/common/breadCrums";
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Clock,
} from "lucide-react";
import watchPlaceholder from "@/assets/watch image.jpg";

const ProductViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isProductInWishlists, toggleWishlist } = useWishlist();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch product details
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productDetails", id],
    queryFn: () => details(id),
  });

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setIsAdding(true);
    try {
      await addToCart({
        productId: product._id,
        quantity,
        originalPrice: product.originalPrice ?? product.price,
        price: product.discountedPrice ?? product.finalPrice ?? product.price,
        ...(product.offer && {
          offerId: product.offer._id,
          offerName: product.offer.title,
        }),
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock === 0) return;
    await handleAddToCart();
    navigate("/cart");
  };

  const images = product?.images?.length ? product.images : [watchPlaceholder];

  const handlePrevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleNextImage = () =>
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  if (authLoading || isLoading) {
    return <LoaderSpinner />;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col justify-between">
        <IconsArea />
        <Navbar />
        <div className="py-24 text-center">
          <NotAvailable />
        </div>
        <Footer />
      </div>
    );
  }

  const inWishlist = isProductInWishlists(product._id);
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const discountedPrice = product.discountedPrice ?? product.finalPrice ?? originalPrice;
  const hasOffer = product.offer && (product.offer.discountValue > 0 || product.offer.discountPercentage > 0);
  const discountVal = product.offer?.discountValue || product.offer?.discountPercentage;
  const isOutOfStock = product.stock === 0 || product.isHidden;

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      {isAuthenticated && <WebSocketListener />}

      {/* Header & Sub-Navigation */}
      <IconsArea />
      <Navbar />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Shop", link: "/shop" },
          ...(product.category || product.categoryRef?.categoryName
            ? [
                {
                  label: product.category || product.categoryRef?.categoryName,
                  link: `/shop?category=${product.category || product.categoryRef?.categoryName}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      {/* Main Product Presentation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Gallery Stage (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-6 flex items-center justify-center min-h-[420px] sm:min-h-[500px] overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
              {/* Ambient Spotlight */}
              <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {isOutOfStock ? (
                  <span className="bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Allocated (Sold Out)
                  </span>
                ) : product.stock < 5 ? (
                  <span className="bg-amber-500/20 border border-amber-600/30 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
                    Rare Allocation • Only {product.stock} Available
                  </span>
                ) : null}

                {hasOffer && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {discountVal}% Collector Privilege
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  inWishlist
                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
                    : "bg-white/90 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm"
                }`}
                title={inWishlist ? "Remove from Vault Wishlist" : "Add to Vault Wishlist"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    inWishlist ? "fill-rose-500 text-rose-500 scale-110" : ""
                  }`}
                />
              </button>

              {/* Interactive Image Magnifier */}
              <ImageMagnifier
                src={images[currentImageIndex]}
                zoom={2.2}
                size={180}
              />

              {/* Slider Arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-[#0D121D]/80 hover:bg-slate-100 dark:hover:bg-[#141C2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-[#0D121D]/80 hover:bg-slate-100 dark:hover:bg-[#141C2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white dark:bg-[#0B0F17] p-1.5 transition-all cursor-pointer shrink-0 ${
                      currentImageIndex === idx
                        ? "border-2 border-amber-500 dark:border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                        : "border border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Specifications & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-sans tracking-[0.16em] uppercase mb-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.brand || "Haute Horlogerie"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-wide leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-sans tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Collector Valuation
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-bold text-amber-700 dark:text-amber-300">
                  ₹{Number(discountedPrice).toLocaleString("en-IN")}
                </span>
                {hasOffer && (
                  <span className="text-base text-slate-400 line-through font-sans">
                    ₹{Number(originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono ml-auto font-medium">
                  Taxes Included
                </span>
              </div>
            </div>

            {/* Horological Specifications Grid */}
            <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-5 space-y-3 shadow-sm">
              <h3 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300 pb-2 border-b border-slate-100 dark:border-white/5">
                Atelier Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans">
                {product.brand && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                      Manufacture
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">{product.brand}</span>
                  </div>
                )}
                {product.strap_material && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                      Bracelet / Strap
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                      {product.strap_material}
                    </span>
                  </div>
                )}
                {product.size && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                      Case Diameter
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">{product.size} mm</span>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                      Dial Finish
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">{product.color}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                    Crystal Shield
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                    Domed Sapphire (Anti-Reflective)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">
                    Water Resistance
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">100 Metres (10 ATM)</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-sans uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
                Quantity:
              </span>
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#0D121D] border border-slate-200 dark:border-white/10 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-40 shadow-sm"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-40 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-sans font-bold text-xs uppercase tracking-[0.16em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                <span>
                  {isOutOfStock
                    ? "Piece Currently Allocated"
                    : isAdding
                    ? "Adding to Bag..."
                    : "Add to Shopping Bag"}
                </span>
              </button>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-xl bg-white dark:bg-[#0D121D] hover:bg-slate-100 dark:hover:bg-[#131A29] text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-amber-500/30 font-sans font-semibold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Direct Express Checkout</span>
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
              )}
            </div>

            {/* Reassurance Features */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-white/5 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Certified Provenance</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">5-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Insured Armored Transit</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">14-Day Return Privilege</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommendations Carousel */}
      <RecommendProducts id={id} />

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
};

export default ProductViewPage;
