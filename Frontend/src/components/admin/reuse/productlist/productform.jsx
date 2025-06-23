import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import AdminSidebar from "../sidebar/sidebar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const productSchema = z.object({
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Product name can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "Product name cannot have leading or trailing spaces"),
  productCategory: z.string().min(1, "Product category is required"),
  productPrice: z
    .string()
    .min(1, "Product price is required")
    .regex(
      /^\d*\.?\d{0,2}$/,
      "Product price must be a valid number with up to two decimal places"
    )
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Product price must be a positive number",
    }),
  productStock: z
    .string()
    .min(1, "Product stock is required")
    .regex(/^\d+$/, "Product stock must be a non-negative integer")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, {
      message: "Product stock must be a non-negative integer",
    }),
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(50, "Brand must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Brand can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "Brand cannot have leading or trailing spaces"),
  size: z
    .string()
    .min(1, "Size is required")
    .regex(
      /^\d*\.?\d{0,1}$/,
      "Size must be a number with up to one decimal place"
    )
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0 && val <= 1000, {
      message: "Size must be a positive number between 0 and 1000",
    }),
  strapMaterial: z
    .string()
    .min(1, "Strap material is required")
    .max(50, "Strap material must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Strap material can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "Strap material cannot have leading or trailing spaces"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(30, "Color must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Color can only contain letters, numbers, and spaces"
    )
    .trim()
    .regex(/^\S.*\S$/, "Color cannot have leading or trailing spaces"),
  productImages: z
    .array(z.any())
    .refine((items) => items.length === 3, {
      message: "Please upload exactly 3 images for the product",
    })
    .refine(
      (items) =>
        items.every(
          (item) =>
            typeof item === "string" ||
            (item instanceof File &&
              ["image/jpeg", "image/jpg", "image/png"].includes(item.type) &&
              item.size <= MAX_FILE_SIZE)
        ),
      {
        message: "Images must be JPG, JPEG, or PNG and less than 5MB",
      }
    ),
});

