const offerSchema = require("../../models/offerSchema");
const productSchema = require("../../models/productSchema");
const {ProductOfferResponses } = require('../../enums/offer/offerenum')

//api call show offers in userside
const offershowing = async (req, res) => {
  try {
    const offershow = await offerSchema.find();

    if (!offershow) {
      return res.status(ProductOfferResponses.OFFER_NOT_FOUND.statusCode).json({
        message: ProductOfferResponses.OFFER_NOT_FOUND.message
      });
    }

    res.status(200).json(offershow);
  } catch (error) {
    res.status(ProductOfferResponses.FETCH_ERROR.statusCode).json({
      message: ProductOfferResponses.FETCH_ERROR.message
    });
  }
};

// API call to fetch all products
const products = async (req, res) => {
  try {
    const allproducts = await productSchema.find();

    res.status(200).json(allproducts);
  } catch (error) {
    res.status(ProductOfferResponses.FETCH_ERROR.statusCode).json({
      message: ProductOfferResponses.FETCH_ERROR.message
    });
  }
};

// API call to fetch product by ID
const productById = async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    return res.status(ProductOfferResponses.ID_REQUIRED.statusCode).json({
      message: ProductOfferResponses.ID_REQUIRED.message
    });
  }

  try {
    const product = await productSchema.findById({ _id: productId });

    if (!product) {
      return res.status(ProductOfferResponses.PRODUCT_NOT_FOUND.statusCode).json({
        message: ProductOfferResponses.PRODUCT_NOT_FOUND.message
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(ProductOfferResponses.FETCH_ERROR.statusCode).json({
      message: ProductOfferResponses.FETCH_ERROR.message
    });
  }
};

module.exports = {
  offershowing,
  products,
  productById,
};