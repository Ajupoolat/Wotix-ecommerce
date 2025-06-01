import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addproduct } from "@/api/admin/productmgt/productmgt";
import { getcategories } from "@/api/admin/categorymgt/categorymgt";
import ProductForm from "../reuse/productlist/productform";
import LoadingSpinner from "../adminCommon/loadingSpinner";
import AdminSidebar from "../reuse/sidebar/sidebar";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getcategories,
  });

  const { mutate: addProductMutation, isPending: isAdding } = useMutation({
    mutationFn: addproduct,
    onSuccess: () => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries(["products"]);
      navigate("/admin/productlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add product");
    },
  });

  const handleSubmit = ({ formData }) => {
    addProductMutation(formData);
  };

  const handleCancel = () => {
    navigate("/admin/productlist");
  };

  if (isCategoriesLoading||isAdding) {
    return <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/productlist" />
        <LoadingSpinner/>
      </div>
  }

  return (
    <ProductForm
      mode="add"
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isAdding}
    />
  );
};

export default AddProduct;
