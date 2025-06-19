import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import watchImage from "../../../../assets/tissot image 1.png";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { details } from "@/api/users/shop/shopmgt";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import WebSocketListener from "@/Sockets/webSocketListner";
import { useAuth } from "@/context/authuser";
import { useCart } from "@/context/cartcon";
import toast from "react-hot-toast";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";
import { Footer } from "@/components/common/footer";
import LoaderSpinner from "@/components/common/spinner";
import NotAvailable from "@/components/common/notAvailable";
import RecommendProducts from "@/components/common/recommandations";
import { useWishlist } from "@/context/wishlistContext";
import Breadcrumbs from "@/components/common/breadCrums";

const ProductViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isProductInWishlists, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productDetails", id],
    queryFn: () => details(id),
  });

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      const wasInWishlist = isProductInWishlists(product._id);

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
        toast.success("Added to cart and removed from wishlist!");
      } else {
        toast.success("Added to cart!");
      }
    } catch (error) {
      throw error;
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

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError || !product) {
    return <NotAvailable />;
  }

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}
      {/* user-controls */}
      <IconsArea />
      {/* nav bar */}
      <Navbar />

      {/* breadCrumps */}
      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "shop", link: "/shop" },
          { label: product?.name },
        ]}
      />

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
                  wheel={{ step: 0.1 }} 
                  pinch={{ step: 0.1 }} 
                >
                  <TransformComponent
                    wrapperStyle={{
                      width: "400px",
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow:'hidden'
                    }}
                  >
                    <img
                      src={product.images?.[currentImageIndex] || watchImage}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </TransformComponent>
                </TransformWrapper>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md z-10"
                >
                  {isProductInWishlists(product._id) ? (
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
            <div className="flex items-center mb-2"></div>

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
      <RecommendProducts id={id} />
      <Footer />
    </div>
  );
};

export default ProductViewPage;
