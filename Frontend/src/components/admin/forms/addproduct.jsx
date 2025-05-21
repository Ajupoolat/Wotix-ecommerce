// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import toast from "react-hot-toast";
// import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { addproduct } from "@/api/admin/productmgt/productmgt";
// import { getcategories } from "@/api/admin/categorymgt/categorymgt";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { X } from "lucide-react";

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
//     .array(
//       z
//         .instanceof(File)
//         .refine((file) => file.size <= MAX_FILE_SIZE, {
//           message: "Each image must be less than 5MB",
//         })
//         .refine(
//           (file) =>
//             ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
//           {
//             message: "Each image must be a JPEG, JPG, or PNG",
//           }
//         )
//     )
//     .length(3, "Exactly 3 images are required"),
// });

// const AddProduct = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [crop, setCrop] = useState(null);
//   const [showCropModal, setShowCropModal] = useState(false);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [currentFile, setCurrentFile] = useState(null);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const imgRef = useRef(null);
//   const [files, setFiles] = useState([]);
//   const fileInput = useRef(null);

// const {
//   register,
//   handleSubmit,
//   formState: { errors, isValid: isAddValid },
//   setValue,
//   reset,
//   watch,
//   trigger, // Add trigger for manual validation
// } = useForm({
//   resolver: zodResolver(productSchema),
//   mode: 'onChange',
//   defaultValues: {
//     productName: "",
//     productCategory: "",
//     productPrice: "",
//     productStock: "",
//     brand: "",
//     size: "",
//     strapMaterial: "",
//     color: "",
//     productImages: [],
//   },
// });

//   const { data: categorydetials = [] } = useQuery({
//     queryKey: ["categories"],
//     queryFn: getcategories,
//   });

//   const { mutate: addProductMutation, isPending: isAdding } = useMutation({
//     mutationFn: addproduct,
//     onSuccess: () => {
//       toast.success("Product added successfully!");
//       queryClient.invalidateQueries(["products"]);
//       reset();
//       setImagePreviews([]);
//       setFiles([]);
//       navigate("/admin/productlist");
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to add product");
//     },
//   });

//   const onImageLoad = (e) => {
//     const { width, height } = e.currentTarget;
//     const crop = centerCrop(
//       makeAspectCrop(
//         {
//           unit: "%",
//           width: 90,
//         },
//         1,
//         width,
//         height
//       ),
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
//     const selectedFiles = Array.from(e.target.files);
//     if (files.length + selectedFiles.length > 3) {
//       toast.error("You can upload up to 3 images");
//       return;
//     }

//     if (selectedFiles.length > 0) {
//       const file = selectedFiles[0];
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
//       reader.onloadend = () => {
//         setCurrentImage(reader.result);
//         setShowCropModal(true);
//         setEditingIndex(null);
//       };
//       reader.readAsDataURL(file);
//       if (fileInput.current) {
//         fileInput.current.value = "";
//       }
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
//       setEditingIndex(index);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleCropConfirm = async () => {
//   try {
//     const croppedFile = await getCroppedImage();

//     if (editingIndex !== null) {
//       const newFiles = [...files];
//       newFiles[editingIndex] = croppedFile;
//       setFiles(newFiles);
//       setValue("productImages", newFiles, { shouldValidate: true });

//       const newPreviews = [...imagePreviews];
//       const reader = new FileReader();
//       reader.onload = () => {
//         newPreviews[editingIndex] = reader.result;
//         setImagePreviews(newPreviews);
//         trigger("productImages"); // Trigger validation
//       };
//       reader.readAsDataURL(croppedFile);
//     } else {
//       const newFiles = [...files, croppedFile];
//       setFiles(newFiles);
//       setValue("productImages", newFiles, { shouldValidate: true });

//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreviews((prev) => [...prev, reader.result]);
//         trigger("productImages"); // Trigger validation
//       };
//       reader.readAsDataURL(croppedFile);
//     }

//     setShowCropModal(false);
//     setCurrentImage(null);
//     setCurrentFile(null);
//     setCrop(null);
//     setEditingIndex(null);
//   } catch (error) {
//     toast.error(error.message || "Failed to process image");
//     setShowCropModal(false);
//     setCurrentImage(null);
//     setCurrentFile(null);
//     setCrop(null);
//     setEditingIndex(null);
//   }
// };
//   const handleRemoveImage = (index) => {
//     const newFiles = files.filter((_, i) => i !== index);
//     const newPreviews = imagePreviews.filter((_, i) => i !== index);
//     setFiles(newFiles);
//     setImagePreviews(newPreviews);
//     setValue("productImages", newFiles);

//     if (fileInput.current) {
//       fileInput.current.value = "";
//     }
//   };

//   const onSubmit = async (data) => {
//     if (data.productImages.length !== 3) {
//       toast.error("Please upload exactly 3 images");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("productName", data.productName);
//     formData.append("productCategory", data.productCategory);
//     formData.append("productPrice", data.productPrice.toString());
//     formData.append("productStock", data.productStock.toString());
//     formData.append("brand", data.brand);
//     formData.append("size", data.size.toString());
//     formData.append("strapMaterial", data.strapMaterial);
//     formData.append("color", data.color);
//     data.productImages.forEach((file) => {
//       formData.append("productImages", file);
//     });

//     addProductMutation(formData);
//   };

