import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
const ProductCard = ({
  product,
  isProductInWishlists,
  toggleWishlist,
  handleAddToCart,
  showFilters,
  index,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="product-card bg-white rounded-lg overflow-hidden flex flex-col relative h-full border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeInUp"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image-container relative pt-4 px-4 flex justify-center bg-gray-100">
        {product.offer && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded z-10">
            {product.offer.title} {product.offer.discountValue}% Off
          </span>
        )}
        <img
          src={product.images[0]}
          alt={product.name || "Product"}
          className={`product-image w-full object-contain ${
            showFilters ? "h-48 md:h-56" : "h-56 md:h-64 lg:h-72"
          }`}
          onClick={() => navigate(`/shop/product-view/${product._id}`)}
        />
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
          onClick={() => navigate(`/shop/product-view/${product._id}`)}
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
                ₹{product.discountedPrice.toLocaleString("en-IN")}
              </p>
            </div>
          ) : (
            <p className="text-gray-800 font-bold text-lg">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </p>
          )}
        </div>
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
  );
};

export default ProductCard;
