module.exports = Object.freeze({
  TransactionType: {
    CREDIT: 'credit',
    DEBIT: 'debit'
  },
  
  TransactionStatus: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },
  
  ReferenceType: {
    ORDER: 'order',
    RETURN: 'return',
    TOPUP: 'topup',
    WITHDRAWAL: 'withdrawal',
    REFERRAL: 'referral',
    CASHBACK: 'cashback'
  },
  
  WalletStatus: {
    ACTIVE: true,
    INACTIVE: false
  }
});