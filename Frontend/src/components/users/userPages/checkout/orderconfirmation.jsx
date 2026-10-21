import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconsArea from "@/components/common/IconsArea";
import Navbar from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import watchPlaceholder from "@/assets/watch image.jpg";
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, cartItems } = location.state || {};
  const shippingFee = 50;

  // Merge order products with cart items to get images
  const productsWithImages = order?.products?.map((orderProduct) => {
    const cartItem = cartItems?.find(
      (item) => item.product._id === orderProduct.productId
    );
    return {
      ...orderProduct,
      images: cartItem?.product.images || [],
    };
  });

  // Calculate estimated delivery date (5-7 days from createdAt)
  const calculateEstimatedDelivery = (createdAt) => {
    const createdDate = createdAt ? new Date(createdAt) : new Date();
    const minDeliveryDate = new Date(createdDate);
    const maxDeliveryDate = new Date(createdDate);
    minDeliveryDate.setDate(createdDate.getDate() + 4);
    maxDeliveryDate.setDate(createdDate.getDate() + 7);
    return `${minDeliveryDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    })} – ${maxDeliveryDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // Calculate offer discount per product
  const calculateOfferDiscount = (product) => {
    if (product.originalPrice && product.price < product.originalPrice) {
      return (product.originalPrice - product.price) * product.quantity;
    }
    return 0;
  };

  const totalOfferDiscount = productsWithImages?.reduce(
    (sum, item) => sum + calculateOfferDiscount(item),
    0
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
        <IconsArea />
        <Navbar />
        <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
          <Package className="w-12 h-12 text-amber-600 dark:text-amber-400/60 mx-auto" />
          <h1 className="font-cinzel text-2xl font-bold text-slate-900 dark:text-white">
            No Active Order Found
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Please place an order through our vault checkout to view verified confirmation details.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
          >
            Explore Timepieces
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-100 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <IconsArea />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header Hero */}
        <div className="rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-[#0D1628] dark:via-[#0B0F17] dark:to-[#0B0F17] border border-amber-500/30 p-8 sm:p-12 text-center shadow-xl dark:shadow-2xl space-y-4 relative overflow-hidden transition-colors">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-cinzel font-semibold uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 block">
              Haute Horlogerie Acquisition Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-slate-900 dark:text-white tracking-wide">
              Thank You for Your Order
            </h1>
            <p className="text-sm font-mono text-slate-600 dark:text-slate-300">
              Vault Reference #{order.orderNumber || order._id}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-sans">
            <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              Insured Armored Transit: <strong>{calculateEstimatedDelivery(order.createdAt)}</strong>
            </span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="mt-8 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans shadow-sm transition-colors">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Order Date
              </span>
              <span className="text-slate-900 dark:text-white font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Payment Channel
              </span>
              <span className="text-slate-900 dark:text-white font-medium uppercase font-mono">
                {order.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Payment Status
              </span>
              <span
                className={`font-semibold uppercase tracking-wider text-[11px] ${
                  order.paymentStatus ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {order.paymentStatus ? "Verified / Paid" : "Pending COD"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Fulfillment Status
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                {order.status || "Processing in Atelier"}
              </span>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-2 text-xs shadow-sm transition-colors">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
              Insured Delivery Destination
            </h3>
            <div className="text-slate-600 dark:text-slate-300 space-y-1 pt-1">
              <p className="text-slate-900 dark:text-white font-semibold text-sm">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.streetAddress}</p>
              {order.shippingAddress.landmark && (
                <p>Near {order.shippingAddress.landmark}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="font-mono text-slate-500 dark:text-slate-400 pt-1">
                Contact: {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-4 shadow-sm transition-colors">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
              Allocated Timepieces
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-white/5">
              {productsWithImages?.map((item, index) => {
                const img = item.images?.[0] || watchPlaceholder;
                return (
                  <div key={index} className="py-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[#080B11] p-1.5 border border-slate-200 dark:border-white/10 shrink-0">
                      <img
                        src={img}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow"
                        onError={(e) => {
                          e.target.src = watchPlaceholder;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-cinzel text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>Quantity: {item.quantity}</span>
                        <span className="font-cinzel text-amber-800 dark:text-amber-300 font-bold">
                          ₹{(item.discountedPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/5 p-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-sm transition-colors">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300 pb-2 border-b border-slate-200 dark:border-white/5">
              Financial Summary
            </h3>
            <div className="flex justify-between pt-1">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white font-medium">
                ₹{Number(order.subtotal).toLocaleString("en-IN")}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Voucher Privileges Applied</span>
                <span className="font-mono font-semibold">
                  -₹{Number(order.discountAmount).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insured Transit</span>
              <span className="font-mono text-slate-900 dark:text-white font-medium">
                ₹{Number(shippingFee).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex justify-between items-baseline">
              <span className="font-cinzel text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-semibold">
                Total Paid / Payable
              </span>
              <span className="font-cinzel text-2xl font-bold text-amber-800 dark:text-amber-300">
                ₹{Number(order.finalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate("/orderslist")}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-[0.18em] shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View All Orders in Vault</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="flex-1 py-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#0D121D] dark:hover:bg-[#141C2E] text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30 font-cinzel font-semibold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Exploring</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderConfirmationPage;
