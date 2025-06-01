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
import LoaderSpinner from "@/components/common/spinner";
import Restricter from "@/components/common/restricter";
import Breadcrumbs from "@/components/common/breadCrums";
import AlertBox from "@/components/common/alertBox";
import AddressForm from "../address/addressComponent/forms/addressForms"; // Existing import
import AddressList from "../address/addressComponent/List/addressList"; // Import the new component

const AddressComponent = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const { id } = useParams();
  const userId = id;

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
    setIsEditing(false);
    setCurrentAddress(null);
  };

  const handleEdit = (address) => {
    setCurrentAddress(address);
    setIsEditing(!!address); // Set isEditing to true if address exists, false for new address
    setShowForm(true);

    setTimeout(() => {
      document
        .getElementById("addressForm")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (idadd) => {
    setShowAlert(true);
    setAddressToDelete(idadd);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      deleteMutation.mutate(addressToDelete);
      setShowAlert(false);
    }
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
    return <LoaderSpinner />;
  }

  if (isError) {
    return <Restricter />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="w-75 -ml-50 h-20">
        <Breadcrumbs
          items={[
            { label: "Home", link: "/" },
            { label: "My Profile", link: `/profile/${userId}` },
            { label: "My Address" },
          ]}
        />
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
      {/* Use the reusable AddressForm component */}
      {showForm && (
        <AddressForm
          onSubmit={onSubmit}
          defaultValues={
            isEditing
              ? {
                  fullName: currentAddress.fullName,
                  phone: currentAddress.phone,
                  alternatePhone: currentAddress.alternatePhone || "",
                  streetAddress: currentAddress.streetAddress,
                  landmark: currentAddress.landmark || "",
                  city: currentAddress.city,
                  state: currentAddress.state,
                  postalCode: currentAddress.postalCode,
                  country: currentAddress.country,
                  isDefault: currentAddress.isDefault,
                }
              : undefined
          }
          isEditing={isEditing}
          isSubmitting={addMutation.isLoading || editMutation.isLoading}
          onCancel={resetForm}
        />
      )}
      {/* Use the reusable AddressList component */}
      <AddressList
        addresses={addresses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={setDefaultAddress}
        isDeleting={deleteMutation.isLoading}
        isSettingDefault={setDefaultMutation.isLoading}
      />
      {/* Alert for delete */}
      <AlertBox
        open={showAlert}
        onOpenChange={setShowAlert}
        title="Confirm Address Deletion"
        description="Are you sure you want to delete this address?"
        confirmLabel="Confirm delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AddressComponent;
