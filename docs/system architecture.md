# Wotix – System Architecture

## Overview

Wotix follows a full-stack client-server architecture built using the MERN stack. The application is divided into two independent applications:

- Frontend (React + Vite)
- Backend (Express.js)

The frontend communicates with the backend through REST APIs, while Socket.IO is used to provide real-time notifications. The backend manages business logic, authentication, payment processing, and database interactions.

---

# High-Level Architecture

```
                          ┌────────────────────────────┐
                          │        Frontend            │
                          │     React + Vite           │
                          │                            │
                          │ Components                 │
                          │ Context Providers          │
                          │ React Router               │
                          │ Axios API Layer            │
                          └─────────────┬──────────────┘
                                        │
                              HTTP / HTTPS
                              REST APIs
                                        │
                          ┌─────────────▼──────────────┐
                          │        Backend             │
                          │        Express.js          │
                          │                            │
                          │ Routes                     │
                          │ Middleware                 │
                          │ Controllers                │
                          │ Services                   │
                          │ Mongoose Models            │
                          └─────────────┬──────────────┘
                                        │
                  ┌─────────────────────┼────────────────────┐
                  │                     │                    │
          MongoDB Atlas          Cloudinary               Razorpay
                  │                     │                    │
             Database           Image Storage            Payments
                  │
             Socket.IO
          Real-time Events
```

---

# Frontend Architecture

The frontend is developed using React and Vite with Tailwind CSS.

Its responsibilities include:

- Rendering the user interface
- Managing application state
- Calling backend REST APIs
- Handling routing
- Managing authentication state
- Receiving real-time notifications

The application is organized into feature-based modules with reusable components.

Main frontend layers:

```
Pages
      │
Components
      │
Context Providers
      │
API Modules
      │
Axios Instances
      │
Backend REST APIs
```

---

# Backend Architecture

The backend is built using Express.js and follows an MVC-inspired structure.

Main layers:

```
Routes

↓

Authentication Middleware

↓

Controllers

↓

Business Logic

↓

Mongoose Models

↓

MongoDB
```

Responsibilities:

- Authentication
- Authorization
- Product management
- Cart management
- Checkout
- Order processing
- Wallet management
- Notifications
- Payment verification

---

# Request Lifecycle

Every request follows a common lifecycle.

```
Browser

↓

Axios Request

↓

Express Route

↓

Authentication Middleware

↓

Controller

↓

Business Logic

↓

MongoDB

↓

JSON Response

↓

Frontend UI Update
```

For authenticated requests:

```
User Login

↓

JWT Cookie

↓

Protected Route

↓

JWT Verification

↓

Controller Execution

↓

Response
```

---

# State Management

The frontend uses React Context API for application state management.

Major providers include:

- Authentication
- Shopping Cart
- Offer Pricing
- Cart Offers
- Wishlist
- Wishlist Count

Each provider is responsible for a specific domain of the application.

```
Backend API

↓

Axios

↓

Context Provider

↓

React Components

↓

User Interface
```

---

# Routing Architecture

The application separates public and protected routes.

```
Public Routes

├── Home
├── Shop
├── Product Details
├── Login
├── Signup

Protected Routes

├── Cart
├── Checkout
├── Orders
├── Wallet
├── Wishlist
├── Profile

Admin Routes

├── Dashboard
├── Products
├── Categories
├── Orders
├── Offers
├── Coupons
├── Reports
```

Authorization middleware ensures that only authenticated users can access protected resources.

---

# Authentication Architecture

Authentication uses JWT stored in HTTP-only cookies.

```
Login

↓

Backend Authentication

↓

JWT Generation

↓

HTTP-only Cookie

↓

Protected Request

↓

JWT Verification

↓

Authorized Resource
```

Google OAuth authentication follows a similar flow using Passport.js.

---

# Payment Architecture

The payment system supports multiple payment methods.

```
Checkout

↓

Payment Method

├── Cash on Delivery
├── Wallet
└── Razorpay

↓

Payment Verification

↓

Order Creation

↓

Order Confirmation
```

---

# Notification Architecture

Real-time communication is implemented using Socket.IO.

```
Backend Event

↓

Socket.IO Server

↓

User/Admin Room

↓

Socket.IO Client

↓

Real-time Notification
```

Notifications are generated for:

- Order Updates
- Return Requests
- Return Approvals
- Delivery Updates

---

# Database Layer

MongoDB is used as the primary database.

Major collections include:

- Users
- Products
- Categories
- Orders
- Cart
- Wallet
- Wishlist
- Coupons
- Offers
- Notifications
- Addresses

Mongoose provides schema validation and data access for all collections.

---

# External Services

The application integrates with several third-party services.

| Service | Purpose |
|----------|---------|
| MongoDB Atlas | Database |
| Cloudinary | Image Storage |
| Razorpay | Online Payments |
| Google OAuth | User Authentication |
| Nodemailer | Email & OTP Delivery |
| Socket.IO | Real-time Notifications |

---

# Overall Request Flow

```
User

↓

React UI

↓

Axios

↓

Express API

↓

Authentication Middleware

↓

Controller

↓

Business Logic

↓

MongoDB / External Services

↓

JSON Response

↓

React UI Update
```

---

# Architecture Summary

The Wotix architecture separates the frontend and backend into independent applications that communicate through REST APIs. Authentication is handled using JWT-based cookies, business logic is implemented within backend controllers, and MongoDB stores application data through Mongoose models. External services such as Cloudinary, Razorpay, Google OAuth, Nodemailer, and Socket.IO extend the platform with image hosting, payment processing, authentication, email delivery, and real-time communication.

This architecture provides a modular foundation for a full-featured e-commerce platform while supporting future enhancements such as service-layer extraction, automated testing, Docker-based deployment, caching, and CI/CD pipelines.