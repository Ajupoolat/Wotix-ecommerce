const mongoose = require("mongoose");
const {TransactionStatus,TransactionType,ReferenceType,WalletStatus} = require('../enums/wallet/walletenums')


const walletSchema = new mongoose.Schema({
    balance: { 
        type: Number, 
        default: 0 
    },
    transactions: [{
        type: { 
            type: String, 
            enum: Object.values(TransactionType), 
            required: true 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        description: String,
        date: { 
            type: Date, 
            default: Date.now 
        },
        status: {
            type: String,
            enum: Object.values(TransactionStatus),
            default: TransactionStatus.COMPLETED
        },
        referenceType: {
            type: String,
            enum: Object.values(ReferenceType),
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'transactions.referenceType' // Dynamic reference based on referenceType
        }
    }],
    userID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    status: { 
        type: Boolean, 
        default: WalletStatus.ACTIVE 
    }
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);