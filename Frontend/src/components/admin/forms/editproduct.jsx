// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import toast from "react-hot-toast";
// import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
  
//   editproduct,
//   allproducts
// } from "@/api/admin/productmgt/productmgt";
// import "react-image-crop/dist/ReactCrop.css";
// import { getcategories } from "@/api/admin/categorymgt/categorymgt";
// import { X } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// const productSchema = z.object({
//   productName: z
//     .string()
//     .min(1, "Product name is required")
//     .max(100, "Product name must be less than 100 characters")
//     .regex(
//       /^[a-zA-Z0-9\s]+$/,
//       "Product name can only contain letters, numbers, and spaces"
//     )
//     .trim()
//     .regex(/^\S.*\S$/, "Product name cannot have leading or trailing spaces"),
//   productCategory: z.string().min(1, "Product category is required"),
//   productPrice: z
//     .string()
//     .min(1, "Product price is required")
//     .transform((val) => Number(val))
//     .refine((val) => !isNaN(val) && val > 0, {
//       message: "Product price must be a positive number",
//     })
//     .refine((val) => Number(val.toFixed(2)) === val, {
//       message: "Product price must have up to two decimal places",
//     }),
//   productStock: z
//     .string()
//     .min(1, "Product stock is required")
//     .transform((val) => Number(val))
//     .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, {
//       message: "Product stock must be a non-negative integer",
//     }),
//   brand: z
//     .string()
//     .min(1, "Brand is required")
//     .max(50, "Brand must be less than 50 characters")
//     .regex(
//       /^[a-zA-Z0-9\s]+$/,
//       "Brand can only contain letters, numbers, and spaces"
//     )
//     .trim()
//     .regex(/^\S.*\S$/, "Brand cannot have leading or trailing spaces"),
//   size: z
//     .string()
//     .min(1, "Size is required")
//     .transform((val) => Number(val))
//     .refine((val) => !isNaN(val) && val > 0 && val <= 1000, {
//       message: "Size must be a positive number between 0 and 1000",
//     })
//     .refine((val) => Number(val.toFixed(1)) === val, {
//       message: "Size must have up to one decimal place",
//     }),
//   strapMaterial: z
//     .string()
//     .min(1, "Strap material is required")
//     .max(50, "Strap material must be less than 50 characters")
//     .regex(
//       /^[a-zA-Z0-9\s]+$/,
//       "Strap material can only contain letters, numbers, and spaces"
//     )
//     .trim()
//     .regex(/^\S.*\S$/, "Strap material cannot have leading or trailing spaces"),
//   color: z
//     .string()
//     .min(1, "Color is required")
//     .max(30, "Color must be less than 30 characters")
//     .regex(
//       /^[a-zA-Z0-9\s]+$/,
//       "Color can only contain letters, numbers, and spaces"
//     )
//     .trim()
//     .regex(/^\S.*\S$/, "Color cannot have leading or trailing spaces"),
//   productImages: z
//     .array(z.any())
//     .refine((items) => items.length === 3, {
//       message: "Please upload exactly 3 images for the product",
//     })
//     .refine(
//       (items) =>
//         items.every(
//           (item) =>
//             typeof item === "string" ||
//             (item instanceof File &&
//               ["image/jpeg", "image/jpg", "image/png"].includes(item.type) &&
//               item.size <= MAX_FILE_SIZE)
//         ),
//       {
//         message: "Images must be JPG, JPEG, or PNG and less than 5MB",
//       }
//     ),
// });

// const EditProduct = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const queryClient = useQueryClient();

//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [crop, setCrop] = useState(null);
//   const [showCropModal, setShowCropModal] = useState(false);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [currentFile, setCurrentFile] = useState(null);
//   const [editingIndex, setEditingIndex] = useState(null);

//   const imgRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors , isDirty:isEditDirty , isValid:isEditValid},
//     setValue,
//     reset,
//     watch,
//   } = useForm({
//     resolver: zodResolver(productSchema),
//     mode:'onChange'
//   });

//   const { data: categoryDetails = [] } = useQuery({
//     queryKey: ["categories"],
//     queryFn: getcategories,
//   });

//   console.log(categoryDetails)

//   const {
//     data: products,
//     isLoading: isProductLoading,
//     error: productError,
//   } = useQuery({
//     queryKey: ["products"],
//     queryFn: allproducts,
//   });

