const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  offerType: {
    type: String,
    enum: ['product', 'category'],
    required: true
  },
  offerNumber:{
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
  },
  discountType: {
    type: String, 
    enum: ['percentage'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],


  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Offer", offerSchema);
