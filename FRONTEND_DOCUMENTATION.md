
# Gaming Platform - Frontend Developer Documentation

---

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication Documentation](#authentication-documentation)
3. [Common Response Formats](#common-response-formats)
4. [Validation Guide](#validation-guide)
5. [REST API Endpoints](#rest-api-endpoints)
    - [Auth Module](#auth-module)
    - [Users Module](#users-module)
    - [Admin Module](#admin-module)
    - [Friends Module](#friends-module)
    - [Notifications Module](#notifications-module)
    - [Chat Module](#chat-module)
    - [Rooms Module](#rooms-module)
6. [Socket.IO Documentation](#socketio-documentation)
    - [Connection](#connection)
    - [Room Events](#room-events)
    - [Tic-Tac-Toe Events](#tic-tac-toe-events)
    - [Chat Events](#chat-events)
    - [Notification Events](#notification-events)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Postman Documentation](#postman-documentation)
9. [OpenAPI Specification](#openapi-specification)
10. [Frontend Navigation Documentation](#frontend-navigation-documentation)
11. [Architecture Review](#architecture-review)

---

## API Overview

### Project Purpose
This backend powers a real-time gaming platform with user authentication, friend management, chat systems, and multiplayer games (Tic-Tac-Toe initially).

### Base URL
`http://localhost:4000/api`

### API Version
1.0.0

### Environment URLs
- **Development**: `http://localhost:4000`
- **Production**: TBD

---

## Authentication Documentation

### JWT Flow
1. **User Registration**: User creates account → Email verification link sent
2. **Email Verification**: User verifies email via link
3. **Login**: User logs in → Receives access token and refresh token
4. **Token Usage**: Access token used for API calls (expires in 15 minutes)
5. **Token Refresh**: Refresh token used to get new access token (expires in 7 days)
6. **Logout**: Tokens invalidated

### Login Flow
```
Client sends credentials → Server validates → Sets HTTP-only cookies (accessToken, refreshToken) → Returns user object and tokens
```

### Protected Route Usage
Include JWT in Authorization header:
```
Authorization: Bearer &lt;accessToken&gt;
```

### Axios Interceptor Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

// Request interceptor (add auth token if needed)
api.interceptors.request.use(
  (config) =&gt; {
    return config;
  },
  (error) =&gt; Promise.reject(error)
);

// Response interceptor (handle 401 and refresh token)
api.interceptors.response.use(
  (response) =&gt; response,
  async (error) =&gt; {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 &amp;&amp; !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await api.post('/auth/refresh-token');
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Token Refresh Strategy
- Refresh token stored as HTTP-only cookie
- Call `/api/auth/refresh-token` to get new tokens
- New refresh token is set automatically

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Validation Guide

All endpoints use Joi validation. Common validation rules:
- **Strings**: Trimmed, min/max length checks
- **Emails**: Valid email format, lowercase
- **Passwords**: At least 8 characters
- **ObjectIds**: 24-character hexadecimal strings
- **Booleans**: Strict boolean checks
- **Enums**: Restricted to predefined values

---

## REST API Endpoints

### Auth Module

#### 1. Register User
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/register`
- **Module Name**: Auth
- **Route Description**: Create a new user account and send verification email
- **Authentication Required**: No
- **Authorization Requirements**: None
- **Required Headers**: `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "address": "123 Main St",
    "bio": "Hello!"
  }
  ```
- **Validation Rules**:
  - `name`: Required, 2-50 characters
  - `email`: Required, valid email, lowercase
  - `password`: Required, min 8 characters
  - `role`: Optional, enum: ["customer", "seller"], default "customer"
  - `phone`: Optional, string
  - `avatar`: Optional, string
  - `address`: Optional, max 100 characters
  - `bio`: Optional, max 100 characters
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Registration success",
    "data": {
      "_id": "6661234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": "+1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "address": "123 Main St",
      "bio": "Hello!",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2026-06-06T12:00:00.000Z",
      "updatedAt": "2026-06-06T12:00:00.000Z"
    }
  }
  ```
- **Error Response Examples**:
  - 400: Invalid input data
  - 403: Admin registration not allowed
  - 409: Email already exists
  - 500: Failed to send verification email

#### 2. Login
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/login`
- **Module Name**: Auth
- **Route Description**: Authenticate user and issue tokens
- **Authentication Required**: No
- **Authorization Requirements**: None
- **Required Headers**: `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Validation Rules**:
  - `email`: Required, valid email, lowercase
  - `password`: Required
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "6661234567890abcdef12345",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "phone": "+1234567890",
        "avatar": "https://example.com/avatar.jpg",
        "address": "123 Main St",
        "bio": "Hello!",
        "isVerified": true,
        "isActive": true,
        "createdAt": "2026-06-06T12:00:00.000Z",
        "updatedAt": "2026-06-06T12:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```
  Also sets HTTP-only cookies: `accessToken` and `refreshToken`
- **Error Response Examples**:
  - 401: Invalid email or password
  - 403: Account deactivated
  - 403: Email not verified

#### 3. Logout
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/logout`
- **Module Name**: Auth
- **Route Description**: Logout user and invalidate tokens
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Logout Success",
    "data": null
  }
  ```
  Clears `accessToken` and `refreshToken` cookies

#### 4. Get Current User
- **HTTP Method**: GET
- **Endpoint URL**: `/auth/me`
- **Module Name**: Auth
- **Route Description**: Get current authenticated user's profile
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "User Profile",
    "data": {
      "_id": "6661234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": "+1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "address": "123 Main St",
      "bio": "Hello!",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2026-06-06T12:00:00.000Z",
      "updatedAt": "2026-06-06T12:00:00.000Z"
    }
  }
  ```

#### 5. Forgot Password
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/forgot-password`
- **Module Name**: Auth
- **Route Description**: Request password reset email
- **Authentication Required**: No
- **Authorization Requirements**: None
- **Required Headers**: `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Validation Rules**:
  - `email`: Required, valid email, lowercase
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Password reset link sent successfully",
    "data": null
  }
  ```
- **Error Response Examples**:
  - 404: No account found with this email

#### 6. Reset Password
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/reset-password/:token`
- **Module Name**: Auth
- **Route Description**: Reset password using token
- **Authentication Required**: No
- **Authorization Requirements**: None
- **Required Headers**: `Content-Type: application/json`
- **Route Parameters**: `token` (string)
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "password": "newpassword123"
  }
  ```
- **Validation Rules**:
  - `password`: Required, min 8 characters
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Password reset successful",
    "data": null
  }
  ```
- **Error Response Examples**:
  - 400: Invalid or expired token

#### 7. Verify Email
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/verify-email/:token`
- **Module Name**: Auth
- **Route Description**: Verify email address
- **Authentication Required**: No
- **Authorization Requirements**: None
- **Required Headers**: None
- **Route Parameters**: `token` (string)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully",
    "data": null
  }
  ```
- **Error Response Examples**:
  - 400: Invalid or expired token

#### 8. Change Password
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/change-password`
- **Module Name**: Auth
- **Route Description**: Change password while authenticated
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```
- **Validation Rules**:
  - `oldPassword`: Required
  - `newPassword`: Required, 8-100 characters
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "data": null
  }
  ```
- **Error Response Examples**:
  - 401: Current password is incorrect

#### 9. Refresh Token
- **HTTP Method**: POST
- **Endpoint URL**: `/auth/refresh-token`
- **Module Name**: Auth
- **Route Description**: Refresh access token using refresh token
- **Authentication Required**: No (uses refreshToken cookie)
- **Authorization Requirements**: None
- **Required Headers**: None
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Token refreshed",
    "data": {
      "user": { /* user object */ },
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```
  Also sets new HTTP-only cookies
- **Error Response Examples**:
  - 401: Refresh token missing or invalid


### Users Module

#### 1. Get Profile
- **HTTP Method**: GET
- **Endpoint URL**: `/user/profile`
- **Module Name**: Users
- **Route Description**: Get current user's profile
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": { /* user object */ }
  }
  ```

#### 2. Update Profile
- **HTTP Method**: PATCH
- **Endpoint URL**: `/user/profile`
- **Module Name**: Users
- **Route Description**: Update current user's profile
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "name": "John Doe",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "address": "123 Main St",
    "bio": "Hello!"
  }
  ```
  All fields are optional
- **Validation Rules**:
  - `name`: Optional, 2-50 characters
  - `phone`: Optional, string
  - `avatar`: Optional, string
  - `address`: Optional, max 100 characters
  - `bio`: Optional, max 100 characters
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { /* updated user object */ }
  }
  ```

#### 3. Delete Account
- **HTTP Method**: DELETE
- **Endpoint URL**: `/user/account`
- **Module Name**: Users
- **Route Description**: Delete current user's account
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "password": "password123"
  }
  ```
- **Validation Rules**:
  - `password`: Required
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Account deleted successfully",
    "data": { "userId": "6661234567890abcdef12345" }
  }
  ```
- **Error Response Examples**:
  - 401: Current password is incorrect


### Admin Module

#### 1. Get All Users
- **HTTP Method**: GET
- **Endpoint URL**: `/admin/users`
- **Module Name**: Admin
- **Route Description**: Get list of all users
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Get All Users Successfully",
    "data": [ /* array of user objects */ ]
  }
  ```

#### 2. Get User by ID
- **HTTP Method**: GET
- **Endpoint URL**: `/admin/users/:id`
- **Module Name**: Admin
- **Route Description**: Get specific user by ID
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `id` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Get User Successfully",
    "data": { /* user object */ }
  }
  ```
- **Error Response Examples**:
  - 404: User not found

#### 3. Update User
- **HTTP Method**: PATCH
- **Endpoint URL**: `/admin/users/:id`
- **Module Name**: Admin
- **Route Description**: Update user details
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: `id` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "name": "John Doe",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "address": "123 Main St",
    "bio": "Hello!"
  }
  ```
  All fields optional
- **Validation Rules**: Same as Update Profile
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Update User Successfully",
    "data": { /* updated user object */ }
  }
  ```

#### 4. Delete User
- **HTTP Method**: DELETE
- **Endpoint URL**: `/admin/users/:id`
- **Module Name**: Admin
- **Route Description**: Delete user by ID
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `id` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Delete User Successfully",
    "data": null
  }
  ```

#### 5. Update User Role
- **HTTP Method**: PATCH
- **Endpoint URL**: `/admin/users/role/:id`
- **Module Name**: Admin
- **Route Description**: Update user's role
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: `id` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Validation Rules**:
  - `role`: Required, enum: ["customer", "seller", "admin"]
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Update User Role Successfully",
    "data": { /* updated user object */ }
  }
  ```

#### 6. Update User Status
- **HTTP Method**: PATCH
- **Endpoint URL**: `/admin/users/status/:id`
- **Module Name**: Admin
- **Route Description**: Activate/deactivate user
- **Authentication Required**: Yes
- **Authorization Requirements**: Admin
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: `id` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "isActive": false
  }
  ```
- **Validation Rules**:
  - `isActive`: Required, boolean
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Update User Status Successfully",
    "data": { /* updated user object */ }
  }
  ```


### Friends Module

#### 1. Send Friend Request
- **HTTP Method**: POST
- **Endpoint URL**: `/friends/send-request`
- **Module Name**: Friends
- **Route Description**: Send friend request to another user
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "receiverId": "6661234567890abcdef12345"
  }
  ```
- **Validation Rules**:
  - `receiverId`: Required, 24-character hex string
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend request sent successfully",
    "data": {
      "_id": "6661234567890abcdef12345",
      "sender": "6661234567890abcdef12346",
      "receiver": "6661234567890abcdef12345",
      "status": "pending",
      "createdAt": "2026-06-06T12:00:00.000Z",
      "updatedAt": "2026-06-06T12:00:00.000Z"
    }
  }
  ```
- **Error Response Examples**:
  - 400: Cannot send request to yourself
  - 404: Receiver not found
  - 409: Request already exists or already friends

#### 2. Accept Friend Request
- **HTTP Method**: PATCH
- **Endpoint URL**: `/friends/accept-request/:requestId`
- **Module Name**: Friends
- **Route Description**: Accept incoming friend request
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `requestId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend request accepted successfully",
    "data": { /* friend request object */ }
  }
  ```
- **Error Response Examples**:
  - 403: Not authorized
  - 404: Request not found
  - 400: Request not pending

#### 3. Reject Friend Request
- **HTTP Method**: PATCH
- **Endpoint URL**: `/friends/reject-request/:requestId`
- **Module Name**: Friends
- **Route Description**: Reject incoming friend request
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `requestId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend request rejected successfully",
    "data": { /* friend request object */ }
  }
  ```

#### 4. Cancel Friend Request
- **HTTP Method**: DELETE
- **Endpoint URL**: `/friends/cancel-request/:requestId`
- **Module Name**: Friends
- **Route Description**: Cancel outgoing friend request
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `requestId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend request canceled successfully",
    "data": null
  }
  ```

#### 5. Remove Friend
- **HTTP Method**: DELETE
- **Endpoint URL**: `/friends/remove/:friendId`
- **Module Name**: Friends
- **Route Description**: Remove friend from friends list
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `friendId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend removed successfully",
    "data": null
  }
  ```
- **Error Response Examples**:
  - 404: Friendship not found

#### 6. Get Friend Requests
- **HTTP Method**: GET
- **Endpoint URL**: `/friends/requests`
- **Module Name**: Friends
- **Route Description**: Get incoming friend requests
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friend requests retrieved successfully",
    "data": [ /* array of friend request objects with sender populated */ ]
  }
  ```

#### 7. Get Sent Requests
- **HTTP Method**: GET
- **Endpoint URL**: `/friends/sent-requests`
- **Module Name**: Friends
- **Route Description**: Get outgoing friend requests
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Sent friend requests retrieved successfully",
    "data": [ /* array of friend request objects with receiver populated */ ]
  }
  ```

#### 8. Get Friends
- **HTTP Method**: GET
- **Endpoint URL**: `/friends`
- **Module Name**: Friends
- **Route Description**: Get list of friends
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Friends retrieved successfully",
    "data": [ /* array of user objects */ ]
  }
  ```


### Notifications Module

#### 1. Get Notifications
- **HTTP Method**: GET
- **Endpoint URL**: `/notifications`
- **Module Name**: Notifications
- **Route Description**: Get paginated notifications
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**:
  - `page`: number (optional, default 1)
  - `limit`: number (optional, default 20)
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Notifications retrieved successfully",
    "data": {
      "notifications": [ /* array of notification objects */ ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "totalPages": 3
      }
    }
  }
  ```

#### 2. Get Unread Count
- **HTTP Method**: GET
- **Endpoint URL**: `/notifications/unread-count`
- **Module Name**: Notifications
- **Route Description**: Get count of unread notifications
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Unread count retrieved successfully",
    "data": { "count": 5 }
  }
  ```

#### 3. Mark Notification as Read
- **HTTP Method**: PATCH
- **Endpoint URL**: `/notifications/read/:notificationId`
- **Module Name**: Notifications
- **Route Description**: Mark specific notification as read
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `notificationId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": { /* notification object */ }
  }
  ```

#### 4. Mark All as Read
- **HTTP Method**: PATCH
- **Endpoint URL**: `/notifications/read-all`
- **Module Name**: Notifications
- **Route Description**: Mark all notifications as read
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "data": null
  }
  ```

#### 5. Delete Notification
- **HTTP Method**: DELETE
- **Endpoint URL**: `/notifications/:notificationId`
- **Module Name**: Notifications
- **Route Description**: Delete specific notification
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `notificationId` (string, ObjectId)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully",
    "data": null
  }
  ```


### Chat Module

#### 1. Create Conversation
- **HTTP Method**: POST
- **Endpoint URL**: `/chat/conversations`
- **Module Name**: Chat
- **Route Description**: Create or get existing conversation with user
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "participantId": "6661234567890abcdef12345"
  }
  ```
- **Validation Rules**:
  - `participantId`: Required, 24-character hex string
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Conversation created successfully",
    "data": {
      "_id": "6661234567890abcdef12345",
      "type": "private",
      "participants": ["6661234567890abcdef12346", "6661234567890abcdef12345"],
      "lastMessage": null,
      "lastMessageSender": null,
      "lastMessageAt": null,
      "createdAt": "2026-06-06T12:00:00.000Z",
      "updatedAt": "2026-06-06T12:00:00.000Z"
    }
  }
  ```
- **Error Response Examples**:
  - 400: Cannot create conversation with yourself
  - 404: Participant not found

#### 2. Get Conversations
- **HTTP Method**: GET
- **Endpoint URL**: `/chat/conversations`
- **Module Name**: Chat
- **Route Description**: Get paginated conversations
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**:
  - `page`: number (optional, default 1)
  - `limit`: number (optional, default 20)
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Conversations retrieved successfully",
    "data": {
      "conversations": [ /* array of conversation objects with participants populated */ ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "totalPages": 3
      }
    }
  }
  ```

#### 3. Send Message
- **HTTP Method**: POST
- **Endpoint URL**: `/chat/messages`
- **Module Name**: Chat
- **Route Description**: Send message to conversation
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345",
    "content": "Hello!"
  }
  ```
- **Validation Rules**:
  - `conversationId`: Required, 24-character hex string
  - `content`: Required, max 2000 characters
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Message sent successfully",
    "data": {
      "message": { /* message object with sender populated */ },
      "conversation": { /* updated conversation object */ }
    }
  }
  ```
- **Error Response Examples**:
  - 403: Not a participant of this conversation
  - 404: Conversation not found

#### 4. Get Messages
- **HTTP Method**: GET
- **Endpoint URL**: `/chat/conversations/:conversationId/messages`
- **Module Name**: Chat
- **Route Description**: Get paginated messages from conversation
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `conversationId` (string, ObjectId)
- **Query Parameters**:
  - `page`: number (optional, default 1)
  - `limit`: number (optional, default 50)
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Messages retrieved successfully",
    "data": {
      "messages": [ /* array of message objects with sender populated */ ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 100,
        "totalPages": 2
      }
    }
  }
  ```


### Rooms Module

#### 1. Create Room
- **HTTP Method**: POST
- **Endpoint URL**: `/rooms`
- **Module Name**: Rooms
- **Route Description**: Create new game room
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "name": "Game Room",
    "gameType": "tic-tac-toe",
    "maxPlayers": 2
  }
  ```
- **Validation Rules**:
  - `name`: Required, 1-50 characters
  - `gameType`: Required, enum: ["tic-tac-toe", "rock-paper-scissors"]
  - `maxPlayers`: Required, integer 2-10
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Room created successfully",
    "data": {
      "_id": "6661234567890abcdef12345",
      "name": "Game Room",
      "roomCode": "ABC123",
      "owner": "6661234567890abcdef12346",
      "players": ["6661234567890abcdef12346"],
      "maxPlayers": 2,
      "status": "waiting",
      "gameType": "tic-tac-toe",
      "createdAt": "2026-06-06T12:00:00.000Z",
      "updatedAt": "2026-06-06T12:00:00.000Z"
    }
  }
  ```

#### 2. Join Room
- **HTTP Method**: POST
- **Endpoint URL**: `/rooms/join`
- **Module Name**: Rooms
- **Route Description**: Join existing room using code
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`, `Content-Type: application/json`
- **Route Parameters**: None
- **Query Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**:
  - `roomCode`: Required, 6 characters, uppercase
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Joined room successfully",
    "data": { /* room object */ }
  }
  ```
- **Error Response Examples**:
  - 400: Room not waiting for players
  - 400: Room is full
  - 400: Already in room
  - 404: Room not found

#### 3. Leave Room
- **HTTP Method**: POST
- **Endpoint URL**: `/rooms/:roomCode/leave`
- **Module Name**: Rooms
- **Route Description**: Leave current room
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `roomCode` (string)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Left room successfully",
    "data": { /* room object or message if deleted */ }
  }
  ```
- **Error Response Examples**:
  - 400: Not in room
  - 404: Room not found

#### 4. Get Room by Code
- **HTTP Method**: GET
- **Endpoint URL**: `/rooms/:roomCode`
- **Module Name**: Rooms
- **Route Description**: Get room details by code
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: `roomCode` (string)
- **Query Parameters**: None
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Room retrieved successfully",
    "data": { /* room object with owner and players populated */ }
  }
  ```

#### 5. Get My Rooms
- **HTTP Method**: GET
- **Endpoint URL**: `/rooms`
- **Module Name**: Rooms
- **Route Description**: Get paginated rooms user is part of
- **Authentication Required**: Yes
- **Authorization Requirements**: User
- **Required Headers**: `Authorization: Bearer &lt;accessToken&gt;`
- **Route Parameters**: None
- **Query Parameters**:
  - `page`: number (optional, default 1)
  - `limit`: number (optional, default 20)
- **Request Body Schema**: None
- **Validation Rules**: None
- **Success Response Example**:
  ```json
  {
    "success": true,
    "message": "Rooms retrieved successfully",
    "data": {
      "rooms": [ /* array of room objects with owner and players populated */ ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 10,
        "totalPages": 1
      }
    }
  }
  ```


---

## Socket.IO Documentation

### Connection
**URL**: `http://localhost:4000`

**Authentication**:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: accessToken // from local storage or auth state
  },
  withCredentials: true
});
```

**Connection Error**:
```javascript
socket.on('connect_error', (error) =&gt; {
  console.error('Connection error:', error.message);
});
```

---

### Room Events

#### Client → Server

##### 1. `room:create`
- **Event Name**: `room:create`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "name": "Game Room",
    "gameType": "tic-tac-toe",
    "maxPlayers": 2
  }
  ```
