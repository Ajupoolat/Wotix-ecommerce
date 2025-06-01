import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "react-hot-toast";

const OrderSummary = ({
  cart,
  appliedCoupons,
  subtotal,
  totalDiscount,
  shipping,
  finalTotal,
  availableCoupons,
  isApplyingCoupon,
  couponForm,
  applyCouponMutate,
  countapply,
  handleRemoveCoupon,
  couponError,
}) => {
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-medium mb-4">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart?.items?.map((item) => (
            <div
              key={item.product._id}
              className="flex items-start border-b pb-4"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.product.brand}
                </p>
                <div className="flex flex-col">
                  {item.discountedPrice < item.originalPrice ? (
                    <>
                      <span className="font-bold text-green-600">
                        ₹{(item.discountedPrice * item.quantity).toLocaleString("en-IN")}/-
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        ₹{(item.originalPrice * item.quantity).toLocaleString("en-IN")}/-
                      </span>
                    </>
                  ) : (
                    <span className="font-bold">
                      ₹{(item.discountedPrice * item.quantity).toLocaleString("en-IN")}/-
                    </span>
                  )}
                  {item.offer && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded mt-1 inline-block">
                      {item.offer.title} {item.offer.discountValue}% OFF
                    </span>
                  )}
                </div>
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <div className="w-24 h-24">
                <img
                  src={item.product.images?.[0] || "https://via.placeholder.com/100"}
                  alt={item.product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="mb-6">
          {availableCoupons?.length > 0 && !appliedCoupons.length && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium mb-2">
                Available Coupons:
              </p>
              <ul className="space-y-2">
                {availableCoupons.map((coupon) => (
                  <li
                    key={coupon._id}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => {
                      if (countapply <= 0) {
                        couponForm.setValue("couponCode", coupon.code);
                        applyCouponMutate(coupon.code);
                      } else {
                        toast.error("Only one coupon can be applied");
                      }
                    }}
                  >
                    <div>
                      <span className="font-bold">{coupon.code}</span>
                      {coupon.discountType === "flat"
                        ? ` (₹${coupon.discountValue} off)`
                        : ` (${coupon.discountValue}% off)`}
                      {coupon.minPurchaseAmount > 0 && (
                        <span className="block text-xs">
                          Min. purchase: ₹{coupon.minPurchaseAmount}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Form {...couponForm}>
            <form
              onSubmit={couponForm.handleSubmit((data) => {
                if (countapply <= 0) {
                  applyCouponMutate(data.couponCode);
                } else {
                  toast.error("Only one coupon can be applied");
                }
              })}
              className="flex"
            >
              <FormField
                control={couponForm.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        className="bg-gray-200 border-0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        disabled={isApplyingCoupon}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="ml-2 bg-black text-white hover:bg-gray-800"
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </Button>
            </form>
          </Form>
          {appliedCoupons.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Applied Coupons:</h4>
              <ul className="space-y-2">
                {appliedCoupons.map((coupon) => (
                  <li
                    key={coupon._id}
                    className="flex justify-between items-center bg-gray-200 p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">{coupon.code}</span> -
                      {coupon.discountType === "flat" ? (
                        <span> ₹{coupon.discountValue} off</span>
                      ) : (
                        <span> {coupon.discountValue}% off</span>
                      )}
                      {coupon.minPurchaseAmount > 0 && (
                        <span className="block text-xs">
                          Min. purchase: ₹{coupon.minPurchaseAmount}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCoupon(coupon._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {couponError && (
            <p className="text-red-500 text-sm mt-2">{couponError}</p>
          )}
        </div>

        {/* Price Summary */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}/-</span>
          </div>
          {appliedCoupons.length > 0 && (
            <div className="flex justify-between py-2">
              <span>Discount</span>
              <span className="text-green-600">
                -₹{totalDiscount.toLocaleString("en-IN")}/-
              </span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span>Shipping</span>
            <span>₹{shipping.toLocaleString("en-IN")}/-</span>
          </div>
          <div className="flex justify-between py-2 border-t pt-2">
            <span className="font-medium">Total</span>
            <span className="font-bold">
              ₹{finalTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/-
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;