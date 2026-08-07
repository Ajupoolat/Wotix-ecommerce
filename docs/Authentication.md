# Wotix – Authentication

## Overview

The authentication module is responsible for securely identifying users and controlling access to protected resources within the application.

Wotix supports both traditional email/password authentication and Google OAuth authentication. User sessions are maintained using JSON Web Tokens (JWT), while role-based authorization ensures that customers and administrators can only access resources permitted for their roles.

---

# Authentication Features

The authentication system provides the following capabilities:

- User Registration
- Email OTP Verification
- Email & Password Login
- Google OAuth Login
- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Forgot Password
- Password Reset
- Change Password
- Secure Logout

---

# Authentication Architecture

```
                 User
                   │
                   ▼
         React Authentication Pages
                   │
                   ▼
            Axios API Requests
                   │
                   ▼
            Express.js Backend
                   │
        ┌──────────┴──────────┐
        │                     │
 Email Authentication   Google OAuth
        │                     │
        └──────────┬──────────┘
                   ▼
        User Verification
                   │
                   ▼
            JWT Generation
                   │
                   ▼
        HTTP-only Cookie
                   │
                   ▼
      Protected API Requests
                   │
                   ▼
          JWT Verification
                   │
                   ▼
         Authorized Resource
```

---

# User Registration Flow

New users register using their email address.

Registration flow:

```
User Registration Form

↓

Validate User Details

↓

Check Existing Account

↓

Generate OTP

↓

Send OTP via Email

↓

User Verifies OTP

↓

Create User Account

↓

Registration Successful
```

The OTP verification step ensures ownership of the provided email address before creating the account.

---

# Login Flow

Users can log in using their registered email address and password.

```
Login Form

↓

Validate Credentials

↓

Retrieve User

↓

Verify Password

↓

Generate JWT

↓

Store JWT in HTTP-only Cookie

↓

Login Successful
```

After successful authentication, users can access protected resources based on their assigned role.

---

# Google OAuth Authentication

Wotix supports authentication through Google OAuth.

Authentication flow:

```
User Clicks
"Continue with Google"

↓

Google Authentication

↓

Google Returns User Information

↓

Verify / Create User

↓

Generate JWT

↓

Store JWT in HTTP-only Cookie

↓

Redirect to Application
```

This allows users to authenticate without creating a separate password.

---

# Protected Routes

Protected routes are accessible only to authenticated users.

Examples include:

- Profile
- Cart
- Wishlist
- Checkout
- Orders
- Wallet

Requests to these endpoints require a valid JWT.

---

# Role-Based Authorization

The application supports two primary roles:

## Customer

Customers can:

- Browse Products
- Manage Cart
- Manage Wishlist
- Place Orders
- Manage Addresses
- Track Orders
- Manage Wallet

---

## Administrator

Administrators can:

- Manage Users
- Manage Products
- Manage Categories
- Manage Coupons
- Manage Offers
- Manage Orders
- View Reports

Authorization middleware validates user roles before granting access to administrative resources.

---

# Forgot Password Flow

Users who forget their password can securely reset it.

```
Forgot Password

↓

Verify Email

↓

Generate OTP

↓

Send OTP

↓

Verify OTP

↓

Create New Password

↓

Password Updated
```

---

# Change Password

Authenticated users can update their existing password from the profile section after verification.

---

# JWT Authentication

After successful login, the backend generates a JSON Web Token (JWT).

The JWT is used to:

- Identify authenticated users
- Authorize protected API requests
- Maintain user sessions

For every protected request:

```
Browser

↓

JWT Cookie

↓

Authentication Middleware

↓

JWT Verification

↓

Controller

↓

Response
```

Invalid or expired tokens are rejected before reaching the controller.

---

# Session Management

User sessions remain active while the authentication token is valid.

Logout removes the authenticated session, requiring users to log in again before accessing protected resources.

---

# Security Measures

The authentication module includes several security mechanisms:

- Password hashing using bcrypt
- JWT-based authentication
- HTTP-only authentication cookies
- Google OAuth integration
- Protected API routes
- Role-based authorization

---

# Authentication Summary

The authentication module provides a secure user authentication system by combining email/password login, Google OAuth, OTP verification, JWT-based session management, and role-based authorization. These components work together to ensure that only authenticated and authorized users can access protected resources while maintaining a secure user experience.