- **Validation Rules**: Same as Create Room API
- **Success Response**: `room:created` (Server → Client)
- **Error Response**: `room:error` (Server → Client)

##### 2. `room:join`
- **Event Name**: `room:join`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**: Same as Join Room API
- **Success Response**: `room:joined` (Server → Client) + `room:updated` (broadcast to room)
- **Error Response**: `room:error`

##### 3. `room:leave`
- **Event Name**: `room:leave`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**: None
- **Success Response**: `room:left` (Server → Client) + `room:updated` (broadcast)
- **Error Response**: `room:error`

##### 4. `room:start`
- **Event Name**: `room:start`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**:
  - Must be room owner
  - Room status must be "waiting"
  - At least 2 players
- **Success Response**: `room:started` (broadcast to room) + `room:updated`
- **Error Response**: `room:error`

---

#### Server → Client

##### 1. `room:created`
- **Event Name**: `room:created`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "room": { /* room object */ }
  }
  ```

##### 2. `room:joined`
- **Event Name**: `room:joined`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "room": { /* room object */ }
  }
  ```

##### 3. `room:left`
- **Event Name**: `room:left`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "result": { /* result from leaveRoom */ }
  }
  ```

##### 4. `room:updated`
- **Event Name**: `room:updated`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "room": { /* updated room object */ }
  }
  ```

