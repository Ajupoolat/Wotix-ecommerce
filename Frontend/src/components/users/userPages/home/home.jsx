import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authuser";
import WebSocketListener from "@/Sockets/webSocketListner";
import LoaderSpinner from "@/components/common/spinner";
import SpecialOfferBanner from "@/components/common/SpeacialOfferBanner";
import { getshopproduct } from "@/api/users/shop/shopmgt";
import { Footer } from "@/components/common/footer";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass,
  Award,
  Layers,
  ChevronRight,
  Eye,
  ShoppingBag,
} from "lucide-react";

// Asset imports
import heroWatch from "@/assets/Banner2.jpg";
import banner2 from "@/assets/bannerforhome.jpg";
import watchPlaceholder from "@/assets/watch image.jpg";
import tissot1 from "@/assets/tissot image 1.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch real featured products for home showcase (page 1, limit 8)
  const { data: pro, isLoading: productsLoading } = useQuery({
    queryKey: ["homeFeaturedProducts"],
    queryFn: () =>
      getshopproduct({
        page: 1,
        limit: 8,
        category: "",
        minPrice: "",
        maxPrice: "",
        strapMeterial: "",
        sortBy: "",
      }),
  });

  const featuredProducts = pro?.products || [];

  if (authLoading) {
    return <LoaderSpinner />;
  }

  const collections = [
    {
      title: "The Chronograph Series",
      category: "Chronograph",
      desc: "Dual-register precision timing with tachymeter ceramic bezel.",
      tag: "Sport & Speed",
    },
    {
      title: "Automatic Calibres",
      category: "Automatic",
      desc: "Self-winding mechanical movements with 72-hour power reserves.",
      tag: "Pure Horology",
    },
    {
      title: "The Dress Minimalists",
      category: "Dress",
      desc: "Ultra-slim 8mm profiles, sapphire crystal, and alligator-grained leather.",
      tag: "Evening Elegance",
    },
    {
      title: "Complications & Diver",
      category: "Sports",
      desc: "300m water resistance, helium escape valve, Super-LumiNova markers.",
      tag: "Deep Precision",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      {isAuthenticated && <WebSocketListener />}

      {/* Top Reassurance & Main Header */}
      <IconsArea />

      {/* Category Sub-Navigation */}
      <Navbar />

      {/* Hero Section - Inspired by Eterna / Luxury Horology */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 border-b border-slate-200/80 dark:border-amber-500/10">
        {/* Ambient Gold Radial Glows */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.03] border border-amber-600/30 dark:border-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-sans tracking-[0.2em] uppercase shadow-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Haute Horlogerie • Edition 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Precision Crafted. <br />
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
                  Timeless by Design.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300/80 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                Discover mastercrafted complications engineered for connoisseurs. Every timepiece
                is certified with serialized provenance, Swiss-level calibration, and an
                uncompromising five-year international warranty.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate("/shop")}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-sans font-bold text-xs uppercase tracking-[0.16em] shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Timepieces</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                <button
                  onClick={() => navigate("/shop?offers=true")}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-[#0D121D]/80 hover:bg-slate-100 dark:hover:bg-[#131A29] text-amber-700 dark:text-amber-300/90 hover:text-amber-800 dark:hover:text-amber-200 border border-slate-200 dark:border-amber-500/25 font-sans font-semibold text-xs uppercase tracking-[0.16em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-sm"
                >
                  <span>Vault Allocations</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Reassurance Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-white/5 max-w-lg mx-auto lg:mx-0">
                <div className="space-y-1">
                  <div className="font-sans text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-300">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans font-medium">
                    Certified Authentic
                  </div>
                </div>
                <div className="space-y-1 border-x border-slate-200 dark:border-white/5 px-2">
                  <div className="font-sans text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-300">
                    5-Year
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans font-medium">
                    Global Warranty
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-sans text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-300">
                    48-Hr
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans font-medium">
                    Armored Transit
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Frame */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-amber-500/30 via-slate-200 dark:via-white/5 to-amber-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
                <div className="w-full h-full rounded-[22px] overflow-hidden relative bg-slate-100 dark:bg-[#090D14]">
                  <img
                    src={heroWatch}
                    alt="Mastercrafted Wotix Luxury Watch"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gradient overlays for cinematic depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#070A0F] via-transparent to-black/20" />

                  {/* Floating Luxury Spec Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 dark:bg-[#0B0F17]/90 backdrop-blur-md border border-slate-200 dark:border-amber-500/20 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-sans text-amber-600 dark:text-amber-400 tracking-widest block font-semibold">
                          Flagship Calibre
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading">
                          WOTIX Grand Chronograph
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-semibold">
                        Automatic
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Vault Section (If available in backend) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <SpecialOfferBanner products={featuredProducts} />
      </div>

      {/* Horology Complications / Categories Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <span className="text-xs uppercase font-sans tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-1 font-semibold">
              Curated Divisions
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-wide">
              Horological Complications
            </h2>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-xs font-sans uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer font-semibold"
          >
            <span>View Full Vault Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/shop?category=${col.category}`)}
              className="group relative rounded-2xl bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/5 hover:border-amber-500/40 p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400/90 bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mb-4 font-medium">
                  {col.tag}
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors mb-2">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {col.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400/80 group-hover:text-amber-800 dark:group-hover:text-amber-300 font-sans tracking-wider font-semibold">
                <span>Explore Series</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Masterpieces Showcase (Live from Database) */}
      <section className="py-16 bg-slate-100/70 dark:bg-[#090D15] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200 dark:border-white/5 gap-4">
            <div>
              <span className="text-xs uppercase font-sans tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-1 font-semibold">
                Hand-Selected Horology
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-wide">
                Featured Timepieces
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="text-xs font-sans uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer font-semibold"
            >
              <span>See All ({featuredProducts.length || "12+"} Models)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 p-4 h-96 animate-pulse"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => {
                const imageUrl = product.images?.[0] || watchPlaceholder;
                const hasOffer = product.offer && product.offer.discountValue > 0;
                const finalPrice = product.finalPrice || product.price;

                return (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/shop/product-view/${product._id}`)}
                    className="group relative rounded-2xl bg-white dark:bg-[#0B0F18] border border-slate-200/90 dark:border-white/5 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden flex flex-col justify-between"
                  >
                    {/* Image Area with luxury spotlight */}
                    <div className="relative aspect-square w-full bg-slate-50 dark:bg-[#080B11] p-6 flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain transform group-hover:scale-108 transition-transform duration-500 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
                        onError={(e) => {
                          e.target.src = watchPlaceholder;
                        }}
                      />

                      {/* Privilege / Discount Chip */}
                      {hasOffer && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow">
                          {product.offer.discountValue}% Off
                        </div>
                      )}

                      {/* Hover Quick Action */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <span className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mb-1">
                          <span>{product.category?.name || "Luxury Watch"}</span>
                          {product.stock <= 5 && product.stock > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">Only {product.stock} Left</span>
                          )}
                        </div>
                        <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* Pricing */}
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                        <div className="space-x-2">
                          <span className="font-sans text-lg font-bold text-amber-700 dark:text-amber-300">
                            ₹{Number(finalPrice).toLocaleString("en-IN")}
                          </span>
                          {hasOffer && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{Number(product.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                          Free Insured
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>Explore our complete catalog in the vault boutique.</p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 px-6 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-sans text-xs font-semibold uppercase tracking-wider"
              >
                Go to Shop
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Craftsmanship Narrative / Heritage Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-amber-500/20 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-[#0A0E17] dark:via-[#111724] dark:to-[#0A0E17] p-8 sm:p-12 lg:p-16 shadow-lg dark:shadow-none transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-sans tracking-[0.2em] text-amber-600 dark:text-amber-400 block font-semibold">
                The WOTIX Heritage
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white leading-tight">
                Where Master Horology Meets Modern Artistry.
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300/80 leading-relaxed font-sans">
                Every WOTIX timepiece is born from a reverence for classical watchmaking.
                From laser-calibrated balance wheels to sapphire crystal coated with anti-reflective
                clarity, our atelier marries heritage finishing with aerospace engineering.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                      Sapphire Crystal Shield
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Mohs 9 hardness scratch-resistant domed crystal with anti-glare coating.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                      316L Marine Stainless Steel
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Corrosion-resistant chassis hand-brushed with mirror-polished bevels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate("/shop")}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-lg shadow-amber-500/20"
                >
                  Discover The Collection
                </button>
              </div>
            </div>

            {/* Right Craftsmanship Imagery */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
              <img
                src={banner2}
                alt="Wotix Heritage Timepiece"
                className="w-full h-80 sm:h-96 object-cover object-center filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-[10px] uppercase font-sans text-amber-400 tracking-widest block font-medium">
                    Certified Atelier Assembly
                  </span>
                  <p className="text-xs text-slate-200 mt-1 font-sans">
                    Every piece inspected through 160 hours of pressure and oscillation chronometry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote / Philosophy Bar */}
      <section className="py-14 border-t border-slate-200 dark:border-white/5 bg-slate-100/70 dark:bg-[#080B11] text-center px-4 transition-colors">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="font-heading text-lg sm:text-2xl text-slate-800 dark:text-slate-200 italic tracking-wider">
            "A timepiece does not merely count seconds; it preserves the milestones of your legacy."
          </p>
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 block font-semibold">
            — The WOTIX Horology Guild
          </span>
        </div>
      </section>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
