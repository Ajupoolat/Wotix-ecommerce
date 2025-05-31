import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/cartcon";
import { useAuth } from "@/context/authuser";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist, getWishlist } from "@/api/users/shop/wishlistmgt";
import { Footer } from "@/components/common/footer";
import ErrorCommon from "@/components/common/CommonError";
import LoaderSpinner from "@/components/common/spinner";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import BrowseProduct from "@/components/common/browseProduct";
import PleaseLogin from "@/components/common/pleaseLogin";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");

  // Fetch wishlist data
  const {
    data: wishlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist", userId, email],
    queryFn: () => getWishlist(userId, email),
    enabled: !!userId && isAuthenticated,
  });

  // Remove from wishlist mutation
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

  // Add to cart function
  const handleAddToCart = async (product) => {
    try {
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

      await removeFromWishlistMutation(product._id);
      toast.success("Added to cart and removed from wishlist!");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (error) {
    return <ErrorCommon />;
  }

  return (
    <div className="min-h-screen bg-white">
      <IconsArea />

      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Wishlist</h1>
        </div>

        {!isAuthenticated ? (
          <PleaseLogin message={"Please sign in to view your wishlist"} />
        ) : wishlist.products.length === 0 ? (
          <BrowseProduct message={"Your wishlist is empty"} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.products.map((product) => (
              <Card
                key={product._id}
                className="hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/shop/product-view/${product._id}`)}
              >
                <CardHeader className="relative">
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlistMutation(product._id);
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                  <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    {product.offer && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.offer.title} {product.offer.discountValue}% OFF
                      </span>
                    )}
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">Product Image</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="text-lg font-semibold">
                    {product.name || "Unnamed Product"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.brand || "No Brand"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added on: {new Date(product.addedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    {product.stock > 0 ? (
                      <Badge variant="success" className="text-xs bg-green-400">
                        In stock
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="text-xs bg-red-500"
                      >
                        Out of stock
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    {product.discountedPrice < product.originalPrice ? (
                      <>
                        <p className="text-xl font-bold text-green-600">
                          ₹{product.discountedPrice.toLocaleString("en-IN")}/-
                        </p>
                        <p className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.originalPrice.toLocaleString("en-IN")}/-
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold">
                        ₹{product.originalPrice.toLocaleString("en-IN")}/-
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {product.stock > 0 ? (
                    <Button
                      className="w-full bg-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCartIcon className="mr-2 h-4 w-4" />
                      Add To Cart
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      <ShoppingCartIcon className="mr-2 h-4 w-4" />
                      Add To Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default WishlistPage;