##### 5. `room:started`
- **Event Name**: `room:started`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "room": { /* room object with status "playing" */ }
  }
  ```

##### 6. `room:error`
- **Event Name**: `room:error`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "message": "Error message"
  }
  ```

---

### Tic-Tac-Toe Events

#### Client → Server

##### 1. `ttt:start`
- **Event Name**: `ttt:start`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**:
  - Room must exist
  - Exactly 2 unique players in room
  - No active game in room
- **Success Response**: `ttt:started` (broadcast to room)
- **Error Response**: `ttt:error`

##### 2. `ttt:move`
- **Event Name**: `ttt:move`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123",
    "position": 4
  }
  ```
- **Validation Rules**:
  - Active game exists
  - It's player's turn
  - Position is 0-8
  - Cell is empty
- **Success Response**: `ttt:update` (broadcast to room)
- **Error Response**: `ttt:error`

##### 3. `ttt:restart`
- **Event Name**: `ttt:restart`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Validation Rules**:
  - Active game exists
  - Player is part of game
- **Success Response**: `ttt:restarted` (broadcast to room)
- **Error Response**: `ttt:error`

---

#### Server → Client

##### 1. `ttt:started`
- **Event Name**: `ttt:started`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "game": {
      "players": ["user1Id", "user2Id"],
      "currentTurn": "user1Id",
      "board": [null, null, null, null, null, null, null, null, null],
      "status": "playing",
      "winner": null,
      "winningLine": null,
      "symbols": { "user1Id": "X", "user2Id": "O" }
    }
  }
  ```

