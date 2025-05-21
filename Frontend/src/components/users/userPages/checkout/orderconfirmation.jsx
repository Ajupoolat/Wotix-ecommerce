import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    const createdDate = new Date(createdAt);
    const minDeliveryDate = new Date(createdDate);
    const maxDeliveryDate = new Date(createdDate);
    minDeliveryDate.setDate(createdDate.getDate() + 5);
    maxDeliveryDate.setDate(createdDate.getDate() + 7);
    return `${minDeliveryDate.toLocaleDateString()} - ${maxDeliveryDate.toLocaleDateString()}`;
  };

  // Calculate offer discount per product
  const calculateOfferDiscount = (product) => {
    if (product.originalPrice && product.price < product.originalPrice) {
      return (product.originalPrice - product.price) * product.quantity;
    }
    return 0;
  };

  // Total offer discount
  const totalOfferDiscount = productsWithImages?.reduce(
    (sum, item) => sum + calculateOfferDiscount(item),
    0
  );

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            No Order Details Found
          </h1>
          <p className="text-gray-500 mb-6">
            Please place an order to see the confirmation details.
          </p>
          <button
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => (window.location.href = "/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 py-8 px-6 text-center">
          <h1 className="text-3xl font-bold text-white">
            Thank You for Your Order!
          </h1>
          <p className="mt-2 text-amber-100">
            Order #{order.orderNumber} has been placed successfully
          </p>
          <p className="mt-1 text-amber-100">
            Estimated Delivery: {calculateEstimatedDelivery(order.createdAt)}
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-8">
          {/* Order Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-700">Order Number</h3>
                <p className="text-gray-600">{order.orderNumber}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Order Date</h3>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Payment Method</h3>
                <p className="text-gray-600 capitalize">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Payment Status</h3>
                <p
                  className={`text-gray-600 capitalize ${
                    order.paymentStatus ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {order.paymentStatus ? "Paid" : "Pending"}
                </p>
              </div>
              {order.razorpayPaymentId && (
                <div>
                  <h3 className="font-medium text-gray-700">Transaction ID</h3>
                  <p className="text-gray-600">{order.razorpayPaymentId}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-700">Order Status</h3>
                <p className="text-green-500 capitalize">{order.status}</p>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Shipping Address
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">
                {order.shippingAddress.streetAddress}
              </p>
              {order.shippingAddress.landmark && (
                <p className="text-gray-600">
                  {order.shippingAddress.landmark}
                </p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
              <p className="mt-2 text-gray-600">
                Phone: {order.shippingAddress.phone}
              </p>
            </div>
          </section>

          {/* Order Items */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order Items
            </h2>
            <div className="space-y-6">
              {productsWithImages?.map((item, index) => (
                <div key={index} className="flex border-b pb-4 items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    {item.brand && (
                      <p className="text-sm text-gray-600">{item.brand}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    {item.originalPrice > item.price && (
                      <p className="text-sm text-green-600">
                        Offer Discount: ₹
                        {(
                          (item.originalPrice - item.price) *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                    )}
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        Unit Price: ₹{item.discountedPrice.toLocaleString()}
                      </p>
                      <p className="font-medium text-gray-800">
                        Total: ₹
                        {(
                          item.discountedPrice * item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Coupon and Discount Details */}
          {order.coupons?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Coupons & Discounts
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  Coupon Applied: {order.coupons[0]._id}
                </p>
                <p className="text-green-600 font-medium">
                  Coupon Discount: ₹{order.discountAmount.toLocaleString()}
                </p>
                {totalOfferDiscount > 0 && (
                  <p className="text-green-600 font-medium">
                    Offer Discount: ₹{totalOfferDiscount.toLocaleString()}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Cancellation Policy
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                You can cancel this order within{" "}
                {order.cancellationPolicy.cancellationWindowHours} hours of
                placement.
              </p>
              <p className="text-gray-600">
                Partial cancellations are{" "}
                {order.cancellationPolicy.allowPartialCancellations
                  ? "allowed."
                  : "not allowed."}
              </p>
            </div>
          </section>

          {/* Price Breakdown */}
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Price Breakdown
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              {totalOfferDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Offer Discount</span>
                  <span>-₹{totalOfferDiscount.toLocaleString()}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t text-gray-800">
                <span>Total</span>
                <span>₹{order.finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex-1"
              onClick={() => navigate("/orderslist")}
            >
              View All Orders
            </button>
            <button
              className="px-6 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors flex-1"
              onClick={() => (window.location.href = "/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
