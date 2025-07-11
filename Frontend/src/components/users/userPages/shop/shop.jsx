import React, { useEffect, useState } from "react";
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
import NotAvailable from "@/components/common/notAvailable";
import Pagination from "@/components/common/pagination";
import { useWishlist } from "@/context/wishlistContext";
import SpecialOfferBanner from "@/components/common/SpeacialOfferBanner";
import SearchBar from "@/components/common/searchBar";
import FilterButton from "./shopComponents/filter/filterButton";
import Breadcrumbs from "@/components/common/breadCrums";
import FilterBox from "./shopComponents/filter/filterBox";
import ProductCard from "./shopComponents/list/shopCarts";

const ShopPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const { isProductInWishlists, toggleWishlist } = useWishlist();
  const limit = 12;

  const [strapMaterials, setStrapMaterials] = useState([]);
  const [filterValues, setFilterValues] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    strapMaterial: "",
    sortBy: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    strapMaterial: "",
    sortBy: "",
  });

  // Fetch strap materials
  useEffect(() => {
    const fetchStrapMaterials = async () => {
      try {
        const materials = await strapdetails();
        setStrapMaterials(materials);
      } catch (error) {
        toast.error("Failed to fetch strap materials");
      }
    };
    fetchStrapMaterials();
  }, []);

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["categoreis"],
    queryFn: getfiltercategory,
  });

  // Fetch products with pagination
  const { data, isLoading, error } = useQuery({
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
        limit: 12,
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
  };
  // Search mutation
  const {
    mutate: searchMutation,
    data: searchedProducts,
    isPending: isSearching,
  } = useMutation({
    mutationFn: (query) => Searching({ query, page: currentPage, limit: limit }),
    onSuccess: () => {},
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() === "") {
      return;
    }
    const debounceTimer = setTimeout(() => {
      searchMutation(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, searchMutation]);

  const products =
    searchQuery.trim() === "" ? data?.products : searchedProducts?.products;
  const pagination =
    searchQuery.trim() === "" ? data?.pagination : searchedProducts?.pagination;

  const handlesearchclear = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    setAppliedFilters(filterValues);
    setCurrentPage(1);
  };

  const handleAddToCart = async (product) => {
    try {
      const wasInWishlist = isProductInWishlists(product._id);

      // Use backend-provided discountedPrice and offer
      await addToCart({
        productId: product._id,
        quantity: 1,
        originalPrice: product.originalPrice,
        price: product.discountedPrice,
        ...(product.offer && {
          offerId: product.offer._id,
          offerName: product.offer.title,
        }),
      });

      if (wasInWishlist) {
        toast.success("Added to cart and removed from wishlist!");
      } else {
        toast.success("Added to cart!");
      }
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}

      {/* Header */}
      <IconsArea />

      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 ">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handlesearchclear}
          placeholder="Search for products.."
        />
      </header>

      {/* Navigation */}
      <div>
        <Navbar />
      </div>

      <Breadcrumbs items={[{ label: "Home", link: "/" }, { label: "shop" }]} />

      {/* Shop Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <SpecialOfferBanner products={products} />
        {/* heading and filter button */}

        <FilterButton showFilters={showFilters} toggleFilters={toggleFilters} />

        <div className="flex flex-col lg:flex-row gap-6">
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
          <div className={`w-full ${showFilters ? "lg:w-3/4" : "lg:w-full"}`}>
            {isLoading || isSearching ? (
              <SmallSpinner />
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error fetching products: {error.message}
              </div>
            ) : !products || products.length === 0 ? (
              <NotAvailable />
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 ${
                    showFilters
                      ? "sm:grid-cols-2 lg:grid-cols-3"
                      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
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
                {/* paginations */}
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
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopPage;