##### 2. `ttt:update`
- **Event Name**: `ttt:update`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "game": { /* updated game state */ }
  }
  ```

##### 3. `ttt:restarted`
- **Event Name**: `ttt:restarted`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "game": { /* new game state */ }
  }
  ```

##### 4. `ttt:error`
- **Event Name**: `ttt:error`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "message": "Error message"
  }
  ```

##### 5. `ttt:gameEnded`
- **Event Name**: `ttt:gameEnded`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "reason": "room_deleted"
  }
  ```

---

### Chat Events

#### Client → Server

##### 1. `chat:join-conversation`
- **Event Name**: `chat:join-conversation`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345"
  }
  ```
- **Validation Rules**:
  - Conversation exists
  - User is participant
- **Success Response**: None (joins socket room)
- **Error Response**: `chat:error`

##### 2. `chat:send-message`
- **Event Name**: `chat:send-message`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345",
    "content": "Hello!"
  }
  ```
- **Validation Rules**: Same as Send Message API
- **Success Response**: `chat:new-message` (broadcast to all participants)
- **Error Response**: `chat:error`

##### 3. `chat:typing`
- **Event Name**: `chat:typing`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345"
  }
  ```
- **Validation Rules**:
  - Conversation exists
  - User is participant
- **Success Response**: `chat:typing` (broadcast to other participants)
- **Error Response**: `chat:error`

##### 4. `chat:stop-typing`
- **Event Name**: `chat:stop-typing`
- **Direction**: Client → Server
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345"
  }
  ```
