import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addaddress, editaddress } from '../../../../api/users/profile/profilemgt';
import { X } from 'lucide-react'; // Using lucide-react for icons
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Using shadcn/ui dialog components
import { Button } from "@/components/ui/button"; // Using shadcn/ui button
import { Input } from "@/components/ui/input"; // Using shadcn/ui input
import { Label } from "@/components/ui/label"; // Using shadcn/ui label
import { Textarea } from "@/components/ui/textarea"; // Using shadcn/ui textarea
import { Checkbox } from "@/components/ui/checkbox"; // Using shadcn/ui checkbox

const AddressFormModal = ({ 
  showForm, 
  setShowForm, 
  isEditing, 
  editingAddress 
}) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');

  // Initialize form data
  const initialFormData = {
    fullName: '',
    phone: '',
    alternatePhone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Reset form when editing changes
  useEffect(() => {
    if (isEditing && editingAddress) {
      setFormData({
        fullName: editingAddress.fullName || '',
        phone: editingAddress.phone || '',
        alternatePhone: editingAddress.alternatePhone || '',
        streetAddress: editingAddress.streetAddress || '',
        landmark: editingAddress.landmark || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        postalCode: editingAddress.postalCode || '',
        country: editingAddress.country || 'India',
        isDefault: editingAddress.isDefault || false
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [isEditing, editingAddress]);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  // Add address mutation
  const addMutation = useMutation({
    mutationFn: (data) => addaddress(data),
    onSuccess: () => {
      toast.success('Address added successfully');
      queryClient.invalidateQueries(['userAddresses', userId]);
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add address');
    }
  });

  // Edit address mutation
  const editMutation = useMutation({
    mutationFn: (data) => editaddress(editingAddress._id, data),
    onSuccess: () => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries(['userAddresses', userId]);
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update address');
    }
  });

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const addressData = {
      ...formData,
      userId: userId
    };

    if (isEditing) {
      editMutation.mutate(addressData);
    } else {
      addMutation.mutate(addressData);
    }
  };

  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <button
            onClick={() => setShowForm(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name*</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
            
            {/* Alternate Phone */}
            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Street Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="streetAddress">Street Address*</Label>
              <Textarea
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                className={errors.streetAddress ? 'border-red-500' : ''}
              />
              {errors.streetAddress && <p className="text-sm text-red-500">{errors.streetAddress}</p>}
            </div>
            
            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                type="text"
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>
            
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City/Town*</Label>
              <Input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
            
            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
            
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code*</Label>
              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
            </div>
            
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country*</Label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => {
                setFormData(prev => ({ ...prev, isDefault: checked }));
              }}
            />
            <Label htmlFor="isDefault">Set as default address</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isLoading || editMutation.isLoading}
            >
              {isEditing ? 
                (editMutation.isLoading ? 'Updating...' : 'Update Address') : 
                (addMutation.isLoading ? 'Saving...' : 'Save Address')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;