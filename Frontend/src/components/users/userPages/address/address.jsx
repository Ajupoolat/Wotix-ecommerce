import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getaddress,
  addaddress,
  deleteaddress,
  editaddress,
} from "@/api/users/profile/profilemgt";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import LoaderSpinner from "@/components/common/spinner";
import Restricter from "@/components/common/restricter";
import Breadcrumbs from "@/components/common/breadCrums";

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

const AddressComponent = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const { id } = useParams();
  const userId = id;

  // React Hook Form setup with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  // Fetch addresses using TanStack Query
  const {
    data: addresses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getaddress(userId),
    onError: (error) => {
      toast.error(error.message || "Failed to fetch addresses");
    },
  });

  // Mutations for CRUD operations
  const addMutation = useMutation({
    mutationFn: (addressData) => addaddress(addressData),
    onSuccess: () => {
      toast.success("Address added successfully");
      queryClient.invalidateQueries(["addresses", userId]);
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add address");
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ idadd, data }) => editaddress(idadd, data),
    onSuccess: () => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries(["addresses", userId]);
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (idadd) => deleteaddress(idadd),
    onSuccess: () => {
      toast.success("Address deleted successfully");
      queryClient.invalidateQueries(["addresses", userId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: ({ idadd, data }) =>
      editaddress(idadd, { ...data, isDefault: true }),
    onSuccess: () => {
      toast.success("Default address updated");
      queryClient.invalidateQueries(["addresses", userId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default address");
    },
  });

  const resetForm = () => {
    reset();
    setIsEditing(false);
    setCurrentAddress(null);
  };

  const handleEdit = (address) => {
    setCurrentAddress(address);
    setValue("fullName", address.fullName);
    setValue("phone", address.phone);
    setValue("alternatePhone", address.alternatePhone || "");
    setValue("streetAddress", address.streetAddress);
    setValue("landmark", address.landmark || "");
    setValue("city", address.city);
    setValue("state", address.state);
    setValue("postalCode", address.postalCode);
    setValue("country", address.country);
    setValue("isDefault", address.isDefault);
    setIsEditing(true);
    setShowForm(true);

    setTimeout(() => {
      document
        .getElementById("addressForm")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (idadd) => {
    deleteMutation.mutate(idadd);

    setShowAlert(false);
  };

  const setDefaultAddress = (idadd) => {
    const address = addresses.find((addr) => addr._id === idadd);
    if (address) {
      setDefaultMutation.mutate({ idadd, data: address });
    }
  };

  const toggleForm = () => {
    if (isEditing) resetForm();
    setShowForm(!showForm);
  };

  const onSubmit = (data) => {
    const addressData = { ...data, userId };
    if (isEditing) {
      editMutation.mutate({ idadd: currentAddress._id, data: addressData });
    } else {
      addMutation.mutate(addressData);
    }
  };

  if (isLoading) {
    return (
     <LoaderSpinner/>
    );
  }

  if (isError) {
    return <Restricter />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       <div className="w-75 -ml-50 h-20">
              <Breadcrumbs items={[
        {label:"Home",link:"/"},
        {label:"My Profile",link:`/profile/${userId}`},
        {label:'My Address'}
        ]}/>
       </div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Manage Addresses</h2>
        <button
          onClick={toggleForm}
          className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-500 transition-all"
        >
          {showForm ? (
            <>Cancel</>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Address
            </>
          )}
        </button>
      </div>
      {/* Address Form */}
      {showForm && (
        <div
          id="addressForm"
          className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

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

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  addMutation.isLoading ||
                  editMutation.isLoading
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isEditing
                  ? editMutation.isLoading
                    ? "Updating..."
                    : "Update Address"
                  : addMutation.isLoading
                  ? "Saving..."
                  : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Address List */}
      <div>
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
          Your Addresses
        </h3>
        {addresses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 mb-4">
              No addresses found. Please add an address.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`border rounded-lg p-5 relative ${
                  address.isDefault
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                } transition-all`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    Default
                  </span>
                )}

                <div className="mb-4">
                  <h4 className="font-bold text-lg">{address.fullName}</h4>
                  <p className="text-sm text-gray-600">
                    {address.phone}
                    {address.alternatePhone && `, ${address.alternatePhone}`}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{address.streetAddress}</p>
                  {address.landmark && (
                    <p className="text-gray-700">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p className="text-gray-700">
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address._id)}
                      disabled={setDefaultMutation.isLoading}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      {setDefaultMutation.isLoading
                        ? "Setting..."
                        : "Set as Default"}
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(address)}
                    disabled={deleteMutation.isLoading}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setShowAlert(true);
                      setAddressToDelete(address._id);
                    }}
                    className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* alert */}
      </div>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (addressToDelete) {
                  handleDelete(addressToDelete);
                }
              }}
              className="bg-black hover:bg-gray-800 focus-visible:ring-gray-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressComponent;