- **Validation Rules**: Same as above
- **Success Response**: `chat:stop-typing` (broadcast to other participants)
- **Error Response**: `chat:error`

---

#### Server → Client

##### 1. `chat:new-message`
- **Event Name**: `chat:new-message`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "message": { /* message object */ }
  }
  ```

##### 2. `chat:typing`
- **Event Name**: `chat:typing`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345",
    "userId": "6661234567890abcdef12346"
  }
  ```

##### 3. `chat:stop-typing`
- **Event Name**: `chat:stop-typing`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "conversationId": "6661234567890abcdef12345",
    "userId": "6661234567890abcdef12346"
  }
  ```

##### 4. `chat:error`
- **Event Name**: `chat:error`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "message": "Error message"
  }
  ```

---

### Notification Events

#### Server → Client

##### 1. `notification:new`
- **Event Name**: `notification:new`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "_id": "6661234567890abcdef12345",
    "recipient": "6661234567890abcdef12346",
    "sender": { /* user object */ },
    "type": "FRIEND_REQUEST",
    "title": "New Friend Request",
    "message": "John sent you a friend request",
    "data": {
      "requestId": "6661234567890abcdef12347",
      "senderId": "6661234567890abcdef12348",
      "receiverId": "6661234567890abcdef12346"
    },
    "isRead": false,
    "createdAt": "2026-06-06T12:00:00.000Z",
    "updatedAt": "2026-06-06T12:00:00.000Z"
  }
  ```

##### 2. `notification:read`
- **Event Name**: `notification:read`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  { /* notification object with isRead: true */ }
  ```