const ProductForm = ({
  mode = "add",
  productId,
  initialData = {},
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [imagePreviews, setImagePreviews] = useState(
    mode === "edit" ? initialData.images || [] : []
  );
  const [existingImages, setExistingImages] = useState(
    mode === "edit" ? initialData.images || [] : []
  );
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [files, setFiles] = useState([]);
  const [crop, setCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      productName: mode === "edit" ? initialData.name || "" : "",
      productCategory: mode === "edit" ? initialData.category || "" : "",
      productPrice: mode === "edit" ? initialData.price?.toString() || "" : "",
      productStock: mode === "edit" ? initialData.stock?.toString() || "" : "",
      brand: mode === "edit" ? initialData.brand || "" : "",
      size: mode === "edit" ? initialData.size?.toString() || "" : "",
      strapMaterial: mode === "edit" ? initialData.strap_material || "" : "",
      color: mode === "edit" ? initialData.color || "" : "",
      productImages: mode === "edit" ? initialData.images || [] : [],
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        productName: initialData.name || "",
        productCategory: initialData.category || "",
        productPrice: initialData.price?.toString() || "",
        productStock: initialData.stock?.toString() || "",
        brand: initialData.brand || "",
        size: initialData.size?.toString() || "",
        strapMaterial: initialData.strap_material || "",
        color: initialData.color || "",
        productImages: initialData.images || [],
      });
      setImagePreviews(initialData.images || []);
      setExistingImages(initialData.images || []);
      setFiles([]);
    }
  }, [initialData, mode, reset]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImage = async () => {
    if (!crop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], currentFile.name, {
          type: currentFile.type,
        });
        resolve(file);
      }, currentFile.type);
    });
  };

  const handleImageChange = (e) => {
    if (imagePreviews.length >= 3) {
      toast.error("You can have up to 3 images total");
      return;
    }

    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setCurrentFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result);
        setShowCropModal(true);
        setEditingIndex(null);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleEditImage = (index) => {
    const item = imagePreviews[index];
    if (typeof item === "string") {
      toast.error(
        "Existing images cannot be edited; please upload a new image"
      );
      return;
    }
    const file = files[index];
    if (!file) {
      toast.error("No file available to edit");
      return;
    }
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files can be edited");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImage(reader.result);
      setShowCropModal(true);
      setEditingIndex(index);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedFile = await getCroppedImage();

      let newFiles = [...files];
      let newPreviews = [...imagePreviews];

      if (editingIndex !== null) {
        newFiles[editingIndex] = croppedFile;
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews[editingIndex] = reader.result;
          setImagePreviews(newPreviews);
          updateProductImages(newPreviews, newFiles);
        };
        reader.readAsDataURL(croppedFile);
      } else {
        newFiles = [...files, croppedFile];
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews = [...imagePreviews, reader.result];
          setImagePreviews(newPreviews);
          updateProductImages(newPreviews, newFiles);
        };
        reader.readAsDataURL(croppedFile);
      }

      setFiles(newFiles);
      setShowCropModal(false);
      setCurrentImage(null);
      setCurrentFile(null);
      setCrop(null);
      setEditingIndex(null);
    } catch (error) {
      toast.error(error.message || "Failed to process image");
      setShowCropModal(false);
      setCurrentImage(null);
      setCurrentFile(null);
      setCrop(null);
      setEditingIndex(null);
    }
  };

  const updateProductImages = (previews, files) => {
    const newProductImages = previews.map((preview, idx) => {
      if (typeof preview === "string") {
        return preview;
      }
      return files[idx] || null;
    });
    setValue("productImages", newProductImages, { shouldValidate: true });
    trigger("productImages");
  };

  const handleRemoveImage = (index) => {
    const item = imagePreviews[index];
    if (typeof item === "string") {
      setImagesToDelete((prev) => [...prev, item]);
    }

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setFiles(newFiles);
    updateProductImages(newPreviews, newFiles);
  };

  const handleAddImageClick = () => {
    if (imagePreviews.length < 3 && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("productCategory", data.productCategory);
    formData.append("productPrice", data.productPrice.toString());
    formData.append("productStock", data.productStock.toString());
    formData.append("brand", data.brand);
    formData.append("size", data.size.toString());
    formData.append("strapMaterial", data.strapMaterial);
    formData.append("color", data.color);

    if (mode === "edit") {
      imagesToDelete.forEach((imageUrl) => {
        formData.append("imagesToDelete", imageUrl);
      });
      const keptExistingImages = imagePreviews.filter(
        (img) => typeof img === "string" && !imagesToDelete.includes(img)
      );
      formData.append("existingImages", JSON.stringify(keptExistingImages));
    }

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append("productImages", file);
      }
    });

    onSubmit({ productId, formData });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeRoute="/admin/productlist" />

      <div className="flex-1 flex flex-col">
        <main className="p-6">
          <div className="w-full max-w-4xl bg-white ml-42 mt-8 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {mode === "edit" ? "Edit Product" : "Add New Product Details"}
            </h2>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="productName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Name
                    </Label>
                    <Input
                      id="productName"
                      {...register("productName")}
                      placeholder="Enter product name"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.productName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.productName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="productPrice"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Price
                    </Label>
                    <Input
                      id="productPrice"
                      type="text"
                      inputMode="decimal"
                      {...register("productPrice")}
                      placeholder="Enter product price"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.productPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.productPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="brand"
                      className="text-sm font-medium text-gray-700"
                    >
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      {...register("brand")}
                      placeholder="Enter brand name"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.brand && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.brand.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="productImages"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Images (3 required)
                    </Label>
                    <div className="mt-1 flex items-center space-x-4">
                      <Button
                        type="button"
                        onClick={handleAddImageClick}
                        className={`inline-flex items-center justify-center px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md cursor-pointer ${
                          imagePreviews.length >= 3
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={imagePreviews.length >= 3}
                      >
                        Add Image
                        <input
                          id="productImages"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </Button>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="relative group">
                            {imagePreviews[index] ? (
                              <div className="relative group">
                                <img
                                  src={imagePreviews[index]}
                                  alt={`Preview ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  {typeof imagePreviews[index] !== "string" && (
                                    <button
                                      type="button"
                                      onClick={() => handleEditImage(index)}
                                      className="p-1 bg-white rounded-full text-black hover:bg-gray-100"
                                      title="Edit"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="p-1 bg-white rounded-full text-black hover:bg-gray-100"
                                    title="Remove"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                                {index + 1}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {errors.productImages && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.productImages.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="productCategory"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Category
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("productCategory", value, {
                          shouldValidate: true,
                        })
                      }
                      value={watch("productCategory")}
                    >
                      <SelectTrigger className="w-full mt-1 border-gray-300 rounded-md">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category.categoryName}
                          >
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.productCategory && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.productCategory.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="productStock"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Stock
                    </Label>
                    <Input
                      id="productStock"
                      type="text"
                      inputMode="numeric"
                      {...register("productStock")}
                      placeholder="Enter product stock"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.productStock && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.productStock.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="size"
                      className="text-sm font-medium text-gray-700"
                    >
                      Size
                    </Label>
                    <Input
                      id="size"
                      type="text"
                      inputMode="decimal"
                      {...register("size")}
                      placeholder="Enter size"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.size && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.size.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="strapMaterial"
                      className="text-sm font-medium text-gray-700"
                    >
                      Strap Material
                    </Label>
                    <Input
                      id="strapMaterial"
                      {...register("strapMaterial")}
                      placeholder="Enter strap material"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.strapMaterial && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.strapMaterial.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="color"
                      className="text-sm font-medium text-gray-700"
                    >
                      Color
                    </Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="Enter color"
                      className="mt-1 border-gray-300 rounded-md w-full"
                    />
                    {errors.color && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.color.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6 py-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800 px-6 py-2"
                  disabled={!isValid || imagePreviews.length !== 3}
                >
                  {isSubmitting
                    ? mode === "edit"
                      ? "Saving..."
                      : "Adding Product..."
                    : mode === "edit"
                    ? "Save Changes"
                    : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingIndex !== null ? "Edit Image" : "Crop Image"}
            </h3>
            {currentImage && (
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={currentImage}
                  alt="Crop"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "400px", maxWidth: "100%" }}
                />
              </ReactCrop>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setShowCropModal(false);
                  setCurrentImage(null);
                  setCurrentFile(null);
                  setCrop(null);
                  setEditingIndex(null);
                }}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropConfirm}
                className="bg-black text-white hover:bg-gray-800 px-4 py-2"
              >
                {editingIndex !== null ? "Save Changes" : "Confirm Crop"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
