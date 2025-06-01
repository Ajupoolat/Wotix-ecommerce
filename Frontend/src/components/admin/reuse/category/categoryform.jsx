import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const categorySchema = z.object({
  categoryName: z
    .string()
    .min(1, "This field is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9 ]*$/,
      "Category name can only contain letters, numbers, and spaces"
    ),
  description: z
    .string()
    .min(1, "This field is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .regex(
      /^[a-zA-Z0-9 ]*$/,
      "Description can only contain letters, numbers, and spaces"
    ),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CategoryForm = ({
  mode = "add",
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  categoryImage,
  setCategoryImage,
  fileInputRef,
}) => {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      categoryName: "",
      description: "",
    },
  });

  // Reset form for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        categoryName: initialData.categoryName || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, mode, form]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, or PNG files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setCategoryImage(file);
  };

  const handleRemoveImage = () => {
    setCategoryImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = (data) => {
    if (mode === "add" && !categoryImage) {
      toast.error("Please select a category image");
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="categoryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  {...field}
                  className={
                    form.formState.errors.categoryName ? "border-red-500" : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description"
                  {...field}
                  className={
                    form.formState.errors.description ? "border-red-500" : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-2">
          <FormLabel htmlFor="categoryImage">Category Image</FormLabel>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => fileInputRef.current.click()}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {categoryImage || (mode === "edit" && initialData.image)
                ? "Change Image"
                : "Add Image"}
            </Button>
            <input
              type="file"
              id="categoryImage"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
            {(categoryImage || (mode === "edit" && initialData.image)) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {categoryImage
                    ? categoryImage.name
                    : initialData.image?.split("/").pop()}
                </span>
                {mode === "add" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Adding..."
              : mode === "edit"
              ? "Update"
              : "Add"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