##### 3. `notification:all-read`
- **Event Name**: `notification:all-read`
- **Direction**: Server → Client
- **Payload Schema**: None

##### 4. `notification:deleted`
- **Event Name**: `notification:deleted`
- **Direction**: Server → Client
- **Payload Schema**:
  ```json
  {
    "notificationId": "6661234567890abcdef12345"
  }
  ```

---

## Frontend Integration Guide

### 1. Axios API Layer Structure
```
src/
└── api/
    ├── index.js          # Axios instance with interceptors
    ├── auth.js           # Auth endpoints
    ├── user.js           # User endpoints
    ├── admin.js          # Admin endpoints
    ├── friends.js        # Friends endpoints
    ├── notifications.js  # Notifications endpoints
    ├── chat.js           # Chat endpoints
    └── rooms.js          # Rooms endpoints
```

Example `api/auth.js`:
```javascript
import api from './index';

export const register = (data) =&gt; api.post('/auth/register', data);
export const login = (data) =&gt; api.post('/auth/login', data);
export const logout = () =&gt; api.post('/auth/logout');
export const getMe = () =&gt; api.get('/auth/me');
export const forgotPassword = (email) =&gt; api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) =&gt; api.post(`/auth/reset-password/${token}`, { password });
export const verifyEmail = (token) =&gt; api.post(`/auth/verify-email/${token}`);
export const changePassword = (data) =&gt; api.post('/auth/change-password', data);
export const refreshToken = () =&gt; api.post('/auth/refresh-token');
```

