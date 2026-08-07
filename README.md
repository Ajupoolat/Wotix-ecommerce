# Wotix – Full Stack E-Commerce Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blue)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black?logo=socketdotio)

A production-oriented full-stack e-commerce platform built using the MERN stack. Wotix provides customers with a complete online shopping experience while offering administrators powerful tools for inventory management, order processing, sales reporting, and business operations.

---

# Key Features

## Customer

- User Registration & Login
- Google OAuth Authentication
- Product Search & Filtering
- Shopping Cart
- Wishlist
- Address Management
- Secure Checkout
- Razorpay Payment
- Wallet Payment
- Cash on Delivery
- Order Tracking
- Return Requests
- Wallet Refunds
- Real-time Notifications

---

## Administrator

- Dashboard Analytics
- User Management
- Product Management
- Category Management
- Order Management
- Coupon Management
- Offer Management
- Sales Reports
- Excel Report Export
- Return Approval

---

# Technology Stack

## Frontend

- React.js
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Context API
- Axios
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Passport.js
- Google OAuth
- Razorpay
- Socket.IO
- Cloudinary
- Nodemailer

---

# Project Structure

```
Wotix

├── client/
├── server/
├── docs/
│   ├── 01-project-overview.md
│   ├── 02-features.md
│   ├── 03-system-architecture.md
│   ├── 04-authentication.md
│   ├── 05-payment-flow.md
│   └── 06-order-lifecycle.md
│
├── README.md
```

---

# Documentation

Detailed project documentation is available in the **docs** folder.

| Document | Description |
|----------|-------------|
| [Project Overview](docs/01-project-overview.md) | Introduction, objectives, users, and business overview |
| [Features](docs/02-features.md) | Complete feature documentation |
| [System Architecture](docs/03-system-architecture.md) | Overall application architecture and request flow |
| [Authentication](docs/04-authentication.md) | Authentication and authorization workflow |
| [Payment Flow](docs/05-payment-flow.md) | Razorpay, Wallet, and COD payment process |
| [Order Lifecycle](docs/06-order-lifecycle.md) | Complete order lifecycle from checkout to delivery |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Ajupoolat/Wotix.git
```

## Backend

```bash
cd server

npm install

npm run dev
```

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# Environment Variables

Create a `.env` file inside the backend.

Example:

```env
PORT=

MONGODB_URI=

JWT_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL=

EMAIL_PASSWORD=
```

> Do not commit your actual environment variables.

---

# Core Modules

- Authentication
- Product Catalog
- Shopping Cart
- Wishlist
- Checkout
- Payment
- Wallet
- Orders
- Notifications
- Coupons
- Offers
- User Profile
- Admin Dashboard
- Sales Reports

---

# Third-Party Services

- MongoDB Atlas
- Cloudinary
- Razorpay
- Google OAuth
- Nodemailer

---

# Future Improvements

Planned improvements include:

- Docker Support
- Automated Testing
- CI/CD Pipeline
- Redis Caching
- Clean Architecture
- Background Jobs
- API Documentation using Swagger

---

# License

This project was developed for learning purposes and portfolio demonstration.

---

# Author

**Ajvadu**

GitHub: https://github.com/Ajupoolat

LinkedIn: https://linkedin.com/in/yourprofile