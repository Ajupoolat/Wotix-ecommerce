const cart = require("../../models/cartSchema");
const product = require("../../models/productSchema");
const category = require("../../models/categorySchema");
const wishlist = require("../../models/wishlistSchema");
const { calculateProductdiscount } = require("../../services/offerservice");
const mongoose = require("mongoose");
const userSchema = require("../../models/userSchema");
const { CartStatus, CartActions, CartMessages, QuantityLimits } = require('../../enums/cart/cartenaum');

const addToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      originalPrice,
      price,
      offerId,
      offerName,
      discountValue,
    } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!productId || !quantity || quantity < QuantityLimits.MIN_PER_PRODUCT || !userId) {
      return res.status(400).json({ success: false, message: CartMessages.INVALID_INPUT });
    }

    // Check if product exists and is available
    const productToAdd = await product.findById(productId);

    if (!productToAdd || productToAdd.isHidden || productToAdd.stock < 1) {
      return res.status(400).json({ success: false, message: CartStatus.PRODUCT_UNAVAILABLE });
    }

    // Check if category is available
    const productCategory = await category.findOne({
      categoryName: productToAdd.category,
    });
    if (!productCategory || productCategory.isHiddenCat) {
      return res.status(400).json({ success: false, message: CartStatus.CATEGORY_UNAVAILABLE });
    }

    // Find user's cart or create one if it doesn't exist
    let userCart = await cart.findOne({ user: userId });

    const PRODUCTID = new mongoose.Types.ObjectId(productId);

    const existingItem = userCart?.items.find(
      (item) => item.product.toString() === PRODUCTID.toString()
    );

    if (existingItem && existingItem.quantity >= QuantityLimits.MAX_PER_PRODUCT) {
      return res.status(400).json({
        success: false,
        message: CartMessages.MAX_QUANTITY,
      });
    } else if (quantity > QuantityLimits.MAX_PER_PRODUCT) {
      return res.status(400).json({
        success: false,
        message: CartMessages.MAX_QUANTITY,
      });
    }

    if (!userCart) {
      userCart = new cart({
        user: userId,
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = userCart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Product exists in cart, update quantity
      const newQuantity = userCart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > productToAdd.stock) {
        return res.status(400).json({
          success: false,
          message: CartStatus.INSUFFICIENT_STOCK,
        });
      }

      userCart.items[existingItemIndex].quantity = newQuantity;
      userCart.items[existingItemIndex].price = price || productToAdd.price;
      userCart.items[existingItemIndex].originalPrice =
        originalPrice || productToAdd.price;

      // Update offer info if provided
      if (offerId) {
        userCart.items[existingItemIndex].offer = {
          id: offerId,
          name: offerName,
          discountValue,
        };
      }
    } else {
      // Product doesn't exist in cart, add new item
      if (quantity > productToAdd.stock) {
        return res.status(400).json({
          success: false,
          message: CartStatus.INSUFFICIENT_STOCK,
        });
      }

      const newItem = {
        product: productId,
        quantity,
        price: price || productToAdd.price,
        originalPrice: originalPrice || productToAdd.price,
      };

      if (offerId) {
        newItem.offer = {
          id: offerId,
          name: offerName,
          discountValue,
        };
      }

      userCart.items.push(newItem);
    }

    // Recalculate totals
    userCart.totalItems = userCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    userCart.totalPrice = userCart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    // Remove from wishlist if exists
    await wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { product: productId } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: CartMessages.ADD_SUCCESS,
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.id;
    const email = req.params.email;

    const user = await userSchema.findById(userId);

    if (user.email !== email) {
      return res.status(403).json({
        message: "This order does not exist or you don’t have permission to view it.",
      });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: CartMessages.INVALID_INPUT });
    }

    const userCart = await cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name price images stock isHidden brand categoryRef color size strap_material",
      populate: {
        path: "categoryRef",
        select: "isHiddenCat",
      },
    });

    if (!userCart) {
      return res.status(200).json({
        success: true,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    // Filter and update items
    const validItems = await Promise.all(
      userCart.items
        .filter(
          (item) =>
            item.product &&
            !item.product.isHidden &&
            (!item.product.categoryRef ||
              !item.product.categoryRef.isHiddenCat) &&
            item.product.stock > 0
        )
        .map(async (item) => {
          const product = item.product;
          const discountData = await calculateProductdiscount(product);

          // Adjust quantity to not exceed stock, ensuring at least MIN_PER_PRODUCT
          const quantity = Math.min(item.quantity, product.stock, QuantityLimits.MAX_PER_PRODUCT);

          return {
            product: {
              _id: product._id,
              name: product.name,
              images: product.images,
              stock: product.stock,
              brand: product.brand,
              categoryRef: product.categoryRef,
              color: product.color,
              size: product.size,
              strap_material: product.strap_material,
            },
            quantity,
            originalPrice: discountData.originalPrice,
            discountedPrice: discountData.discountedPrice,
            offer: discountData.offer,
          };
        })
    );

    // Update cart if items changed
    if (
      validItems.length !== userCart.items.length ||
      validItems.some(
        (item, index) => item.quantity !== userCart.items[index]?.quantity
      )
    ) {
      userCart.items = validItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.discountedPrice,
        originalPrice: item.originalPrice,
        offer: item.offer ? item.offer._id : null,
      }));
      userCart.totalItems = validItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      userCart.totalPrice = validItems.reduce(
        (total, item) => total + item.discountedPrice * item.quantity,
        0
      );

      await userCart.save();
    }

    res.status(200).json({
      success: true,
      items: validItems,
      totalItems: userCart.totalItems,
      totalPrice: userCart.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.id;

    const userCart = await cart.findOne({ user: userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: CartStatus.CART_NOT_FOUND });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const itemIndex = userCart.items.findIndex((item) =>
      item.product.equals(productObjectId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: CartStatus.PRODUCT_NOT_IN_CART });
    }

    // Remove the item
    userCart.items.splice(itemIndex, 1);

    // Recalculate totals
    userCart.totalItems = userCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    userCart.totalPrice = userCart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: CartMessages.REMOVE_SUCCESS,
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { action } = req.body;
    const userId = req.params.id;

    if (![CartActions.INCREASE, CartActions.DECREASE].includes(action)) {
      return res.status(400).json({ success: false, message: CartMessages.INVALID_ACTION });
    }

    const userCart = await cart.findOne({ user: userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: CartStatus.CART_NOT_FOUND });
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Find the item
    const itemIndex = userCart.items.findIndex((item) =>
      item.product.equals(productObjectId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: CartStatus.PRODUCT_NOT_IN_CART });
    }

    const cartItem = userCart.items[itemIndex];
    const productDetails = await product.findById(cartItem.product);
    if (
      !productDetails ||
      productDetails.isHidden ||
      productDetails.stock < 1
    ) {
      return res.status(400).json({ success: false, message: CartStatus.PRODUCT_UNAVAILABLE });
    }

    // Check category availability
    const productCategory = await category.findOne({
      categoryName: productDetails.category,
    });
    if (!productCategory || productCategory.isHiddenCat) {
      return res.status(400).json({ success: false, message: CartStatus.CATEGORY_UNAVAILABLE });
    }

    if (action === CartActions.INCREASE) {
      // Check if quantity would exceed maximum limit
      if (cartItem.quantity >= QuantityLimits.MAX_PER_PRODUCT) {
        return res.status(400).json({
          success: false,
          message: CartMessages.MAX_QUANTITY,
        });
      }

      if (cartItem.quantity + 1 > productDetails.stock) {
        return res.status(400).json({
          success: false,
          message: CartStatus.INSUFFICIENT_STOCK,
        });
      }
      cartItem.quantity += 1;
    } else {
      if (cartItem.quantity - 1 < QuantityLimits.MIN_PER_PRODUCT) {
        userCart.items.splice(itemIndex, 1);
      } else {
        cartItem.quantity -= 1;
      }
    }

    // Recalculate totals
    userCart.totalItems = userCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    userCart.totalPrice = userCart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: CartMessages.UPDATE_SUCCESS,
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.params.id;

    const userCart = await cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true }
    );

    if (!userCart) {
      return res.status(404).json({ success: false, message: CartStatus.CART_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      message: CartMessages.CLEAR_SUCCESS,
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
};