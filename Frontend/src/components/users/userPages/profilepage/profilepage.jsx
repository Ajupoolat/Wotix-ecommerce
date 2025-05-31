import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";
import { Footer } from "@/components/common/footer";
import LoaderSpinner from "@/components/common/spinner";
import {
  UserIcon,
  PencilIcon,
  MapPinIcon,
  KeyIcon,
  ShoppingBagIcon,
  WalletIcon,
  CreditCardIcon,
  EnvelopeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import ErrorCommon from "@/components/common/CommonError";
import { useNavigate, useParams } from "react-router-dom";
import { viewprofile } from "@/api/users/profile/profilemgt";
import Restricter from "@/components/common/restricter";
import Breadcrumbs from "@/components/common/breadCrums";

const ProfilePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const { id } = useParams();
  const email = localStorage.getItem("email");

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => viewprofile(id, email),
  });

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError && error.message !== `Oops this page is not get !`) {
    return <ErrorCommon />;
  }

  if (error && error.message === `Oops this page is not get !`) {
    return <Restricter />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <IconsArea />
      {/* Navigation */}
      <Navbar />
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ label: "Home", link: "/" }, { label: "My Profile" }]}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-gray-700 to-black px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>
                <p className="text-gray-200 mt-1">
                  Manage your personal information and preferences
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-300">Welcome back,</span>
                <span className="font-medium">
                  {profileData.firstName || username}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Management Tabs */}
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid grid-cols-4 rounded-none border-b bg-gray-50 h-15">
              <TabsTrigger
                value="personal-info"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Personal Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate(`/address/${id}`)}
              >
                <MapPinIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Address</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate("/orderslist")}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center gap-2 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => navigate(`wallet/${id}`)}
              >
                <WalletIcon
                  className="w-5 h-5"
                  onClick={() => navigate(`wallet/${id}`)}
                />
                <span
                  className="hidden sm:inline"
                  onClick={() => navigate(`wallet/${id}`)}
                >
                  Wallet
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info" className="mt-0">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h2>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-black text-black hover:bg-gray-50"
                    onClick={() => navigate(`/profile/:id/edit-profile/${id}`)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Name
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {profileData.firstName} {profileData.lastName}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <EnvelopeIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Email
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {profileData.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <UserPlusIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Refferal Code
                        </h3>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: "12px" }}>
                        Get 100/- rupees for Reffer a User. Share this refferal
                        code to your freind
                      </p>
                      <p className="text-gray-800 font-medium">
                        {profileData.refferalId || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCardIcon className="w-5 h-5 text-black" />
                        <h3 className="text-sm font-medium text-gray-500">
                          Account Type
                        </h3>
                      </div>
                      <p className="text-gray-800 font-medium">Standard User</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-black text-black hover:bg-gray-50"
                    onClick={() => navigate(`/changePassword/${id}`)}
                  >
                    <KeyIcon className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ProfilePage;
