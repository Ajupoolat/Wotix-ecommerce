const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'role'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    type: {
      type: String,
      enum: ['return_request', 'return_approved','cancalled','delivered'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ role: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
