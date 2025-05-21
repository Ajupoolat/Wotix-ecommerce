const userSchema = require("../../models/userSchema");
const wishlist = require("../../models/wishlistSchema");
const {calculateProductdiscount} = require('../../services/offerservice')
const {
  WishlistStatus,
  ResponseStatus,
  ErrorMessages
} = require('../../enums/wishlist/wislistenum')

const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productid;
    const userId = req.params.id;

    if (!productId || !userId) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.INVALID_INPUT,
      });
    }

    const updatedWishlist = await wishlist
      .findOneAndUpdate(
        { user: userId },
        { $pull: { products: { product: productId } } },
        { new: true }
      )
      .populate("products.product", "name price images");

    if (!updatedWishlist) {
      return res.status(ResponseStatus.NOT_FOUND).json({ 
        success: false, 
        status: WishlistStatus.WISHLIST_NOT_FOUND,
        message: "Wishlist not found" 
      });
    }

    res.status(ResponseStatus.SUCCESS).json({
      success: true,
      status: WishlistStatus.SUCCESS,
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(ResponseStatus.SERVER_ERROR).json({ 
      success: false, 
      message: ErrorMessages.SERVER_ERROR, 
      error: error.message 
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productid;
    const userId = req.params.id;

    if (!productId || !userId) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        message: ErrorMessages.INVALID_INPUT,
      });
    }

    const existingItem = await wishlist.findOne({
      user: userId,
      "products.product": productId,
    });

    if (existingItem) {
      return res.status(ResponseStatus.BAD_REQUEST).json({ 
        success: false, 
        status: WishlistStatus.PRODUCT_ALREADY_EXISTS,
        message: "Product already in wishlist" 
      });
    }

    const updatedWishlist = await wishlist
      .findOneAndUpdate(
        { user: userId },
        { $addToSet: { products: { product: productId } } },
        { upsert: true, new: true }
      )
      .populate("products.product", "name price images");

    res.status(ResponseStatus.SUCCESS).json({
      success: true,
      status: WishlistStatus.SUCCESS,
      message: "Product added to wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(ResponseStatus.SERVER_ERROR).json({ 
      success: false, 
      message: ErrorMessages.SERVER_ERROR, 
      error: error.message 
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.id;
    const email = req.params.email;

    const user = await userSchema.findById(userId);

    if (user.email !== email) {
      return res.status(ResponseStatus.FORBIDDEN).json({
        success: false,
        message: ErrorMessages.UNAUTHORIZED_ACCESS,
      });
    }

    if (!userId) {
      return res.status(ResponseStatus.BAD_REQUEST).json({ 
        success: false, 
        message: ErrorMessages.INVALID_INPUT 
      });
    }

    const userWishlist = await wishlist.findOne({ user: userId }).populate({
      path: 'products.product',
      select: 'name price images brand category stock categoryRef color size strap_material isHidden',
      match: { isHidden: false },
    });

    if (!userWishlist) {
      return res.status(ResponseStatus.SUCCESS).json({
        success: true,
        status: WishlistStatus.WISHLIST_NOT_FOUND,
        message: 'No wishlist found',
        products: [],
      });
    }

    const productsWithDiscount = await Promise.all(
      userWishlist.products
        .filter((item) => item.product !== null)
        .map(async (item) => {
          const product = item.product;
          const discountData = await calculateProductdiscount(product);
          return {
            ...product.toObject(),
            originalPrice: discountData.originalPrice,
            discountedPrice: discountData.discountedPrice,
            offer: discountData.offer,
            addedAt: item.addedAt,
          };
        })
    );

    res.status(ResponseStatus.SUCCESS).json({
      success: true,
      status: WishlistStatus.SUCCESS,
      products: productsWithDiscount,
    });
  } catch (error) {
    res.status(ResponseStatus.SERVER_ERROR).json({ 
      success: false, 
      message: ErrorMessages.SERVER_ERROR, 
      error: error.message 
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};