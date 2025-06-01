import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    .min(1, "City is required")
    .max(100, "City is too long")
    .regex(
      /^[a-zA-Z\s\-]+$/,
      "City must contain only letters, spaces, or hyphens"
    ),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State is too long")
    .regex(
      /^[a-zA-Z\s\-]+$/,
      "State must contain only letters, spaces, or hyphens"
    ),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(10, "Postal code is too long")
    .regex(/^[a-zA-Z0-9\s\-]{3,10}$/, "Invalid postal code format"),
  country: z.enum(["India", "USA", "UK", "Canada", "Australia"], {
    errorMap: () => ({ message: "Please select a valid country" }),
  }),
  isDefault: z.boolean(),
});

const AddressForm = ({
  onSubmit,
  defaultValues,
  isEditing = false,
  isSubmitting = false,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || {
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

  // Handle form reset and cancellation
  const handleReset = () => {
    reset();
    if (onCancel) onCancel();
  };

  return (
    <div
      id="addressForm"
      className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200"
    >
      <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name*
            </label>
            <input
              type="text"
              id="fullName"
              {...register("fullName")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Alternate Phone */}
          <div className="mb-4">
            <label
              htmlFor="alternatePhone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alternate Phone
            </label>
            <input
              type="tel"
              id="alternatePhone"
              {...register("alternatePhone")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.alternatePhone ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.alternatePhone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.alternatePhone.message}
              </p>
            )}
          </div>

          {/* Street Address */}
          <div className="mb-4 md:col-span-2">
            <label
              htmlFor="streetAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Street Address*
            </label>
            <textarea
              id="streetAddress"
              {...register("streetAddress")}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.streetAddress ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.streetAddress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.streetAddress.message}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div className="mb-4">
            <label
              htmlFor="landmark"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              {...register("landmark")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.landmark ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.landmark && (
              <p className="mt-1 text-sm text-red-600">
                {errors.landmark.message}
              </p>
            )}
          </div>

          {/* City */}
          <div className="mb-4">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City/Town*
            </label>
            <input
              type="text"
              id="city"
              {...register("city")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.city ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div className="mb-4">
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State*
            </label>
            <input
              type="text"
              id="state"
              {...register("state")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.state ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="mb-4">
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Postal Code*
            </label>
            <input
              type="text"
              id="postalCode"
              {...register("postalCode")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.postalCode ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country*
            </label>
            <select
              id="country"
              {...register("country")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.country ? "border-red-500" : "border-gray-300"
              } focus:ring-blue-500`}
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            {...register("isDefault")}
            className="w-4 h-4 mr-2 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="isDefault"
            className="text-sm font-medium text-gray-700"
          >
            Set as default address
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-all"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isEditing ? (isSubmitting ? "Updating..." : "Update Address") : (isSubmitting ? "Saving..." : "Save Address")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;