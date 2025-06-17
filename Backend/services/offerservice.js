const Offers = require("../models/offerSchema");

const calculateProductdiscount = async (product) => {
  if (!product) {
    throw new Error("product not found");
  }

  const now = new Date();

  const offers = await Offers.find({
    isActive: true,
    $or: [
      { applicableProducts: product._id },
      { applicableCategories: product.categoryRef },
    ],
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!offers.length) {
    return {
      originalPrice: product.price,
      discountedPrice: product.price,
      offer: null,
    };
  }

  const bestOffer = offers.reduce((max, offer) => {
    return offer.discountValue > max.discountValue ? offer : max;
  });

  const discountedPrice = product.price * (1 - bestOffer.discountValue / 100);

  return {
    originalPrice: product.price,
    discountedPrice: Number(discountedPrice.toFixed(2)),
    offer: bestOffer
      ? {
          _id: bestOffer._id,
          title: bestOffer.title,
          discountValue: bestOffer.discountValue,
        }
      : null,
  };
};

module.exports = {calculateProductdiscount}