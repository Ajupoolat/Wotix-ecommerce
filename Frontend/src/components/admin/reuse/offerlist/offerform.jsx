import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import {
  createOffer,
  editoffer,
  getcategorylist,
  getproductlist,
  getofferbyId,
} from "@/api/admin/offers/offermgt";
import AdminSidebar from "../sidebar/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const offerSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters")
      .regex(
        /^[a-zA-Z0-9\s]+$/,
        "Title can only contain letters, numbers, and spaces"
      )
      .trim()
      .regex(/^\S.*\S$/, "Title cannot have leading or trailing spaces"),
    offerType: z.enum(["product", "category"], {
      required_error: "Offer type is required",
      invalid_type_error: "Invalid offer type",
    }),
    description: z
      .string()
      .min(10, "Minimum 10 characters required")
      .max(500, "Description must be less than 500 characters")
      .regex(
        /^[a-zA-Z0-9\s]*$/,
        "Description can only contain letters, numbers, and spaces"
      )
      .trim()
      .optional(),
    discountType: z.enum(["percentage"], {
      required_error: "Discount type is required",
      invalid_type_error: "Invalid discount type",
    }),
    discountValue: z
      .string()
      .min(1, "Discount value is required")
      .regex(
        /^\d*\.?\d{0,2}$/,
        "Discount value must be a number with up to two decimal places"
      )
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 0, {
        message: "Discount value must be a positive number",
      }),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (val) => {
          const inputDate = new Date(val);
          if (isNaN(inputDate.getTime())) return false;
          const inputDateOnly = new Date(
            inputDate.getFullYear(),
            inputDate.getMonth(),
            inputDate.getDate()
          );
          const today = new Date();
          const todayDateOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          return inputDateOnly >= todayDateOnly;
        },
        { message: "Start date must be today or in the future" }
      ),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "End date must be a valid date",
      }),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.offerType === "product") {
        return data.applicableProducts && data.applicableProducts.length > 0;
      }
      return true;
    },
    {
      message: "At least one product must be selected",
      path: ["applicableProducts"],
    }
  )
  .refine(
    (data) => {
      if (data.offerType === "category") {
        return (
          data.applicableCategories && data.applicableCategories.length > 0
        );
      }
      return true;
    },
    {
      message: "At least one category must be selected",
      path: ["applicableCategories"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue >= 0 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 0 and 100",
      path: ["discountValue"],
    }
  );

const OfferForm = ({
  mode = "add",
  offerId,
  initialData = {},
  onSubmit,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  

  const { data: offerData, isLoading: isOfferLoading } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => getofferbyId(offerId),
    enabled: mode === "edit" && !!offerId,
    onError: (error) => {
      toast.error(error.message || "Failed to load offer");
      navigate("/admin/offers");
    },
  });

  const form = useForm({
    resolver: zodResolver(offerSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      offerType: mode === "edit" && offerData?.offerType ? offerData.offerType : "category",
      description: "",
      discountType: "percentage",
      discountValue: "",
      applicableProducts: [],
      applicableCategories: [],
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  console.log(offerData?.offerType);
  useEffect(() => {
    if (mode === "edit" && offerData) {
      form.reset({
        title: offerData.title || "",
        offerType: offerData.offerType,
        description: offerData.description || "",
        discountType: offerData.discountType || "percentage",
        discountValue: offerData.discountValue?.toString() || "",
        applicableProducts: offerData.applicableProducts || [],
        applicableCategories: offerData.applicableCategories || [],
        startDate: offerData.startDate ? offerData.startDate.split("T")[0] : "",
        endDate: offerData.endDate ? offerData.endDate.split("T")[0] : "",
        isActive: offerData.isActive ?? true,
      });
    } else if (mode === "add") {
      form.reset({
        title: "",
        offerType: "product",
        description: "",
        discountType: "percentage",
        discountValue: "",
        applicableProducts: [],
        applicableCategories: [],
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [offerData, mode, form]);

  const { data: products = [] , isLoading:isProductLoading} = useQuery({
    queryKey: ["products"],
    queryFn: getproductlist,
    select: (data) =>
      data.map((product) => ({
        label: product.name,
        value: product._id,
      })),
  });

  const { data: categories = [] ,isLoading:isCategoriesLoading} = useQuery({
    queryKey: ["categories"],
    queryFn: getcategorylist,
    select: (data) =>
      data.map((category) => ({
        label: category.categoryName,
        value: category._id,
      })),
  });

  const {mutate:createMutation,isPending:isCreating} = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      toast.success("Offer created successfully!");
      form.reset();
      navigate("/admin/offers");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create offer");
    },
  });

  const {mutate:editMutation ,isPending:isupdating}= useMutation({
    mutationFn: (data) => editoffer(data, offerId),
    onSuccess: () => {
      toast.success("Offer updated successfully!");
      navigate("/admin/offers");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update offer");
    },
  });

  const offerType = form.watch("offerType");
  const discountType = form.watch("discountType");

  const filteredProducts = products.filter((product) =>
    product.label.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCategories = categories.filter((category) =>
    category.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    if (onSubmit) {
      onSubmit(payload);
    } else if (mode === "add") {
      createMutation(payload);
    } else if (mode === "edit") {
      editMutation(payload);
    }
  };

  if (isOfferLoading||isCategoriesLoading||isProductLoading||isCreating||isupdating) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/offers" />
        <LoadingSpinner/>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeRoute="/admin/offers" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <h2 className="text-xl font-semibold">
              {mode === "edit" ? "Edit Offer" : "Add New Offer"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {mode === "edit" ? "Edit Offer" : "Add New Offer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter offer title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="offerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Type</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            form.setValue("offerType", value, {
                              shouldValidate: false,
                            })
                          }
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select offer type" {...field} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product">
                              Product Offer
                            </SelectItem>
                            <SelectItem value="category">
                              Category Offer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="offerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("applicableProducts", [], {
                              shouldValidate: true,
                            });
                            form.setValue("applicableCategories", [], {
                              shouldValidate: true,
                            });
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select offer type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product">
                              Product Offer
                            </SelectItem>
                            <SelectItem value="category">
                              Category Offer
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                            placeholder="Enter offer description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            form.setValue("discountType", value, {
                              shouldValidate: true,
                            })
                          }
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Enter discount value"
                              {...field}
                            />
                            {discountType === "percentage" && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">%</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {offerType === "product" && (
                    <FormField
                      control={form.control}
                      name="applicableProducts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Applicable Products</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="relative mb-2">
                                <Input
                                  placeholder="Search products..."
                                  value={productSearch}
                                  onChange={(e) =>
                                    setProductSearch(e.target.value)
                                  }
                                  className="pr-8"
                                />
                                {productSearch && (
                                  <button
                                    type="button"
                                    onClick={() => setProductSearch("")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map((product) => (
                                    <div
                                      key={product.value}
                                      className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded"
                                    >
                                      <Checkbox
                                        id={`product-${product.value}`}
                                        checked={field.value.includes(
                                          product.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...field.value, product.value]
                                            : field.value.filter(
                                                (v) => v !== product.value
                                              );
                                          form.setValue(
                                            "applicableProducts",
                                            newValue,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                        }}
                                      />
                                      <label
                                        htmlFor={`product-${product.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                      >
                                        {product.label}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 p-2">
                                    {products.length === 0
                                      ? "Loading products..."
                                      : "No products match your search"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Select products this offer applies to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {offerType === "category" && (
                    <FormField
                      control={form.control}
                      name="applicableCategories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Applicable Categories</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="relative mb-2">
                                <Input
                                  placeholder="Search categories..."
                                  value={categorySearch}
                                  onChange={(e) =>
                                    setCategorySearch(e.target.value)
                                  }
                                  className="pr-8"
                                />
                                {categorySearch && (
                                  <button
                                    type="button"
                                    onClick={() => setCategorySearch("")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                                {filteredCategories.length > 0 ? (
                                  filteredCategories.map((category) => (
                                    <div
                                      key={category.value}
                                      className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded"
                                    >
                                      <Checkbox
                                        id={`category-${category.value}`}
                                        checked={field.value.includes(
                                          category.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...field.value, category.value]
                                            : field.value.filter(
                                                (v) => v !== category.value
                                              );
                                          form.setValue(
                                            "applicableCategories",
                                            newValue,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                        }}
                                      />
                                      <label
                                        htmlFor={`category-${category.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                      >
                                        {category.label}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 p-2">
                                    {categories.length === 0
                                      ? "Loading categories..."
                                      : "No categories match your search"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Select categories this offer applies to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) =>
                                form.setValue("startDate", e.target.value, {
                                  shouldValidate: true,
                                })
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) =>
                                form.setValue("endDate", e.target.value, {
                                  shouldValidate: true,
                                })
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              form.setValue("isActive", checked, {
                                shouldValidate: true,
                              })
                            }
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active Offer</FormLabel>
                          <FormDescription>
                            This offer will be immediately available when active
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? mode === "edit"
                        ? "Updating..."
                        : "Creating..."
                      : mode === "edit"
                      ? "Update Offer"
                      : "Create Offer"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default OfferForm;
