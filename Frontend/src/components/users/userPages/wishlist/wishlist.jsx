import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import logo from "../../../../assets/Wotix removed-BG.png";
import { useCart } from "@/context/cartcon";
import { useState } from "react";
import { useAuth } from "@/context/authuser";
import { useNavigate } from "react-router-dom";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/api/users/shop/wishlistmgt";
import Restricter from "@/components/common/restricter";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { addToCart, totalItems } = useCart();
  const username = localStorage.getItem("username");
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem('email')
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Fetch wishlist data
  const {
    data: wishlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist", userId,email],
    queryFn: () => getWishlist(userId,email),
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  if (error || !wishlist?.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500">
          {wishlist?.message || error?.message || "Error loading wishlist"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="object-contain"
            style={{ height: "150px", width: "150px" }}
            onClick={() => navigate("/")}
          />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                <UserIcon
                  className="w-4 h-4 text-gray-600"
                  onClick={() => navigate(`/profile/${userId}`)}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {username || localStorage.getItem("googleuser")}
              </span>
            </div>
          )}
          <div className="flex justify-evenly gap-4">
            {isAuthenticated ? (
              <ArrowRightStartOnRectangleIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setShowLogoutAlert(true)}
              />
            ) : (
              <UserIcon
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => navigate("/signup")}
              />
            )}
            <div className="relative">
              <ShoppingCartIcon
                className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                onClick={() => navigate("/cart")}
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <HeartIcon
              className="w-5 h-5 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
              onClick={() => navigate("/wishlist")}
            />
          </div>
        </div>
      </header>

      <nav className="flex justify-center space-x-8 py-4 border-b bg-gray-50">
        <a
          href="/"
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors"
        >
          HOME
        </a>
        <a
          onClick={() => navigate("/shop")}
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors cursor-pointer"
        >
          SHOP
        </a>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Wishlist</h1>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              Please sign in to view your wishlist
            </h3>
            <Button className="mt-4" onClick={() => navigate("/signup")}>
              Sign In
            </Button>
          </div>
        ) : wishlist.products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              Your wishlist is empty
            </h3>
            <Button className="mt-4" onClick={() => navigate("/shop")}>
              Browse Products
            </Button>
          </div>
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
}

export default WishlistPage;