### 2. React Service Layer Structure
```
src/
└── services/
    ├── auth.service.js
    ├── user.service.js
    ├── friend.service.js
    ├── notification.service.js
    ├── chat.service.js
    └── room.service.js
```

### 3. Socket.IO Client Setup
```
src/
└── sockets/
    ├── index.js          # Socket connection setup
    ├── room.handlers.js
    ├── ttt.handlers.js
    ├── chat.handlers.js
    └── notification.handlers.js
```

Example `sockets/index.js`:
```javascript
import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) =&gt; {
  socket = io('http://localhost:4000', {
    auth: { token },
    withCredentials: true
  });
  return socket;
};

export const getSocket = () =&gt; socket;

export const disconnectSocket = () =&gt; {
  if (socket) {
    socket.disconnect();
  }
};
```

### 4. Protected Route Implementation
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) =&gt; {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return &lt;Navigate to="/login" replace /&gt;;
  }
  
  return children;
};

export const AdminRoute = ({ children }) =&gt; {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return &lt;Navigate to="/login" replace /&gt;;
  }
  
  if (user?.role !== 'admin') {
    return &lt;Navigate to="/" replace /&gt;;
  }
  
  return children;
};
```

### 5. Recommended React Folder Structure
```
src/
├── api/                  # API calls
├── services/             # Business logic
├── hooks/                # Custom hooks
├── pages/                # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── Friends.jsx
│   ├── Notifications.jsx
│   ├── Chat.jsx
│   ├── Rooms.jsx
│   └── TicTacToe.jsx
├── components/           # Reusable components
│   ├── common/
│   ├── auth/
│   ├── friends/
│   ├── chat/
│   ├── rooms/
│   └── tictactoe/
├── layouts/              # Layout components
├── routes/               # Route definitions
├── context/              # React Context
├── sockets/              # Socket handlers
├── utils/                # Utility functions
├── constants/            # Constants
└── types/                # TypeScript types (if using TS)
```

---

## Postman Documentation

### Collection Structure
```
Gaming Platform API/
├── Auth/
│   ├── Register
│   ├── Login
│   ├── Logout
│   ├── Get Me
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Verify Email
│   ├── Change Password
│   └── Refresh Token
├── Users/
│   ├── Get Profile
│   ├── Update Profile
│   └── Delete Account
├── Admin/
│   ├── Get All Users
│   ├── Get User by ID
│   ├── Update User
│   ├── Delete User
│   ├── Update User Role
│   └── Update User Status
├── Friends/
│   ├── Send Friend Request
│   ├── Accept Friend Request
│   ├── Reject Friend Request
│   ├── Cancel Friend Request
│   ├── Remove Friend
│   ├── Get Friend Requests
│   ├── Get Sent Requests
│   └── Get Friends
├── Notifications/
│   ├── Get Notifications
│   ├── Get Unread Count
│   ├── Mark as Read
│   ├── Mark All as Read
│   └── Delete Notification
├── Chat/
│   ├── Create Conversation
│   ├── Get Conversations
│   ├── Send Message
│   └── Get Messages
└── Rooms/
    ├── Create Room
    ├── Join Room
    ├── Leave Room
    ├── Get Room by Code
    └── Get My Rooms
