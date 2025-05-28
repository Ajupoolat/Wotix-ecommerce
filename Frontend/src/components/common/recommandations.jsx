import { recommandation } from "@/api/users/shop/shopmgt";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/wishlistContext";
const RecommendProducts = ({ id }) => {
  const navigate = useNavigate();
  const { isProductInWishlists, toggleWishlist } = useWishlist();

  const { data: recommendations, isLoading: isRecLoading } = useQuery({
    queryKey: ["productRecommendation", id],
    queryFn: () => recommandation(id),
    enabled: !!id,
  });

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 border-t">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

      {isRecLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full bg-gray-200" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-gray-200" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
                <Skeleton className="h-6 w-1/3 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                    toggleWishlist(item._id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md z-10"
                >
                  {isProductInWishlists(item._id) ? (
                    <HeartSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                <div className="flex items-center mb-2"></div>
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
      )}
    </section>
  );
};

export default RecommendProducts;
