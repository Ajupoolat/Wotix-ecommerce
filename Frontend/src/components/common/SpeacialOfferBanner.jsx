import React from "react";
import { useNavigate } from "react-router-dom";

const validateProps = ({ products }) => {
  if (products && !Array.isArray(products)) {
    throw new Error("SpecialOfferBanner: 'products' prop must be an array");
  }
  if (products?.length) {
    products.forEach((product, index) => {
      if (product.offer) {
        if (typeof product.offer !== "object" || product.offer === null) {
          throw new Error(
            `SpecialOfferBanner: 'products[${index}].offer' must be an object`
          );
        }
        if (typeof product.offer.discountValue !== "number") {
          throw new Error(
            `SpecialOfferBanner: 'products[${index}].offer.discountValue' must be a number`
          );
        }
        if (typeof product.offer.title !== "string") {
          throw new Error(
            `SpecialOfferBanner: 'products[${index}].offer.title' must be a string`
          );
        }
      }
    });
  }
};

const SpecialOfferBanner = ({ products }) => {
  const navigate = useNavigate();

  // Validate props
  validateProps({ products });

  if (!products?.some((product) => product.offer)) {
    return null;
  }

  const maxDiscount = Math.max(
    ...products.filter((p) => p.offer).map((p) => p.offer.discountValue)
  );

  // Handle button click with loading state
  const handleShopNow = () => {
    setTimeout(() => {
      navigate("/shop");
    }, 500); // Simulated delay
  };

  return (
    <div className="relative bg-black text-white text-center py-8 px-4 sm:px-8 mb-8 rounded-xl shadow-lg overflow-hidden mx-2 sm:mx-4 transition-all hover:shadow-xl">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2240%22 height%3D%2240%22 viewBox%3D%220 0 40 40%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath d%3D%22M20 0v20h20V0H20zm0 40V20h20v20H20zM0 20v20h20V20H0zm0-20v20h20V0H0z%22 fill%3D%22%23D1D5DB%22 fill-opacity%3D%220.1%22/%3E%3C/svg%3E')] opacity-10"></div>

      {/* Animated light gold accent */}
      <div className="absolute top-3 left-3 w-5 h-5 bg-[#F3E5AB] rounded-full opacity-40 animate-ping"></div>
      <div className="absolute bottom-3 right-3 w-6 h-6 bg-[#F3E5AB] rounded-full opacity-30 animate-pulse"></div>

      {/* Main content */}
      <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-wide text-white animate-fade-in">
        ✨ FLASH SALE! Up to{" "}
        <span className="text-[#F3E5AB] font-black">{maxDiscount}%</span> OFF ✨
      </h2>
      <p className="relative text-base sm:text-lg font-medium text-gray-300 mb-4 max-w-xl mx-auto">
        Exclusive deals on luxury watches. Don’t miss out!
      </p>

      {/* CTA Button */}
      <button
        onClick={handleShopNow}
        className="relative bg-[#F3E5AB] hover:bg-[#E6D48F] text-black font-bold text-base sm:text-lg py-2.5 px-8 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#F3E5AB]/50"
      >
        SHOP NOW
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 inline-block ml-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Corner badge */}
      <div className="absolute top-0 right-0 bg-[#F3E5AB] text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-bl-lg shadow-sm">
        LIMITED OFFER
      </div>
    </div>
  );
};

export default SpecialOfferBanner;