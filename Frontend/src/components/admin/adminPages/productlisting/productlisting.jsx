import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeftStartOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  EyeSlashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import NotificationsAdmin from "../../adminCommon/notificationAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getproductdetails,
  deleteproduct,
  handleHide,
} from "@/api/admin/productmgt/productmgt";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import CommonError from "../../adminCommon/error";

const Productlist = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productToHide, setProductToHide] = useState(null);
  const [debouncedSearchQuery,setDebouncedSearchQuery] = useState(searchQuery)
  const productsPerPage = 5;


  useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 500); // 500ms delay

  return () => clearTimeout(handler);
}, [searchQuery]);

  // Fetch products with pagination and search
  const {
    data: productData = {
      products: [],
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
    },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", currentPage, debouncedSearchQuery],
    queryFn: () =>
      getproductdetails({
        page: currentPage,
        limit: productsPerPage,
        search: debouncedSearchQuery,
      }),
    keepPreviousData: true, // Retain previous data while fetching new page
  });

  // Mutation for deleting product
  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteproduct,
    onMutate: (productId) => {
      setDeletingProductId(productId);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["products"]);
      setDeletingProductId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product");
      setDeletingProductId(null);
    },
  });

  // Mutation for hiding product
  const { mutate: hideProductMutation, isPending: isHiding } = useMutation({
    mutationFn: handleHide,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["products"]);
      setProductToHide(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to toggle product visibility");
    },
  });

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { products, totalProducts, totalPages } = productData;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/productlist/editproduct/${productId}`);
  };

  const handleHideProduct = (productId, isCurrentlyHidden) => {
    hideProductMutation({
      productId,
      isHidden: !isCurrentlyHidden,
    });
  };

  const handleDeleteProduct = (productId) => {
    deleteMutation(productId);
  };

  const handleClearSearch = () => {
    setSearchQuery('')
  };

  // Generate pagination buttons dynamically
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin-dashboard" />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <CommonError
        Route={"/admin/productlist"}
        m1={"error to load product data"}
        m2={"Error loading product data"}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* side-bar */}
      <AdminSidebar activeRoute="/admin/productlist" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-20"
            />
            {searchQuery && (
              <div className="absolute right-4 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="p-1"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
              <NotificationsAdmin/>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-gray-800">Admin</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Product List</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => navigate("/admin/productlist/addproduct")}
            >
              + Add Products
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <p>Loading products...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-4 text-red-600">
              <p>Error fetching products: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow
                        key={product._id}
                        className={
                          product.isHidden ? "opacity-60 bg-gray-50" : ""
                        }
                      >
                        <TableCell>
                          <img
                            src={
                              product.images && product.images.length > 0
                                ? product.images[0]
                                : "https://via.placeholder.com/50"
                            }
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {product.categoryRef?.categoryName || "N/A"}
                        </TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditProduct(product._id)}
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                                onClick={() => setProductToHide(product)}
                                disabled={isHiding}
                              >
                                {product.isHidden ? (
                                  <>
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    Unhide
                                  </>
                                ) : (
                                  <>
                                    <EyeSlashIcon className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {productToHide?.isHidden
                                    ? "Unhide this product?"
                                    : "Hide this product?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {productToHide?.isHidden
                                    ? "This product will become visible in the shop."
                                    : "This product will be hidden from the shop."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setProductToHide(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleHideProduct(
                                      productToHide?._id,
                                      productToHide?.isHidden
                                    );
                                  }}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                disabled={deletingProductId === product._id}
                              >
                                {deletingProductId === product._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the product {product.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !error && totalProducts > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * productsPerPage + 1}-
                {Math.min(currentPage * productsPerPage, totalProducts)} of{" "}
                {totalProducts}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                {getPaginationButtons()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Productlist;
