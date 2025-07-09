// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Wallet, CreditCard } from "lucide-react";
// import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { getWallet } from "@/api/users/shop/walletmgt";
// import { useQuery } from "@tanstack/react-query";
// import toast from "react-hot-toast";

// const WalletInfo = ({ isOpen, onClose, subtotal, onPayNow }) => {
//   const navigate = useNavigate();
//   const userId = localStorage.getItem("userId");
//   const page = 1;
//   const limit = 10;

//   const { data: wallet } = useQuery({
//     queryKey: ["wallet"],
//     queryFn: () => getWallet(userId, page, limit),
//   });

//   const total = wallet?.wallet?.balance;
//   const balanceAmount = total - subtotal;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
//             <Wallet className="h-6 w-6 text-orange-500" />
//             Wallet Information
//           </DialogTitle>
//         </DialogHeader>
//         <div className="mt-4 space-y-6">
//           {/* Wallet Balance Section */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div className="flex items-center gap-3">
//               <CreditCard className="h-8 w-8 text-orange-500" />
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Current Balance
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   ₹{total?.toFixed(2)}
//                 </p>
//               </div>
//             </div>
//             <ArrowRightCircleIcon
//               className="h-6 w-6 text-gray-400"
//               onClick={() => navigate(`/profile/${userId}/wallet/${userId}`)}
//             />
//           </div>
//           {/* Additional Info */}
//           <div className="text-sm text-gray-600 space-y-2">
//             <p className="flex justify-between">
//               <span>Order Amount :</span>
//               <span className="font-medium">₹{subtotal}</span>
//             </p>
//             <p className="flex justify-between">
//               <span>Remaining Balance in your wallet :</span>
//               <span className="font-medium">₹{balanceAmount?.toFixed(2)}</span>
//             </p>
//           </div>
//           {/* Pay Now Button */}
//           <div className="mt-6">
//             <Button
//               type="button"
//               className="w-full text-white hover:bg-gray-700 transition-colors"
//               onClick={() => {
//                 if (balanceAmount <= 0) {
//               return   toast.error(
//                     "Oops! It looks like your wallet doesn't have enough funds for this payment."
//                   );
//                 }
//                 onPayNow();
//                 onClose();
//               }}
//             >
//               Pay Now
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default WalletInfo;


import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, CreditCard } from "lucide-react";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getWallet } from "@/api/users/shop/walletmgt";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const WalletInfo = ({ isOpen, onClose, subtotal, onPayNow }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const page = 1;
  const limit = 10;

  const { data: wallet, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWallet(userId, page, limit),
    enabled: !!userId, // Only fetch if userId exists
  });

  // Validations
  if (!userId) {
    toast.error("User not logged in. Please log in to proceed.");
    return null;
  }

  if (walletLoading) {
    return <div>Loading wallet information...</div>;
  }

  if (walletError) {
    toast.error("Failed to load wallet information. Please try again.");
    return null;
  }

  if (!wallet?.wallet) {
    toast.error("Wallet data not found. Please try again.");
    return null;
  }

  if (typeof subtotal !== "number" || subtotal < 0) {
    toast.error("Invalid order amount. Please check your cart.");
    return null;
  }

  const total = wallet?.wallet?.balance || 0;
  const balanceAmount = total - subtotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-orange-500" />
            Wallet Information
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Wallet Balance Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{total.toFixed(2)}
                </p>
              </div>
            </div>
            <ArrowRightCircleIcon
              className="h-6 w-6 text-gray-400"
              onClick={() => navigate(`/profile/${userId}/wallet/${userId}`)}
            />
          </div>
          {/* Additional Info */}
          <div className="text-sm text-gray-600 space-y-2">
            <p className="flex justify-between">
              <span>Order Amount:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Remaining Balance in your wallet:</span>
              <span className="font-medium">₹{balanceAmount.toFixed(2)}</span>
            </p>
          </div>
          {/* Pay Now Button */}
          <div className="mt-6">
            <Button
              type="button"
              className="w-full text-white hover:bg-gray-700 transition-colors"
              onClick={() => {
                if (total <= 0) {
                  toast.error("Your wallet balance is zero");
                  return;
                }
                if (balanceAmount < 0) {
                  toast.error(
                    `Oops! It looks like your wallet doesn't have enough funds for this payment. ₹${Math.abs(balanceAmount).toFixed(2)}`
                  );
                  return;
                }
                onPayNow();
                onClose();
              }}
              disabled={walletLoading || walletError}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletInfo;
