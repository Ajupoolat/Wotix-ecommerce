import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "../../../../assets/Wotix removed-BG.png";
import {
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import watchImage from "../../../../assets/tissot image 1.png";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { details, recommandation } from "@/api/users/shop/shopmgt";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/api/users/shop/wishlistmgt";
// import ReactImageMagnify from "react-image-magnify";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import WebSocketListener from "@/Sockets/webSocketListner";
import { useAuth } from "@/context/authuser";
import { useCart } from "@/context/cartcon";
import toast from "react-hot-toast";
import { useWishlistCount } from "@/context/wishlistCount";

const ProductViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart, totalItems } = useCart();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const { countwislist } = useWishlistCount();
  const { isAuthenticated, logout } = useAuth();
  const username = localStorage.getItem("username");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Wishlist Query
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
  });

  // Fetch product details
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productDetails", id],
    queryFn: () => details(id),
  });

  // Fetch recommendations
  const { data: recommendations, isLoading: isRecLoading } = useQuery({
    queryKey: ["productRecommendations", id],
    queryFn: () => recommandation(id),
    enabled: !!id,
  });

  // Add to Wishlist Mutation
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: (productId) => addToWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist", userId]);
      toast.success("Added to wishlist!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to wishlist");
    },
  });

  // Remove from Wishlist Mutation
  const { mutate: removeFromWishlistMutation } = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist", userId]);
      toast.success("Removed from wishlist!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const isProductInWishlist = (productId) => {
    return (
      wishlistData?.products?.some((item) => item._id === productId) || false
    );
  };

  // Toggle wishlist status
  const handleWishlistToggle = (productId) => {
    if (isProductInWishlist(productId)) {
      removeFromWishlistMutation(productId);
    } else {
      addToWishlistMutation(productId);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      const wasInWishlist = isProductInWishlist(product._id);

      await addToCart({
        productId: product._id,
        quantity,
        originalPrice: product.originalPrice,
        price: product.discountedPrice,
        ...(product.offer && {
          offerId: product.offer._id,
          offerName: product.offer.title,
        }),
      });

      if (wasInWishlist) {
        await removeFromWishlistMutation(product._id);
        toast.success("Added to cart and removed from wishlist!");
      } else {
        toast.success("Added to cart!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handlePrevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  const handleNextImage = () =>
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  // Render star ratings
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarSolid key={i} className="w-4 h-4 text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-500" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading product details
      </div>
    );
  }

  const RecommendedProducts = () => {
    if (isRecLoading) return <div>Loading recommendations...</div>;
    if (!recommendations || recommendations.length === 0) return null;

    return (
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendations.slice(0, 3).map((item) => (
            <div
              key={item._id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/shop/product-view/${item._id}`)}
            >
              <div className="relative bg-gray-100 h-48 p-4">
                {item.offer && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {item.offer.title} {item.offer.discountValue}% OFF
                  </span>
                )}
                <img
                  src={item.images?.[0] || watchImage}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(item._id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md z-10"
                >
                  {isProductInWishlist(item._id) ? (
                    <HeartSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                <div className="flex items-center mb-2">
                  {renderStars(item.rating)}
                </div>
                <div className="flex items-center">
                  {item.discountedPrice < item.originalPrice ? (
                    <>
                      <p className="text-lg font-semibold">
                        ₹{item.discountedPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-500 line-through ml-2">
                        ₹{item.originalPrice.toLocaleString("en-IN")}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-semibold">
                      ₹{item.originalPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}

      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: "200px", width: "200px" }}
          />
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
                {username}
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
                onClick={() => navigate("/signup")}
              />
            )}
            <div className="relative">
              <ShoppingCartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={() => navigate("/cart")}
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
                onClick={() => navigate("/wishlist")}
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

      <nav className="flex justify-center space-x-4 sm:space-x-8 py-4 border-b">
        <a
          className="text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
          onClick={() => navigate("/")}
        >
          HOME
        </a>
        <a
          className="text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
          onClick={() => navigate("/shop")}
        >
          SHOP
        </a>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <a
            onClick={() => navigate("/")}
            className="hover:text-gray-700 cursor-pointer"
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <a
            onClick={() => navigate("/shop")}
            className="hover:text-gray-700 cursor-pointer"
          >
            Shop
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="relative mb-4 flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
              <div className="relative w-full h-full flex items-center justify-center">
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <span className="text-white text-xl font-bold">
                      SOLD OUT
                    </span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 10 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    ONLY {product.stock} LEFT
                  </div>
                )}
                {product.offer && (
                  <div className="absolute top-3 left-124 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {product.offer.title} {product.offer.discountValue}% OFF
                  </div>
                )}

                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={3}
                  wheel={{ disabled: true }} // Disable zoom on scroll
                  pinch={{ disabled: true }} // Disable pinch zoom for desktop-like behavior
                >
                  <TransformComponent
                    wrapperStyle={{
                      width: "400px",
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={product.images?.[currentImageIndex] || watchImage}
                      alt={product.name}
                      className="object-contain max-w-full max-h-full"
                    />
                  </TransformComponent>
                </TransformWrapper>
                <button
                  onClick={() => handleWishlistToggle(product._id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md z-10"
                >
                  {isProductInWishlist(product._id) ? (
                    <HeartSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-500" />
                  )}
                </button>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md z-10"
                  onClick={handlePrevImage}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md z-10"
                  onClick={handleNextImage}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {product.images?.map((image, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 border-2 rounded cursor-pointer ${
                    currentImageIndex === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <div className="flex mr-2">{renderStars(product.rating)}</div>
              <span className="text-sm text-gray-500">(reviews)</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            <div className="mb-4">
              {product.discountedPrice < product.originalPrice ? (
                <div className="flex items-center">
                  <p className="text-xl font-semibold text-gray-900 mr-2">
                    ₹{product.discountedPrice.toLocaleString("en-IN")}/-
                  </p>
                  <p className="text-lg text-gray-500 line-through mr-2">
                    ₹{product.originalPrice.toLocaleString("en-IN")}/-
                  </p>
                  {product.offer && (
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-0.5 rounded">
                      {product.offer.discountValue}% OFF
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-900">
                  ₹{product.originalPrice.toLocaleString("en-IN")}/-
                </p>
              )}
            </div>

            <div className="mb-4">
              {product.stock === 0 ? (
                <p className="text-red-500 font-medium">Out of Stock</p>
              ) : product.stock < 10 ? (
                <p className="text-orange-500 font-medium">
                  Only {product.stock} left in stock
                </p>
              ) : (
                <p className="text-green-500 font-medium">In Stock</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <ul className="space-y-2">
                {product.brand && (
                  <li className="flex">
                    <span className="text-gray-500 mr-2">• Brand:</span>
                    <span>{product.brand}</span>
                  </li>
                )}
                {product.size && (
                  <li className="flex">
                    <span className="text-gray-500 mr-2">• Size:</span>
                    <span>{product.size} cm</span>
                  </li>
                )}
                {product.strap_material && (
                  <li className="flex">
                    <span className="text-gray-500 mr-2">
                      • Strap Material:
                    </span>
                    <span>{product.strap_material}</span>
                  </li>
                )}
                {product.color && (
                  <li className="flex">
                    <span className="text-gray-500 mr-2">• Color:</span>
                    <span>{product.color}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Quantity</h3>
              <div className="flex items-center border rounded w-32">
                <button
                  className="px-3 py-1 border-r"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(product.stock, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="w-12 text-center py-1 border-none focus:outline-none"
                />
                <button
                  className="px-3 py-1 border-l"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to cart"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <RecommendedProducts />

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                localStorage.removeItem("username");
                navigate("/login");
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <a
                    href="/shop"
                    className="text-sm hover:underline text-gray-300"
                  >
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
            <p>
              © {new Date().getFullYear()} WOTIX WATCHES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductViewPage;
