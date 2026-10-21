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
      className="bg-white dark:bg-[#0B0F17] rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 mb-8 border border-slate-200 dark:border-amber-500/30 transition-colors"
    >
      <h3 className="text-sm font-cinzel font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 dark:border-white/5">
        {isEditing ? "Modify Destination" : "Register New Destination"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Full Name*
            </label>
            <input
              type="text"
              id="fullName"
              {...register("fullName")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.fullName ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.phone ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">{errors.phone.message}</p>
            )}
          </div>

          {/* Alternate Phone */}
          <div className="mb-4">
            <label
              htmlFor="alternatePhone"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Alternate Phone
            </label>
            <input
              type="tel"
              id="alternatePhone"
              {...register("alternatePhone")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.alternatePhone ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.alternatePhone && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
                {errors.alternatePhone.message}
              </p>
            )}
          </div>

          {/* Street Address */}
          <div className="mb-4 md:col-span-2">
            <label
              htmlFor="streetAddress"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Street Address*
            </label>
            <textarea
              id="streetAddress"
              {...register("streetAddress")}
              rows="3"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.streetAddress ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.streetAddress && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
                {errors.streetAddress.message}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div className="mb-4">
            <label
              htmlFor="landmark"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              {...register("landmark")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.landmark ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.landmark && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
                {errors.landmark.message}
              </p>
            )}
          </div>

          {/* City */}
          <div className="mb-4">
            <label
              htmlFor="city"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              City/Town*
            </label>
            <input
              type="text"
              id="city"
              {...register("city")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.city ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div className="mb-4">
            <label
              htmlFor="state"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              State*
            </label>
            <input
              type="text"
              id="state"
              {...register("state")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.state ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.state && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">{errors.state.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="mb-4">
            <label
              htmlFor="postalCode"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Postal Code*
            </label>
            <input
              type="text"
              id="postalCode"
              {...register("postalCode")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.postalCode ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-xs font-cinzel font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Country*
            </label>
            <select
              id="country"
              {...register("country")}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#111622] text-slate-900 dark:text-slate-100 border ${
                errors.country ? "border-rose-500" : "border-slate-200 dark:border-white/10"
              } focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all`}
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-mono">
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
            className="w-4 h-4 mr-2.5 rounded accent-amber-500 text-amber-500 focus:ring-amber-400 cursor-pointer"
          />
          <label
            htmlFor="isDefault"
            className="text-xs font-cinzel uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Designate as primary vault destination
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl font-cinzel text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isEditing ? (isSubmitting ? "Updating..." : "Update Destination") : (isSubmitting ? "Saving..." : "Save Destination")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;