//   const productToEdit = products?.find((product) => product._id === id);

//   useEffect(() => {
//     if (productToEdit) {
//       reset({
//         productName: productToEdit.name || "",
//         productCategory: productToEdit.category || "",
//         productPrice: productToEdit.price?.toString() || "",
//         productStock: productToEdit.stock?.toString() || "",
//         brand: productToEdit.brand || "",
//         size: productToEdit.size?.toString() || "",
//         strapMaterial: productToEdit.strap_material || "",
//         color: productToEdit.color || "",
//         productImages: productToEdit.images || [],
//       });

//       const existingImage = productToEdit.images || [];
//       setExistingImages(existingImage);
//       setImagePreviews(existingImage);
//       setFiles([]); // Reset files since existing images are URLs, not File objects
//     }
//   }, [productToEdit, reset]);

//   const { mutate: editProductMutation, isPending: isEditing } = useMutation({
//     mutationFn: ({ productId, formData }) =>
//       editproduct({ productId, formData }),
//     onSuccess: () => {
//       toast.success("Product updated successfully!");
//       queryClient.invalidateQueries(["products"]);
//       navigate("/admin/productlist");
//     },
//     onError: (err) => {
//       toast.error(err.message || "Failed to update product");
//     },
//   });

//   const onImageLoad = (e) => {
//     const { width, height } = e.currentTarget;
//     const crop = centerCrop(
//       makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
//       width,
//       height
//     );
//     setCrop(crop);
//   };

//   const getCroppedImage = async () => {
//     if (!crop || !imgRef.current) return;

//     const canvas = document.createElement("canvas");
//     const image = imgRef.current;
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;
//     const pixelRatio = window.devicePixelRatio;

//     canvas.width = crop.width * scaleX * pixelRatio;
//     canvas.height = crop.height * scaleY * pixelRatio;

//     const ctx = canvas.getContext("2d");
//     ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
//     ctx.imageSmoothingQuality = "high";

//     ctx.drawImage(
//       image,
//       crop.x * scaleX,
//       crop.y * scaleY,
//       crop.width * scaleX,
//       crop.height * scaleY,
//       0,
//       0,
//       crop.width * scaleX,
//       crop.height * scaleY
//     );

//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => {
//         const file = new File([blob], currentFile.name, {
//           type: currentFile.type,
//         });
//         resolve(file);
//       }, currentFile.type);
//     });
//   };

//   const handleImageChange = (e) => {
//     if (imagePreviews.length >= 3) {
//       toast.error("You can have up to 3 images total");
//       return;
//     }

//     const file = e.target.files[0];
//     if (file) {
//       const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
//       if (!validImageTypes.includes(file.type)) {
//         toast.error("Only JPG, JPEG, and PNG files are allowed");
//         return;
//       }
//       if (file.size > MAX_FILE_SIZE) {
//         toast.error("Image size must be less than 5MB");
//         return;
//       }

//       setCurrentFile(file);
//       const reader = new FileReader();
//       reader.onload = () => {
//         setCurrentImage(reader.result);
//         setShowCropModal(true);
//       };
//       reader.readAsDataURL(file);
//       fileInputRef.current.value = null; // Clear the input
//     }
//   };

