# Wotix – Payment Flow

## Overview

The payment module handles the complete payment lifecycle of an order. Wotix supports multiple payment methods while ensuring secure payment verification before confirming an order.

The application currently supports:

- Cash on Delivery (COD)
- Razorpay Online Payment
- Wallet Payment

Each payment method follows its own workflow while ultimately creating a confirmed order after successful validation.

---

# Payment Architecture

```text
                 Customer
                     │
                     ▼
              Checkout Page
                     │
                     ▼
          Select Payment Method
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
     Razorpay      Wallet        COD
        │            │            │
        ▼            ▼            ▼
 Payment Verification Validation  Validation
        │            │            │
        └────────────┼────────────┘
                     ▼
              Create Order
                     │
                     ▼
         Update Product Stock
                     │
                     ▼
          Clear Shopping Cart
                     │
                     ▼
          Order Confirmation
```

---

# Supported Payment Methods

## 1. Razorpay

Razorpay is used for secure online payments.

Workflow:

```text
Checkout

↓

Select Razorpay

↓

Create Razorpay Order

↓

Customer Completes Payment

↓

Receive Payment Details

↓

Verify Payment Signature

↓

Create Order

↓

Reduce Product Stock

↓

Clear Cart

↓

Payment Successful
```

Payment verification is performed on the backend before creating the order to ensure the transaction is authentic.

---

## 2. Wallet Payment

Customers can pay using their wallet balance.

Workflow:

```text
Checkout

↓

Select Wallet

↓

Check Wallet Balance

↓

Sufficient Balance?

↓

Yes

↓

Deduct Wallet Amount

↓

Create Order

↓

Update Wallet Transactions

↓

Reduce Product Stock

↓

Clear Cart

↓

Order Successful
```

If the wallet balance is insufficient, the payment is rejected and the customer is prompted to choose another payment method.

---

## 3. Cash on Delivery (COD)

Cash on Delivery allows customers to place orders without making an online payment.

Workflow:

```text
Checkout

↓

Select Cash on Delivery

↓

Validate Order

↓

Create Order

↓

Reduce Product Stock

↓

Clear Cart

↓

Order Placed Successfully
```

Payment is collected during product delivery.

---

# Checkout Flow

The checkout process follows a common workflow regardless of the selected payment method.

```text
Shopping Cart

↓

Select Address

↓

Apply Coupon (Optional)

↓

Calculate Final Amount

↓

Select Payment Method

↓

Complete Payment

↓

Create Order

↓

Confirmation
```

---

# Price Calculation

Before initiating payment, the backend calculates the final payable amount by considering:

- Product Price
- Quantity
- Product Offers
- Category Offers
- Coupon Discounts
- Shipping Charges (if applicable)

The calculated amount is used for payment processing and order creation.

---

# Payment Verification

For online payments, the backend performs payment verification before confirming the order.

Verification includes:

- Payment Validation
- Signature Verification
- Order Validation

Only verified payments result in successful order creation.

---

# Order Creation After Payment

Once payment is successfully completed and verified:

1. A new order is created.
2. Ordered products are stored in the database.
3. Product inventory is updated.
4. Customer cart is cleared.
5. Order confirmation is returned.
6. Notifications are generated for relevant events.

---

# Payment Failure Handling

If an online payment fails:

- The order is not confirmed.
- Inventory remains unchanged.
- Customer receives a payment failure response.
- Customer can retry the payment from the order history (if supported).

---

# Wallet Refund Integration

Refunds resulting from order cancellation or approved return requests are credited back to the customer's wallet.

Refund workflow:

```text
Order Cancellation

or

Approved Return

↓

Calculate Refund Amount

↓

Credit Wallet

↓

Create Wallet Transaction

↓

Update Wallet Balance

↓

Notify Customer
```

---

# Security Measures

The payment module incorporates several security practices:

- Server-side payment verification
- Razorpay signature validation
- Secure backend payment processing
- JWT-protected checkout endpoints
- Authentication required for all payment operations

These measures help ensure that only authenticated users can initiate payments and that online transactions are verified before order confirmation.

---

# Payment Summary

The payment module provides a secure and flexible checkout experience by supporting multiple payment methods, validating transactions, creating orders only after successful verification, updating inventory, managing wallet transactions, and integrating with the overall order lifecycle.