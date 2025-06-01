import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { editproduct, allproducts } from "@/api/admin/productmgt/productmgt";
import { getcategories } from "@/api/admin/categorymgt/categorymgt";
import LoadingSpinner from "../adminCommon/loadingSpinner";
import AdminSidebar from "../reuse/sidebar/sidebar";
import ProductForm from "../reuse/productlist/productform";
import toast from "react-hot-toast";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getcategories,
  });

  const {
    data: products,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: allproducts,
  });

  const { mutate: editProductMutation, isPending: isEditing } = useMutation({
    mutationFn: ({ productId, formData }) =>
      editproduct({ productId, formData }),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["products"]);
      navigate("/admin/productlist");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  const productToEdit = products?.find((product) => product._id === id);

  const handleSubmit = ({ productId, formData }) => {
    editProductMutation({ productId, formData });
  };

  const handleCancel = () => {
    navigate("/admin/productlist");
  };

  if (isProductLoading || isCategoriesLoading ||isEditing) {
    return <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/offers" />
        <LoadingSpinner/>
      </div>
  }

  if (productError) {
    return (
      <div className="text-center p-6 text-red-600">
        Error: {productError.message}
      </div>
    );
  }

  if (!productToEdit) {
    return (
      <div className="text-center p-6 text-red-600">Product not found</div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      productId={id}
      initialData={productToEdit}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isEditing}
    />
  );
};

export default EditProduct;
