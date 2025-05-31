import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
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
import Breadcrumbs from "@/components/common/breadCrums";

const ShopPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const { isProductInWishlists, toggleWishlist } = useWishlist();

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

  const applyfilters = () => {
    setAppliedFilters(filterValues);
    setCurrentPage(1);
  };

  // Search mutation
  const {
    mutate: searchMutation,
    data: searchedProducts,
    isPending: isSearching,
  } = useMutation({
    mutationFn: (query) => Searching({ query, page: currentPage, limit: 12 }),
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

  console.log("the products in the shop page :", products);

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

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">SHOP</h2>
          <Button
            onClick={toggleFilters}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
          >
            {showFilters ? (
              <>
                <ChevronLeftIcon className="w-4 h-4" />
                Hide Filters
              </>
            ) : (
              <>
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Show Filters
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {showFilters && (
            <div className="w-full lg:w-1/4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">FILTERS</h3>
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <select
                  onChange={handleFilterChange}
                  value={filterValues.category}
                  name="category"
                  className="w-full border p-2"
                >
                  <option value="">All</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="border p-2 w-20"
                    onChange={handleFilterChange}
                    value={filterValues.minPrice}
                    name="minPrice"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="border p-2 w-20"
                    onChange={handleFilterChange}
                    value={filterValues.maxPrice}
                    name="maxPrice"
                  />
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Strap Material</h4>
                <select
                  onChange={handleFilterChange}
                  value={filterValues.strapMaterial}
                  name="strapMaterial"
                  className="w-full border p-2"
                >
                  <option value="">All</option>
                  {strapMaterials.map((material, index) => (
                    <option key={index} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Sort By</h4>
                <select
                  onChange={handleFilterChange}
                  value={filterValues.sortBy}
                  name="sortBy"
                  className="w-full border p-2"
                >
                  <option value="">Default</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="aToZ">A to Z</option>
                  <option value="zToA">Z to A</option>
                </select>
              </div>
              <Button
                onClick={applyfilters}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Apply Filters
              </Button>
            </div>
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
                    <div
                      key={product._id}
                      className="product-card bg-white rounded-lg overflow-hidden flex flex-col relative h-full border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="product-image-container relative pt-4 px-4 flex justify-center bg-gray-100">
                        {product.offer && (
                          <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded z-10">
                            {product.offer.title} {product.offer.discountValue}%
                            Off
                          </span>
                        )}
                        <img
                          src={product.images[0]}
                          alt={product.name || "Product"}
                          className={`product-image w-full object-contain ${
                            showFilters
                              ? "h-48 md:h-56"
                              : "h-56 md:h-64 lg:h-72"
                          }`}
                          onClick={() =>
                            navigate(`/shop/product-view/${product._id}`)
                          }
                        />

                        {/* Product actions that appear on hover */}
                        <div className="product-actions absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center gap-4 opacity-0 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                          >
                            <HeartIcon
                              className={`w-5 h-5 ${
                                isProductInWishlists(product._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-700"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.stock < 1 || product.isHidden}
                          >
                            <ShoppingCartIcon className="w-5 h-5 text-gray-700" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3
                          className="text-lg font-medium text-gray-900 text-center hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/shop/product-view/${product._id}`)
                          }
                        >
                          {product.name || "Unnamed Product"}
                        </h3>

                        <div className="text-center mt-2 mb-3">
                          {product.discountedPrice < product.originalPrice ? (
                            <div className="flex justify-center gap-2 items-baseline">
                              <p className="text-gray-500 line-through font-medium text-sm">
                                ₹{product.originalPrice.toLocaleString("en-IN")}
                              </p>
                              <p className="text-green-600 font-bold text-lg">
                                ₹
                                {product.discountedPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-800 font-bold text-lg">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>

                        {/* Stock status */}
                        {product.stock < 1 ? (
                          <p className="text-center text-red-500 text-sm font-medium">
                            Out of Stock
                          </p>
                        ) : product.stock < 10 ? (
                          <p className="text-center text-orange-500 text-sm font-medium">
                            Only {product.stock} left!
                          </p>
                        ) : (
                          <p className="text-center text-green-500 text-sm font-medium">
                            In Stock
                          </p>
                        )}

                        {/* Quick add to cart button (visible on mobile) */}
                        <div className="mt-3 sm:hidden">
                          <Button
                            className="w-full bg-black text-white hover:bg-gray-800 text-sm py-2"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock < 1 || product.isHidden}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
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