//   const handleCancel = () => {
//     navigate("/admin/productlist");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
//       <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow">
//         <h2 className="text-2xl font-bold mb-8 text-center">
//           Add New Product Details
//         </h2>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-2 gap-8">
//             <div className="space-y-6">
//               <div>
//                 <Label
//                   htmlFor="productName"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Product Name
//                 </Label>
//                 <Input
//                   id="productName"
//                   {...register("productName")}
//                   placeholder="Enter product name"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.productName && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.productName.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="productPrice"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Product Price
//                 </Label>
//                 <Input
//                   id="productPrice"
//                   type="number"
//                   step="0.01"
//                   {...register("productPrice")}
//                   placeholder="Enter product price"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.productPrice && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.productPrice.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="brand"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Brand
//                 </Label>
//                 <Input
//                   id="brand"
//                   {...register("brand")}
//                   placeholder="Enter brand name"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.brand && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.brand.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="productImages"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Product Images (3 required)
//                 </Label>
//                 <div className="mt-1 flex items-center space-x-4">
//                   <label
//                     htmlFor="productImages"
//                     className={`inline-flex items-center justify-center px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md cursor-pointer ${
//                       files.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     Add Image
//                   </label>
//                   <input
//                     id="productImages"
//                     type="file"
//                     accept="image/jpeg,image/jpg,image/png"
//                     onChange={handleImageChange}
//                     className="hidden"
//                     disabled={files.length >= 3}
//                     ref={fileInput}
//                   />
//                   <div className="flex flex-wrap gap-2">
//                     {imagePreviews.map((preview, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={preview}
//                           alt={`Preview ${index + 1}`}
//                           className="w-16 h-16 object-cover rounded border border-gray-200"
//                         />
//                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
//                           <button
//                             type="button"
//                             onClick={() => handleEditImage(index)}
//                             className="p-1 bg-white rounded-full text-black hover:bg-gray-100"
//                             title="Edit"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               width="16"
//                               height="16"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             >
//                               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                             </svg>
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveImage(index)}
//                             className="p-1 bg-white rounded-full text-black hover:bg-gray-100"
//                             title="Remove"
//                           >
//                             <X size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                     {files.length < 3 &&
//                       Array.from({ length: 3 - files.length }).map(
//                         (_, index) => (
//                           <div
//                             key={`empty-${index}`}
//                             className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400"
//                           >
//                             {files.length + index + 1}
//                           </div>
//                         )
//                       )}
//                   </div>
//                 </div>
//                 {errors.productImages && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.productImages.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <Label
//                   htmlFor="productCategory"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Product Category
//                 </Label>
//                 <Select
//                   onValueChange={(value) => setValue("productCategory", value)}
//                   value={watch("productCategory")}
//                 >
//                   <SelectTrigger className="w-full mt-1 border-gray-300 rounded-md">
//                     <SelectValue placeholder="Select a category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categorydetials.map((category) => (
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
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.productCategory.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="productStock"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Product Stock
//                 </Label>
//                 <Input
//                   id="productStock"
//                   type="number"
//                   step="1"
//                   {...register("productStock")}
//                   placeholder="Enter product stock"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.productStock && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.productStock.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="size"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Size
//                 </Label>
//                 <Input
//                   id="size"
//                   type="number"
//                   step="0.1"
//                   {...register("size")}
//                   placeholder="Enter size"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.size && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.size.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="strapMaterial"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Strap Material
//                 </Label>
//                 <Input
//                   id="strapMaterial"
//                   {...register("strapMaterial")}
//                   placeholder="Enter strap material"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.strapMaterial && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.strapMaterial.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label
//                   htmlFor="color"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Color
//                 </Label>
//                 <Input
//                   id="color"
//                   {...register("color")}
//                   placeholder="Enter color"
//                   className="mt-1 border-gray-300 rounded-md w-full"
//                 />
//                 {errors.color && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.color.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 flex justify-end space-x-4">
//             <Button
//               type="button"
//               onClick={handleCancel}
//               className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6 py-2"
//               disabled={isAdding}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className="bg-black text-white hover:bg-gray-800 px-6 py-2"
//               disabled={isAdding || files.length !== 3 ||!isAddValid}
//             >
//               {isAdding ? "Adding Product..." : "Add Product"}
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
//               <ReactCrop
//                 crop={crop}
//                 onChange={(newCrop) => setCrop(newCrop)}
//                 aspect={1}
//               >
//                 <img
//                   ref={imgRef}
//                   src={currentImage}
//                   alt="Crop"
//                   onLoad={onImageLoad}
//                   style={{ maxHeight: "400px", maxWidth: "100%" }}
//                 />
//               </ReactCrop>
//             )}
//             <div className="mt-4 flex justify-end space-x-2">
//               <Button
//                 onClick={() => {
//                   setShowCropModal(false);
//                   setCurrentImage(null);
//                   setCurrentFile(null);
//                   setCrop(null);
//                   setEditingIndex(null);
//                 }}
//                 className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleCropConfirm}
//                 className="bg-black text-white hover:bg-gray-800 px-4 py-2"
//               >
//                 {editingIndex !== null ? "Save Changes" : "Confirm Crop"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddProduct;


import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addproduct } from "@/api/admin/productmgt/productmgt";
import { getcategories } from "@/api/admin/categorymgt/categorymgt";
import ProductForm from "../reuse/productlist/productform";
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

  if (isCategoriesLoading) {
    return <div className="text-center p-6">Loading categories...</div>;
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