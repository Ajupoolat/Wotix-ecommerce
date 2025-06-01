import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editaddress } from "../../../../../../api/users/profile/profilemgt";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for address validation
const addressSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name is too long")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Full name can only include letters, spaces, apostrophes, periods, and hyphens"
    ),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  alternatePhone: z
    .union([
      z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid alternate phone number format")
        .max(15, "Alternate phone number is too long"),
      z.literal(""),
    ])
    .optional(),
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .max(500, "Street address is too long")
    .regex(
      /^[a-zA-Z0-9\s,.'#/-]+$/,
      "Street address can only include letters, numbers, spaces, and common punctuation"
    ),
  landmark: z
    .string()
    .max(100, "Landmark is too long")
    .regex(
      /^[a-zA-Z0-9\s,'-]*$/,
      "Landmark can only include letters, numbers, commas, and hyphens"
    )
    .optional(),
  city: z
    .string()
    .min(1, "City name is required")
    .max(100, "City is too long")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "City must contain only letters, spaces, or hyphens"
    ),
  state: z
    .string()
    .min(1, "State name is required")
    .max(100, "State is too long")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "State must contain only letters, spaces, or hyphens"
    ),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code is too long")
    .regex(/^[a-zA-Z0-9\s-]{3,10}$/, "Invalid postal code"),
  country: z.enum(["India", "USA", "UK", "Canada", "Australia"], {
    errorMap: () => ({ message: "Please select a valid country" }),
  }),
  isDefault: z.boolean(),
});

// AddressFormModal component
const AddressFormModal = ({
  open,
  setOpen,
  isEditing,
  editingAddress,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      alternatePhone: "",
      streetAddress: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    },
  });

  // Populate form with editingAddress data when editing
  useEffect(() => {
    if (isEditing && editingAddress) {
      setValue("fullName", editingAddress.fullName || "");
      setValue("phone", editingAddress.phone || "");
      setValue("alternatePhone", editingAddress.alternatePhone || "");
      setValue("streetAddress", editingAddress.streetAddress || "");
      setValue("landmark", editingAddress.landmark || "");
      setValue("city", editingAddress.city || "");
      setValue("state", editingAddress.state || "");
      setValue("postalCode", editingAddress.postalCode || "");
      setValue("country", editingAddress.country || "India");
      setValue("isDefault", editingAddress.isDefault || false);
    } else {
      reset(); // Reset to default values when not editing
    }
  }, [isEditing, editingAddress, reset, setValue]);

  // Edit address mutation
  const editMutation = useMutation({
    mutationFn: (data) => editaddress(editingAddress._id, data),
    onSuccess: () => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userAddresses", userId] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress", userId] }); // Ensure default address is updated
      setOpen(false);
      reset();
      onSuccess?.(); // Call onSuccess to refetch address
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  // Form submission handler
  const onSubmit = (data) => {
    if (!isEditing) return; // Only handle editing for now
    const addressData = {
      ...data,
      userId,
    };
    editMutation.mutate(addressData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Address" : "Add Address"}
          </DialogTitle>
          <button
          type="button"
            onClick={()=>{
                reset();
                setOpen(false)
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 disabled:pointer-events-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name*</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input
                type="tel"
                id="phone"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Alternate Phone */}
            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                type="tel"
                id="alternatePhone"
                {...register("alternatePhone")}
              />
              {errors.alternatePhone && (
                <p className="text-sm text-red-500">
                  {errors.alternatePhone.message}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="streetAddress">Street Address*</Label>
              <Textarea
                id="streetAddress"
                {...register("streetAddress")}
                className={errors.streetAddress ? "border-red-500" : ""}
              />
              {errors.streetAddress && (
                <p className="text-sm text-red-500">
                  {errors.streetAddress.message}
                </p>
              )}
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input type="text" id="landmark" {...register("landmark")} />
              {errors.landmark && (
                <p className="text-sm text-red-500">
                  {errors.landmark.message}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City/Town*</Label>
              <Input
                type="text"
                id="city"
                {...register("city")}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Input
                type="text"
                id="state"
                {...register("state")}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code*</Label>
              <Input
                type="text"
                id="postalCode"
                {...register("postalCode")}
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country*</Label>
              <select
                id="country"
                {...register("country")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={editMutation.isLoading}>
              {editMutation.isLoading
                ? "Updating..."
                : isEditing
                ? "Update Address"
                : "Add Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;
