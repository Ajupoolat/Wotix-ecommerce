


import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import logo from '../../../../assets/Wotix removed-BG.png';
import {
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Searching, getshopproduct, strapdetails ,getfiltercategory} from '@/api/users/shop/shopmgt';
import { useAuth } from '@/context/authuser';
import WebSocketListener from '@/Sockets/webSocketListner';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '@/api/users/shop/wishlistmgt';
import { useCart } from '@/context/cartcon';
import { useWishlistCount } from '@/context/wishlistCount';

const ShopPage = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const username = localStorage.getItem('username');
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  const { countwislist } = useWishlistCount();

  const [strapMaterials, setStrapMaterials] = useState([]);
  const [filterValues, setFilterValues] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    strapMaterial: '',
    sortBy: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    strapMaterial: '',
    sortBy: '',
  });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Fetch strap materials
  useEffect(() => {
    const fetchStrapMaterials = async () => {
      try {
        const materials = await strapdetails();
        setStrapMaterials(materials);
      } catch (error) {
        toast.error('Failed to fetch strap materials');
      }
    };
    fetchStrapMaterials();
  }, []);

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['categoreis'],
    queryFn: getfiltercategory,
  });

  // Fetch wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
  });

  // Fetch products with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'shopProducts',
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

  // Add to Wishlist Mutation
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: (productId) => addToWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist', userId]);
      toast.success('Added to wishlist!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to wishlist');
    },
  });

  // Remove from Wishlist Mutation
  const { mutate: removeFromWishlistMutation } = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist', userId]);
      toast.success('Removed from wishlist!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });

  const isProductInWishlist = (productId) => {
    return wishlistData?.products?.some((item) => item._id === productId) || false;
  };

  // Toggle wishlist status
  const handleWishlistToggle = (productId) => {
    if (isProductInWishlist(productId)) {
      removeFromWishlistMutation(productId);
    } else {
      addToWishlistMutation(productId);
    }
  };

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
    if (searchQuery.trim() === '') {
      return;
    }
    const debounceTimer = setTimeout(() => {
      searchMutation(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, searchMutation]);

  const products = searchQuery.trim() === '' ? data?.products : searchedProducts?.products;
  const pagination = searchQuery.trim() === '' ? data?.pagination : searchedProducts?.pagination;

  const handlesearchclear = () => {
    setSearchQuery('');
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
      const wasInWishlist = isProductInWishlist(product._id);

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
        await removeFromWishlistMutation(product._id);
        toast.success('Added to cart and removed from wishlist!');
      } else {
        toast.success('Added to cart!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: '200px', width: '200px' }}
          />
        </div>
        <div className="flex w-400 justify-center mx-4 sm:mx-8">
          <Input
            type="text"
            placeholder="Search"
            className="w-full max-w-md rounded-full border-gray-300 bg-gray-100 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={handlesearchclear}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon
                  className="w-4 h-4 text-gray-600"
                  onClick={() => navigate(`/profile/${userId}`)}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {username || localStorage.getItem('googleuser')}
              </span>
            </div>
          )}
          <div className="flex justify-evenly gap-4">
            {isAuthenticated ? (
              <ArrowRightStartOnRectangleIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900"
                onClick={() => setShowLogoutAlert(true)}
              />
            ) : (
              <UserIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900"
                onClick={() => navigate('/signup')}
              />
            )}
            <div className="relative">
              <ShoppingCartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={() => navigate('/cart')}
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="relative">
              <HeartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={() => navigate('/wishlist')}
              />
              {countwislist > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {countwislist}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center space-x-4 sm:space-x-8 py-4 border-b">
        <a
          onClick={() => navigate('/')}
          className="text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
        >
          HOME
        </a>
        <a
          href="/shop"
          className="text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
        >
          SHOP
        </a>
      </nav>

      {/* Shop Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        {/* Offer Banner (Optional: Replace with static or new API) */}
        {products?.some((product) => product.offer) && (
          <div className="bg-green-500 text-white text-center py-4 px-6 mb-6 rounded-lg shadow-md">
            <h2 className="text-xl md:text-2xl font-bold">
              Special Offer! Up to{' '}
              {Math.max(...products.filter((p) => p.offer).map((p) => p.offer.discountValue))}% Off
            </h2>
            <p className="text-sm md:text-base mt-2">
              Don't miss out on our limited-time deals! Shop now and save big.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">SHOP</h2>
          <Button
            onClick={toggleFilters}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
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
              <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll need to sign in again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        logout();
                        localStorage.removeItem('username');
                        navigate('/login');
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

          <div className={`w-full ${showFilters ? 'lg:w-3/4' : 'lg:w-full'}`}>
            {isLoading || isSearching ? (
              <div className="text-center py-8">Loading products...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error fetching products: {error.message}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-8">No products available.</div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 ${
                    showFilters
                      ? 'sm:grid-cols-2 lg:grid-cols-3'
                      : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
                  } gap-6`}
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-gray-100 rounded-lg overflow-hidden flex flex-col relative h-full"
                    >
                      <div className="relative pt-4 px-4 flex justify-center">
                        {product.offer && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            {product.offer.title} {product.offer.discountValue}% Off
                          </span>
                        )}
                        <img
                          src={product.images[0]}
                          alt={product.name || 'Product'}
                          className={`w-full object-contain ${
                            showFilters ? 'h-48 md:h-56' : 'h-56 md:h-64 lg:h-72'
                          }`}
                          onClick={() => navigate(`/shop/product-view/${product._id}`)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 p-1"
                          onClick={() => handleWishlistToggle(product._id)}
                        >
                          <HeartIcon
                            className={`w-6 h-6 ${
                              isProductInWishlist(product._id)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-500'
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 text-center">
                          {product.name || 'Unnamed Product'}
                        </h3>
                        <div className="text-center mt-2">
                          {product.discountedPrice < product.originalPrice ? (
                            <div className="flex justify-center gap-2">
                              <p className="text-gray-500 line-through font-semibold">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </p>
                              <p className="text-green-600 font-semibold">
                                ₹{product.discountedPrice.toLocaleString('en-IN')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-600 font-semibold">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-center mt-3">
                          <Button
                            className="bg-black text-white hover:bg-gray-800 text-sm"
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

                {pagination && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <Button
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${
                            pagination.currentPage === page
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">WOTIX WATCHES</h3>
              <p className="text-gray-400 text-sm">
                Luxury timepieces crafted with precision and elegance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/shop" className="text-sm hover:underline text-gray-300">
                    Shop Collection
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">STAY CONNECTED</h3>
              <p className="text-gray-400 text-sm mb-4">
                Follow us on social media for the latest updates.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-gray-300">
                  FB
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  IG
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  TW
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} WOTIX WATCHES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;
