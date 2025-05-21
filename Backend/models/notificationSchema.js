const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: String,
        required: true
      },
      recipientModel: {
        type: String,
        enum: ['User', 'Admin'], 
        default: 'User'
      },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Admin', 'System']
  },
  type: {
    type: String,
    required: true,
    enum: ['order_notification', 'order_update', 'return_request', 'status_update']
  },
  message: {
    type: String,
    required: true
  },
  relatedEntity: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    required: true,
    enum: ['Order', 'ReturnRequest']
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Notification', notificationSchema);