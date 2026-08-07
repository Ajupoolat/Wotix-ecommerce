# Wotix – Project Overview

## Introduction

Wotix is a full-stack e-commerce platform developed for selling watches online. The application provides a complete online shopping experience for customers while offering administrators a centralized dashboard to manage products, orders, offers, coupons, users, and sales reports.

The project was built to simulate a production-oriented e-commerce system by implementing modern authentication mechanisms, secure payment processing, real-time notifications, digital wallet management, and role-based access control.

---

# Objectives

The primary objectives of Wotix are:

- Build a scalable full-stack e-commerce application.
- Provide customers with a smooth online shopping experience.
- Enable secure online payments.
- Implement complete order management workflows.
- Provide administrators with inventory and sales management capabilities.
- Apply modern web development practices using the MERN stack.

---

# Target Users

## Customer

Customers can:

- Register and log in using email/password or Google OAuth
- Browse products
- Search, filter, sort, and paginate products
- Manage shopping cart
- Manage wishlist
- Manage delivery addresses
- Place orders
- Make payments using Razorpay, Wallet, or Cash on Delivery
- Track orders
- Cancel products within an order
- Request product returns
- Download invoices
- View wallet transactions
- Receive real-time notifications

---

## Administrator

Administrators can:

- Manage users
- Manage products
- Manage categories
- Create and manage offers
- Create and manage coupons
- Process return requests
- Manage orders
- Monitor sales reports
- Export reports to Excel
- View dashboard analytics
- Receive real-time notifications

---

## Guest Users

Unauthenticated visitors can:

- Browse products
- Search products
- View product details
- Explore product categories

Authentication is required before accessing shopping-related features such as cart, checkout, wishlist, and order management.

---

# Core Features

## Authentication

- Email & Password Authentication
- Google OAuth Authentication
- JWT-based Authentication
- Role-based Authorization
- Protected Routes

---

## Product Management

- Product Listing
- Product Details
- Product Search
- Category Filtering
- Sorting
- Pagination

---

## Shopping Experience

- Shopping Cart
- Wishlist
- Address Management
- Coupon Application
- Offer Discounts
- Checkout Process

---

## Order Management

- Order Placement
- Order Tracking
- Partial Order Cancellation
- Return Request Workflow
- Invoice Generation

---

## Payment System

- Razorpay Integration
- Cash on Delivery
- Wallet Payments
- Secure Payment Verification

---

## Wallet System

- Refund Processing
- Wallet Balance Management
- Transaction History

---

## Admin Dashboard

- User Management
- Product Management
- Category Management
- Offer Management
- Coupon Management
- Order Management
- Sales Reports
- Dashboard Analytics

---

## Reporting

- Daily Reports
- Weekly Reports
- Monthly Reports
- Yearly Reports
- Custom Date Reports
- Excel Export

---

## Notifications

Real-time notifications are implemented using Socket.IO for important events such as:

- Order Updates
- Return Requests
- Return Approvals
- Order Cancellations
- Delivery Updates

---

# Technology Overview

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Context API
- React Router
- Axios
- Socket.IO Client

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Passport.js
- Socket.IO
- Razorpay SDK
- Cloudinary
- Nodemailer

---

# High-Level Architecture

```
                React Frontend
                       │
                  Axios Requests
                       │
                Express REST API
                       │
     ┌──────────┬─────────────┬─────────────┐
     │          │             │             │
 MongoDB   Cloudinary    Razorpay    Socket.IO
```

---

# Business Modules

The application consists of the following major modules:

- Authentication
- Product Catalog
- Cart
- Wishlist
- Checkout
- Orders
- Wallet
- Coupons
- Offers
- Notifications
- User Profile
- Admin Dashboard
- Sales Reporting

---

# Project Goals

This project demonstrates practical implementation of:

- Full Stack MERN Development
- Authentication & Authorization
- REST API Design
- Payment Gateway Integration
- Real-Time Communication
- Cloud File Storage
- Role-Based Access Control
- E-commerce Business Logic
- State Management
- Responsive User Interface

---

# Current Status

Wotix is implemented as a full-featured e-commerce MVP supporting complete shopping workflows, payment integration, wallet management, administrative operations, and real-time notifications.

The project serves as a production-style portfolio application while providing opportunities for future enhancements such as automated testing, Docker support, caching, CI/CD pipelines, and architectural refactoring.