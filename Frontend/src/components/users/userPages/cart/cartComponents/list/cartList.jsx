import React from "react";
import { Minus, Plus, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import watchPlaceholder from "@/assets/watch image.jpg";

const CartList = ({
  items = [],
  onQuantityChange,
  setItemToDelete,
  setShowDeleteDialog,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-2/3 space-y-4">
      {/* Table for Desktop */}
      <div className="hidden md:block rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
          <thead className="bg-slate-50 dark:bg-[#0D121D]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-cinzel font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.18em]">
                Timepiece
              </th>
              <th className="px-6 py-4 text-center text-xs font-cinzel font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.18em]">
                Allocation
              </th>
              <th className="px-6 py-4 text-center text-xs font-cinzel font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.18em]">
                Quantity
              </th>
              <th className="px-6 py-4 text-right text-xs font-cinzel font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.18em]">
                Valuation
              </th>
              <th className="px-4 py-4 text-center text-xs text-slate-400">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => {
              const product = item.product || {};
              const originalPrice = item.originalPrice ?? product.price ?? 0;
              const discountedPrice = item.discountedPrice ?? item.price ?? originalPrice;
              const hasOffer = discountedPrice < originalPrice;
              const isAvailable = item.quantity <= (product.stock || 0);
              const img = product.images?.[0] || watchPlaceholder;

              return (
                <tr key={product._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Product Details */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => navigate(`/shop/product-view/${product._id}`)}
                        className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-[#080B11] p-2 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group shadow-sm"
                      >
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = watchPlaceholder;
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
                          {product.brand || "Haute Horlogerie"}
                        </span>
                        <h4
                          onClick={() => navigate(`/shop/product-view/${product._id}`)}
                          className="font-cinzel text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h4>
                        {item.offer && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            <Sparkles className="w-2.5 h-2.5" />
                            {item.offer.title} {item.offer.discountValue}% Privilege
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-5 text-center whitespace-nowrap">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400/90 font-mono font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        In Vault
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 font-mono font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Allocated
                      </span>
                    )}
                  </td>

                  {/* Stepper */}
                  <td className="px-6 py-5 text-center whitespace-nowrap">
                    <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-white/10 p-1">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(product._id, "decrease")}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(product._id, "increase")}
                        disabled={item.quantity >= (product.stock || 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-cinzel text-sm font-bold text-amber-700 dark:text-amber-300">
                        ₹{(discountedPrice * item.quantity).toLocaleString("en-IN")}
                      </div>
                      {hasOffer && (
                        <div className="text-[11px] text-slate-400 line-through">
                          ₹{(originalPrice * item.quantity).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Delete Action */}
                  <td className="px-4 py-5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setItemToDelete(product._id);
                        setShowDeleteDialog(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.03] hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove from Bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile Devices */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const product = item.product || {};
          const originalPrice = item.originalPrice ?? product.price ?? 0;
          const discountedPrice = item.discountedPrice ?? item.price ?? originalPrice;
          const hasOffer = discountedPrice < originalPrice;
          const img = product.images?.[0] || watchPlaceholder;

          return (
            <div
              key={product._id}
              className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-amber-500/20 p-4 space-y-3 shadow-sm dark:shadow-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  onClick={() => navigate(`/shop/product-view/${product._id}`)}
                  className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-[#080B11] p-1.5 border border-slate-200 dark:border-white/10 shrink-0"
                >
                  <img src={img} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">
                    {product.brand}
                  </span>
                  <h4
                    onClick={() => navigate(`/shop/product-view/${product._id}`)}
                    className="font-cinzel text-sm font-semibold text-slate-900 dark:text-white truncate"
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-cinzel text-sm font-bold text-amber-700 dark:text-amber-300">
                      ₹{(discountedPrice * item.quantity).toLocaleString("en-IN")}
                    </span>
                    {hasOffer && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{(originalPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-white/10 p-1">
                  <button
                    onClick={() => onQuantityChange(product._id, "decrease")}
                    disabled={item.quantity <= 1}
                    className="w-6 h-6 rounded bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs disabled:opacity-30 shadow-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-mono text-xs text-amber-700 dark:text-amber-300 font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(product._id, "increase")}
                    disabled={item.quantity >= (product.stock || 1)}
                    className="w-6 h-6 rounded bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs disabled:opacity-30 shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setItemToDelete(product._id);
                    setShowDeleteDialog(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartList;
