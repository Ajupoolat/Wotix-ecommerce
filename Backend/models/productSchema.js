const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  images: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 1 && arr.length <= 3,
      message: "A product must have 1 to 3 images",
    },
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  stock: { type: Number, required: true },
  status: { type: Boolean, default: true },
  strap_material: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Use Number instead of Double
  size: { type: String, required: true },
  brand: { type: String, required: true },
  color: { type: String, required: true },
  isHidden:{type:Boolean,default:false},
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: false 
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);