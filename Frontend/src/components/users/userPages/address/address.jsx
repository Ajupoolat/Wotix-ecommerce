import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getaddress,
  addaddress,
  deleteaddress,
  editaddress,
} from "@/api/users/profile/profilemgt";
import { useParams, useNavigate } from "react-router-dom";
import LoaderSpinner from "@/components/common/spinner";
import Restricter from "@/components/common/restricter";
import Breadcrumbs from "@/components/common/breadCrums";
import AlertBox from "@/components/common/alertBox";
import AddressForm from "./addressComponent/forms/addressForms";
import AddressList from "./addressComponent/List/addressList";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Plus, X, MapPin } from "lucide-react";

const AddressComponent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  // Mutations with v5 object queryKey syntax
  const addMutation = useMutation({
    mutationFn: (addressData) => addaddress(addressData),
    onSuccess: () => {
      toast.success("Delivery destination added to vault.");
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
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
      toast.success("Destination updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
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
      toast.success("Destination removed from vault.");
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: ({ idadd, data }) =>
      editaddress(idadd, { ...data, isDefault: true }),
    onSuccess: () => {
      toast.success("Primary vault destination configured.");
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
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
    setIsEditing(!!address);
    setShowForm(true);

    setTimeout(() => {
      const formEl = document.getElementById("addressForm");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <Breadcrumbs
        items={[
          { label: "Home", link: "/" },
          { label: "Collector Vault", link: `/profile/${userId}` },
          { label: "Delivery Destinations" },
        ]}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5 gap-4">
          <div>
            <span className="text-xs uppercase font-cinzel tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block mb-1">
              White-Glove Shipping
            </span>
            <h1 className="text-3xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Delivery Destinations
            </h1>
          </div>

          <button
            onClick={toggleForm}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showForm
                ? "bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
            }`}
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </>
            )}
          </button>
        </div>

        {/* Address Form */}
        {showForm && (
          <div id="addressForm" className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/30 p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors">
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
              isSubmitting={addMutation.isPending || editMutation.isPending}
              onCancel={resetForm}
            />
          </div>
        )}

        {/* Address List */}
        <AddressList
          addresses={addresses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={setDefaultAddress}
          isDeleting={deleteMutation.isPending}
          isSettingDefault={setDefaultMutation.isPending}
        />
      </main>

      {/* Confirmation alert */}
      <AlertBox
        open={showAlert}
        onOpenChange={setShowAlert}
        title="Remove Delivery Destination"
        description="Are you certain you wish to delete this saved address from your vault?"
        confirmLabel="Confirm Delete"
        onConfirm={confirmDelete}
      />

      <Footer />
    </div>
  );
};

export default AddressComponent;