//   const handleAddImageClick = () => {
//     if (imagePreviews.length < 3 && fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleEditImage = (index) => {
//     const file = files[index];
//     if (!file) {
//       toast.error("No file available to edit");
//       return;
//     }
//     const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
//     if (!validImageTypes.includes(file.type)) {
//       toast.error("Only JPG, JPEG, and PNG files can be edited");
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE) {
//       toast.error("Image size must be less than 5MB");
//       return;
//     }
//     setCurrentFile(file);
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setCurrentImage(reader.result);
//       setShowCropModal(true);
//       setEditingIndex(index); // Track which image we're editing
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleCropConfirm = async () => {
//     try {
//       const croppedFile = await getCroppedImage();

//       let newFiles = [...files];
//       let newPreviews = [...imagePreviews];

//       if (editingIndex !== null) {
//         newFiles[editingIndex] = croppedFile;
//         const reader = new FileReader();
//         reader.onload = () => {
//           newPreviews[editingIndex] = reader.result;
//           setImagePreviews(newPreviews);

//           const newProductImages = newPreviews.map((preview, idx) => {
//             if (typeof preview === "string") {
//               return preview;
//             }
//             return newFiles[idx] || null;
//           });

//           setValue("productImages", newProductImages, { shouldValidate: true });
//         };
//         reader.readAsDataURL(croppedFile);
//       } else {
//         newFiles = [...files, croppedFile];
//         const reader = new FileReader();
//         reader.onload = () => {
//           newPreviews = [...imagePreviews, reader.result];
//           setImagePreviews(newPreviews);

//           const newProductImages = newPreviews.map((preview, idx) => {
//             if (typeof preview === "string") {
//               return preview;
//             }
//             return newFiles[idx] || null;
//           });

//           setValue("productImages", newProductImages, { shouldValidate: true });
//         };
//         reader.readAsDataURL(croppedFile);
//       }

//       setFiles(newFiles);
//       setShowCropModal(false);
//       setCurrentImage(null);
//       setCurrentFile(null);
//       setCrop(null);
//       setEditingIndex(null);
//     } catch (error) {
//       toast.error(error.message || "Failed to process image");
//       setShowCropModal(false);
//       setCurrentImage(null);
//       setCurrentFile(null);
//       setCrop(null);
//       setEditingIndex(null);
//     }
//   };

//   const handleRemoveImage = (index) => {
//     if (typeof imagePreviews[index] === "string") {
//       setImagesToDelete((prev) => [...prev, imagePreviews[index]]);
//     }

//     const newPreviews = [...imagePreviews];
//     newPreviews.splice(index, 1);
//     setImagePreviews(newPreviews);

//     const newFiles = [...files];
//     if (files[index]) {
//       newFiles.splice(index, 1);
//     }
//     setFiles(newFiles);

//     const newProductImages = newPreviews.map((preview, idx) => {
//       if (typeof preview === "string") {
//         return preview;
//       }
//       return newFiles[idx] || null;
//     });

//     setValue("productImages", newProductImages, { shouldValidate: true });
//   };

//   const onSubmit = async (data) => {
//     const formData = new FormData();

//     formData.append("productName", data.productName);
//     formData.append("productCategory", data.productCategory);
//     formData.append("productPrice", data.productPrice.toString());
//     formData.append("productStock", data.productStock.toString());
//     formData.append("brand", data.brand);
//     formData.append("size", data.size.toString());
//     formData.append("strapMaterial", data.strapMaterial);
//     formData.append("color", data.color);

//     imagesToDelete.forEach((imageUrl) => {
//       formData.append("imagesToDelete", imageUrl);
//     });

//     const keptExistingImages = imagePreviews.filter(
//       (img) => typeof img === "string" && !imagesToDelete.includes(img)
//     );
//     formData.append("existingImages", JSON.stringify(keptExistingImages));

//     files.forEach((file) => {
//       if (file instanceof File) {
//         formData.append("productImages", file);
//       }
//     });

//     editProductMutation({ productId: id, formData });
//   };

//   const handleCancel = () => {
//     navigate("/admin/productlist");
//   };

//   if (isProductLoading)
//     return <div className="text-center p-6">Loading...</div>;
//   if (productError)
//     return (
//       <div className="text-center p-6 text-red-600">
//         Error: {productError.message}
//       </div>
//     );
//   if (!productToEdit)
//     return (
//       <div className="text-center p-6 text-red-600">Product not found</div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
//       <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow">
//         <h2 className="text-2xl font-bold mb-8 text-center">Edit Product</h2>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-2 gap-8">
//             <div className="space-y-6">
//               <div>
//                 <Label className="mb-3" htmlFor="productName">
//                   Product Name
//                 </Label>
//                 <Input id="productName" {...register("productName")} />
//                 {errors.productName && (
//                   <p className="text-red-600 text-sm">
//                     {errors.productName.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="productPrice">
//                   Price
//                 </Label>
//                 <Input
//                   id="productPrice"
//                   type="number"
//                   step="0.01"
//                   {...register("productPrice")}
//                 />
//                 {errors.productPrice && (
//                   <p className="text-red-600 text-sm">
//                     {errors.productPrice.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="brand">
//                   Brand
//                 </Label>
//                 <Input id="brand" {...register("brand")} />
//                 {errors.brand && (
//                   <p className="text-red-600 text-sm">{errors.brand.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label>Images (3 required)</Label>
//                 <div className="flex items-center space-x-4 mt-2">
//                   <Button
//                     type="button"
//                     onClick={handleAddImageClick}
//                     className={`bg-black text-white ${
//                       imagePreviews.length >= 3
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={imagePreviews.length >= 3}
//                   >
//                     Add Image
//                     <input
//                       type="file"
//                       accept="image/jpeg,image/jpg,image/png"
//                       onChange={handleImageChange}
//                       className="hidden"
//                       ref={fileInputRef}
//                     />
//                   </Button>
//                   <div className="flex flex-wrap gap-2">
//                     {Array.from({ length: 3 }).map((_, index) => (
//                       <div key={index} className="relative">
//                         {imagePreviews[index] ? (
//                           <div className="relative group">
//                             <img
//                               src={imagePreviews[index]}
//                               alt=""
//                               className="w-16 h-16 object-cover rounded border"
//                             />
//                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
//                               <button
//                                 type="button"
//                                 onClick={() => handleEditImage(index)}
//                                 className="p-1 bg-white rounded-full"
//                                 title="Edit"
//                               >
//                                 {/* Edit icon */}
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => handleRemoveImage(index)}
//                                 className="p-1 bg-white rounded-full"
//                                 title="Remove"
//                               >
//                                 <X size={16} />
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
//                             {index + 1}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {errors.productImages && (
//                   <p className="text-red-600 text-sm mt-1">
//                     {errors.productImages.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <Label className="mb-3" htmlFor="productCategory">
//                   Category
//                 </Label>
//                 <Select
//                   onValueChange={(value) => setValue("productCategory", value)}
//                   value={watch("productCategory")}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categoryDetails.map((category) => (
//                       <SelectItem
//                         key={category._id}
//                         value={category.categoryName}
//                       >
//                         {category.categoryName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.productCategory && (
//                   <p className="text-red-600 text-sm">
//                     {errors.productCategory.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="productStock">
//                   Stock
//                 </Label>
//                 <Input
//                   id="productStock"
//                   type="number"
//                   step="1"
//                   {...register("productStock")}
//                 />
//                 {errors.productStock && (
//                   <p className="text-red-600 text-sm">
//                     {errors.productStock.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="size">
//                   Size
//                 </Label>
//                 <Input
//                   id="size"
//                   type="number"
//                   step="0.1"
//                   {...register("size")}
//                 />
//                 {errors.size && (
//                   <p className="text-red-600 text-sm">{errors.size.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="strapMaterial">
//                   Strap Material
//                 </Label>
//                 <Input id="strapMaterial" {...register("strapMaterial")} />
//                 {errors.strapMaterial && (
//                   <p className="text-red-600 text-sm">
//                     {errors.strapMaterial.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-3" htmlFor="color">
//                   Color
//                 </Label>
//                 <Input id="color" {...register("color")} />
//                 {errors.color && (
//                   <p className="text-red-600 text-sm">{errors.color.message}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 flex justify-end space-x-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleCancel}
//               disabled={isEditing}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className="bg-black text-white"
//               disabled={isEditing || imagePreviews.length !== 3|| !isEditDirty}
//             >
//               {isEditing ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </form>
//       </div>

//       {showCropModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
//             <h3 className="text-lg font-bold mb-4">
//               {editingIndex !== null ? "Edit Image" : "Crop Image"}
//             </h3>
//             {currentImage && (
//               <ReactCrop crop={crop} onChange={setCrop} aspect={1}>
//                 <img
//                   ref={imgRef}
//                   src={currentImage}
//                   alt="Crop preview"
//                   onLoad={onImageLoad}
//                   style={{ maxHeight: "400px", maxWidth: "100%" }}
//                 />
//               </ReactCrop>
//             )}
//             <div className="mt-4 flex justify-end space-x-2">
//               <Button variant="outline" onClick={() => setShowCropModal(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleCropConfirm} disabled={isEditDirty||!isEditValid}>
//                 {editingIndex !== null ? "Save Changes" : "Confirm Crop"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EditProduct;

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { editproduct, allproducts } from "@/api/admin/productmgt/productmgt";
import { getcategories } from "@/api/admin/categorymgt/categorymgt";
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

  if (isProductLoading || isCategoriesLoading) {
    return <div className="text-center p-6">Loading...</div>;
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