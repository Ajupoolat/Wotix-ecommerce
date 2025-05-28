const Wallet = require("../../models/wallet");
const Order = require("../../models/orderSchema");
const mongoose = require("mongoose");
const orderSchema = require("../../models/orderSchema");
const userSchema = require("../../models/userSchema");
const {TransactionType,
  ReferenceType,
  TransactionStatus,
  WalletStatus } = require('../../enums/wallet/walletenums')

const getWallet = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.params.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await userSchema.findById(userId);

    if (user.email !== email) {
      return res.status(403).json({
        message: "This wallet does not exist or you don't have permission to view it.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    let userWallet = await Wallet.findOne({ userID: userId }).lean();

    if (!userWallet) {
      userWallet = await Wallet.create({
        userID: userId,
        balance: 0,
        status: WalletStatus.ACTIVE,
        transactions: [],
      });
    }

    const sortedTransactions = [...userWallet.transactions].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    const skip = (page - 1) * limit;
    const transactions = await Promise.all(
      sortedTransactions
        .slice(skip, skip + limit)
        .map(async (transaction) => {
          if (transaction.referenceId && transaction.referenceType === ReferenceType.ORDER) {
            const order = await Order.findById(transaction.referenceId)
              .select("products status returnRequests")
              .populate("products.productId", "name")
              .populate("returnRequests.products.productId", "name")
              .lean();

            if (!order || !order.products.length) {
              transaction.productName = "Unknown Products";
              transaction.description = `Refund for ${transaction.referenceType || "unknown"} transaction`;
            } else {
              const productNames = order.products
                .map((p) => p.productId?.name || p.name || "Unknown Product")
                .join(", ");

              transaction.productName = productNames;

              if (transaction.type === TransactionType.CREDIT) {
                if (order.returnRequests?.some(r => ["approved", "completed"].includes(r.status))) {
                  transaction.description = `Refund for returned products: ${productNames}`;
                } else {
                  transaction.description = `Refund for cancelled order: ${productNames}`;
                }
              } else {
                transaction.description = `Payment for order: ${productNames}`;
              }

              transaction.orderStatus = order.status;
            }
          }

          const { referenceId, ...transactionData } = transaction;
          return transactionData;
        })
    );

    const totalTransactions = sortedTransactions.length;

    res.status(200).json({
      success: true,
      wallet: {
        balance: userWallet.balance,
        transactions,
        status: userWallet.status,
        updatedAt: userWallet.updatedAt,
        createdAt: userWallet.createdAt,
      },
      pagination: {
        totalTransactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { getWallet };