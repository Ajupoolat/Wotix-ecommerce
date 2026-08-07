# Wotix – Order Lifecycle

## Overview

The Order Lifecycle defines the complete journey of an order within the Wotix e-commerce platform—from the moment a customer places an order until it is successfully delivered, cancelled, or returned.

The order management system ensures accurate inventory updates, secure payment processing, order tracking, and refund handling while maintaining a smooth customer experience.

---

# Order Lifecycle

The overall order flow is illustrated below.

```text
Customer Adds Products to Cart

↓

Checkout

↓

Select Address

↓

Apply Coupon (Optional)

↓

Select Payment Method

↓

Complete Payment

↓

Order Created

↓

Order Confirmed

↓

Processing

↓

Shipped

↓

Out for Delivery

↓

Delivered

        │
        ├──────────────┐
        │              │
        ▼              ▼
 Order Cancelled   Return Requested
                        │
                        ▼
                Return Approved
                        │
                        ▼
                 Wallet Refund
```

---

# Step 1 – Shopping Cart

Customers begin the purchasing process by adding products to their shopping cart.

During this stage, customers can:

- Add products
- Remove products
- Update quantities
- Review cart summary
- Apply available offers

---

# Step 2 – Checkout

The checkout page prepares the order before payment.

Customers complete the following steps:

- Select delivery address
- Review ordered products
- Apply coupon (optional)
- Review final payable amount
- Select payment method

---

# Step 3 – Payment

Wotix supports multiple payment methods.

- Razorpay
- Wallet
- Cash on Delivery (COD)

For online payments, payment verification is completed before the order is created.

---

# Step 4 – Order Creation

After successful payment validation, the backend creates a new order.

During this stage:

- Order information is stored
- Ordered products are recorded
- Payment information is saved
- Order status is initialized
- Product inventory is updated
- Shopping cart is cleared

---

# Step 5 – Order Confirmation

Once the order is successfully created:

- Customer receives confirmation
- Order appears in Order History
- Order tracking becomes available

---

# Step 6 – Processing

The order enters the processing stage.

This stage represents backend operations such as:

- Order verification
- Inventory confirmation
- Packaging preparation

---

# Step 7 – Shipping

After processing, the order is shipped.

Customers can monitor shipment progress through the Order Details page.

---

# Step 8 – Out for Delivery

The shipment is dispatched for final delivery.

Customers are informed that the package is on its way.

---

# Step 9 – Delivered

The order is successfully delivered to the customer.

At this stage:

- Order is marked as completed
- Customer can download the invoice
- Return request option becomes available (subject to return policy)

---

# Order Cancellation

Customers can cancel eligible orders before delivery.

Cancellation workflow:

```text
Customer Requests Cancellation

↓

Validate Order Status

↓

Approve Cancellation

↓

Update Order Status

↓

Update Product Inventory

↓

Process Refund (if applicable)

↓

Update Wallet

↓

Notify Customer
```

Depending on the payment method, eligible refunds are credited to the customer's wallet.

---

# Return Request

Customers may request a return after delivery.

Return workflow:

```text
Delivered Order

↓

Customer Requests Return

↓

Admin Reviews Request

↓

Approve / Reject

↓

If Approved

↓

Refund Processed

↓

Wallet Updated

↓

Customer Notified
```

---

# Wallet Refund Process

Refunds generated from cancellations or approved returns follow the workflow below.

```text
Cancellation / Return

↓

Calculate Refund Amount

↓

Credit Customer Wallet

↓

Create Wallet Transaction

↓

Update Wallet Balance

↓

Notify Customer
```

Every refund is recorded as a wallet transaction for future reference.

---

# Product Inventory Management

Inventory is automatically managed throughout the order lifecycle.

Inventory updates occur when:

- Order is successfully created
- Order is cancelled
- Return is approved (if inventory restoration is applicable)

This helps maintain accurate stock availability.

---

# Order Status Flow

The application tracks each order using different status values.

```text
Placed

↓

Confirmed

↓

Processing

↓

Shipped

↓

Out for Delivery

↓

Delivered

↓

Completed
```

Alternative workflows:

```text
Placed

↓

Cancelled
```

or

```text
Delivered

↓

Return Requested

↓

Return Approved

↓

Refund Completed
```

---

# Customer Order Management

Customers can manage their orders through the Order History page.

Available actions include:

- View Order Details
- Track Order Status
- Download Invoice
- Cancel Eligible Orders
- Request Product Returns
- Retry Failed Payments (where applicable)

---

# Administrative Order Management

Administrators can:

- View all orders
- Monitor order status
- Process return requests
- Review customer orders
- Manage order updates

---

# Business Rules

The order management system follows several business rules:

- Authentication is required before placing an order.
- Product availability is verified before order creation.
- Online payments must be successfully verified before confirming an order.
- Refunds from eligible cancellations and approved returns are credited to the customer's wallet.
- Inventory is automatically synchronized with order activities.

---

# Order Lifecycle Summary

The Wotix order management system manages the complete journey of an order—from cart and checkout through payment, fulfillment, delivery, cancellation, returns, and refunds. It integrates inventory management, wallet processing, payment verification, and order tracking to provide a reliable and consistent shopping experience for both customers and administrators.