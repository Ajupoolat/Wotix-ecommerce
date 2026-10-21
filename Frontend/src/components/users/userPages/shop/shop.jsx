import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Searching,
  getshopproduct,
  strapdetails,
  getfiltercategory,
} from "@/api/users/shop/shopmgt";
import { useAuth } from "@/context/authuser";
import WebSocketListener from "@/Sockets/webSocketListner";
import IconsArea from "@/components/common/IconsArea";
import { Footer } from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import { useCart } from "@/context/cartcon";
import LoaderSpinner from "@/components/common/spinner";
import SmallSpinner from "@/components/common/smallSpinner";
import Pagination from "@/components/common/pagination";
import { useWishlist } from "@/context/wishlistContext";
import SpecialOfferBanner from "@/components/common/SpeacialOfferBanner";
import SearchBar from "@/components/common/searchBar";
import FilterButton from "./shopComponents/filter/filterButton";
import Breadcrumbs from "@/components/common/breadCrums";
import FilterBox from "./shopComponents/filter/filterBox";
import ProductCard from "./shopComponents/list/shopCarts";
import { Compass, RotateCcw } from "lucide-react";

const ShopPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isProductInWishlists, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get("category") || "";
  const urlOffers = searchParams.get("offers") === "true";

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const limit = 12;

  const [strapMaterials, setStrapMaterials] = useState([]);
  const [filterValues, setFilterValues] = useState({
    category: urlCategory,
    minPrice: "",
    maxPrice: "",
    strapMaterial: "",
    sortBy: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: urlCategory,
    minPrice: "",
    maxPrice: "",
    strapMaterial: "",
    sortBy: "",
  });

  // Sync category from URL param if user clicks navigation links
  useEffect(() => {
    if (urlCategory !== appliedFilters.category) {
      setFilterValues((prev) => ({ ...prev, category: urlCategory }));
      setAppliedFilters((prev) => ({ ...prev, category: urlCategory }));
      setCurrentPage(1);
    }
  }, [urlCategory]);

  // Fetch strap materials
  useEffect(() => {
    const fetchStrapMaterials = async () => {
      try {
        const materials = await strapdetails();
        setStrapMaterials(materials || []);
      } catch (error) {
        // Silently fail or log
      }
    };
    fetchStrapMaterials();
  }, []);

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["categoriesList"],
    queryFn: getfiltercategory,
  });

  // Fetch products with pagination & filters
  const {
    data,
    isLoading: isProductsLoading,
    error,
  } = useQuery({
    queryKey: [
      "shopProducts",
      currentPage,
      appliedFilters.category,
      appliedFilters.minPrice,
      appliedFilters.maxPrice,
      appliedFilters.strapMaterial,
      appliedFilters.sortBy,
    ],
    queryFn: () =>
      getshopproduct({
        page: currentPage,
        limit,
        category: appliedFilters.category,
        minPrice: appliedFilters.minPrice,
        maxPrice: appliedFilters.maxPrice,
        strapMaterial: appliedFilters.strapMaterial,
        sortBy: appliedFilters.sortBy,
      }),
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    const initialFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      strapMaterial: "",
      sortBy: "",
    };
    setFilterValues(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
    if (urlCategory) {
      setSearchParams({});
    }
  };

  // Search mutation
  const {
    mutate: searchMutation,
    data: searchedProducts,
    isPending: isSearching,
  } = useMutation({
    mutationFn: (query) => Searching({ query, page: currentPage, limit }),
    onError: (err) => {
      toast.error(err.message || "Search query failed");
    },
  });

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const debounceTimer = setTimeout(() => {
      searchMutation(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, searchMutation]);

  const rawProducts =
    searchQuery.trim() === "" ? data?.products : searchedProducts?.products;

  // If user selected "Vault Offers", filter to products that have an active discount offer
  const products = urlOffers
    ? rawProducts?.filter((p) => p && p.offer && p.offer.discountValue > 0)
    : rawProducts;

  const pagination =
    searchQuery.trim() === "" ? data?.pagination : searchedProducts?.pagination;

  const handleSearchClear = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    setAppliedFilters(filterValues);
    setCurrentPage(1);
  };

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
      // Toast notification is cleanly triggered by cart context
    } catch (error) {
      // Handled in context
    }
  };

  if (authLoading) {
    return <LoaderSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      {isAuthenticated && <WebSocketListener />}

      {/* Main Header */}
      <IconsArea />

      {/* Category Sub-Navigation */}
      <Navbar />

      {/* Breadcrumb Trail */}
      <Breadcrumbs
        items={[
          { label: "Shop Catalog", link: "/shop" },
          ...(appliedFilters.category
            ? [{ label: appliedFilters.category }]
            : []),
          ...(urlOffers ? [{ label: "Vault Special Offers" }] : []),
        ]}
      />

      {/* Search Input Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleSearchClear}
          placeholder="Search by model, complications, reference number..."
        />
      </div>

      {/* Main Shop Catalog Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Special Offer Banner if any offers exist */}
        <SpecialOfferBanner products={rawProducts} />

        {/* Heading & Filter Toggle Bar */}
        <FilterButton
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          totalProducts={pagination?.totalProducts}
        />

        {/* Catalog Layout: Filter Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {showFilters && (
            <FilterBox
              filterValues={filterValues}
              handleFilterChange={handleFilterChange}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
              categories={categories}
              strapMaterials={strapMaterials}
            />
          )}

          <div className="w-full flex-1">
            {isProductsLoading || isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-rose-300 dark:border-rose-500/30 space-y-3 shadow-sm">
                <p className="text-sm text-rose-600 dark:text-rose-400 font-cinzel">
                  Unable to connect to the horology vault: {error.message}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-amber-700 dark:text-amber-300 text-xs font-cinzel uppercase tracking-wider"
                >
                  Retry Vault Query
                </button>
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-20 px-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 space-y-4 shadow-sm">
                <Compass className="w-10 h-10 text-amber-600 dark:text-amber-400/60 mx-auto" />
                <h3 className="text-lg font-cinzel font-bold text-slate-900 dark:text-white tracking-wider">
                  No Timepieces Found
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  No horological references match your active curation criteria. Adjust your filters or reset to view all available allocations.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 ${
                    showFilters
                      ? "sm:grid-cols-2 lg:grid-cols-3"
                      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  } gap-6`}
                >
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      isProductInWishlists={isProductInWishlists}
                      toggleWishlist={toggleWishlist}
                      handleAddToCart={handleAddToCart}
                      showFilters={showFilters}
                      index={index}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Luxury Horology Footer */}
      <Footer />
    </div>
  );
};

export default ShopPage;