```

### Environment Variables
- `baseUrl`: `http://localhost:4000/api`
- `accessToken`: (JWT token after login)
- `userId`: (Current user ID)

---

## OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Gaming Platform API
  version: 1.0.0
  description: Backend API for real-time gaming platform

servers:
  - url: http://localhost:4000/api
    description: Development server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        email:
          type: string
        role:
          type: string
          enum: [customer, seller, admin]
        phone:
          type: string
        avatar:
          type: string
        address:
          type: string
        bio:
          type: string
        isVerified:
          type: boolean
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          type: object

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string

paths:
  /auth/register:
    post:
      tags: [Auth]
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                email: { type: string }
                password: { type: string }
                role: { type: string, enum: [customer, seller] }
                phone: { type: string }
                avatar: { type: string }
                address: { type: string }
                bio: { type: string }
      responses:
        '201':
          description: User registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Invalid input
        '409':
          description: Email already exists

  /auth/login:
    post:
      tags: [Auth]
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string }
                password: { type: string }
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          description: Invalid credentials

  # Additional endpoints follow same pattern...
```

---

## Frontend Navigation Documentation

### Sidebar Structure
```
Dashboard
├── Profile
├── Friends
├── Notifications
├── Chat
├── Rooms
└── Tic-Tac-Toe

Admin (only visible to admins)
└── User Management
```

### Route Structure
```
/                          - Home/Dashboard
/login                     - Login page
/register                  - Register page
/verify-email/:token       - Email verification page
/forgot-password           - Forgot password page
/reset-password/:token     - Reset password page
/profile                   - User profile page
/friends                   - Friends page
/notifications             - Notifications page
/chat                      - Chat list page
/chat/:conversationId      - Individual conversation
/rooms                     - Rooms page
/rooms/:roomCode           - Individual room
/tictactoe/:roomCode       - Tic-Tac-Toe game page
/admin/users               - Admin user management (protected)
/*                         - 404 page
```

### Navigation Menu
- **Dashboard**: `/`
- **Profile**: `/profile`
- **Friends**: `/friends`
- **Notifications**: `/notifications`
- **Chat**: `/chat`
- **Rooms**: `/rooms`
- **Tic-Tac-Toe**: (accessed from room)
- **Admin Users**: `/admin/users` (admin only)

---

## Architecture Review

### 1. Architecture Review
The backend follows a clean Service-Controller-Routes pattern with:
- Clear separation of concerns
- JWT authentication with token refresh
- Joi validation middleware
- Socket.IO for real-time features
- Mongoose ODM for MongoDB
- Centralized error handling
- HTTP-only cookies for security

### 2. Missing API Documentation
No major gaps identified. All endpoints are covered.

### 3. Inconsistencies
- Some routes use PUT, some use PATCH for updates (consistent use recommended)
- Error handling varies slightly between modules (some use ApiError, some use try/catch)

### 4. Frontend Integration Concerns
- Password change sends new password in email (security consideration)
- Socket authentication relies on token in auth payload
- No rate limiting mentioned
- CORS configuration is present

### 5. Module-by-Module Scores
- **Auth**: 9/10 - Comprehensive, but password in email is a concern
- **Users**: 9/10 - Clean and simple
- **Admin**: 8/10 - Good, but lacks pagination
- **Friends**: 10/10 - Complete with notifications
- **Notifications**: 10/10 - Full CRUD and real-time
- **Chat**: 10/10 - REST + Socket implementation
- **Rooms**: 10/10 - Well-structured with real-time
- **Tic-Tac-Toe**: 10/10 - Complete game logic

---

*Documentation generated on 2026-06-06*
