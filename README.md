# Backend Practice Summer

A modern, modular backend application built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication**: JWT-based auth with access/refresh tokens
- 👥 **User Management**: Registration, login, profile updates, password reset
- 🛡️ **Admin Panel**: Manage users, roles, and statuses
- 📧 **Email Integration**: Password reset, notifications via SMTP
- ✅ **Validation**: Input validation with Joi
- 📁 **Modular Architecture**: Clean separation of concerns
- 🔒 **Security**: Password hashing with bcrypt

## Tech Stack

- **Node.js** - Runtime environment
- **Express 5.x** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Joi** - Validation
- **Nodemailer** - Email services

## Project Structure

```
Backend-Practice-summer/
├── src/
│   ├── common/
│   │   ├── config/          # Configuration files (db, email)
│   │   ├── dto/             # Data transfer objects
│   │   ├── middleware/      # Middleware (error handler, validation)
│   │   └── utils/           # Utility functions
│   ├── modules/
│   │   ├── admin/           # Admin module (controller, model, routes, service)
│   │   ├── auth/            # Auth module (controller, model, routes, service)
│   │   ├── dto/             # Module-specific DTOs
│   │   └── user/            # User module (controller, routes, service)
│   └── app.js               # Express app setup
├── .env                     # Environment variables
├── env.example              # Example environment variables
├── package.json
└── server.js                # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB or MongoDB Atlas account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment example file:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_ACCESS_SECRET`: Secret for access tokens
   - `JWT_REFRESH_SECRET`: Secret for refresh tokens
   - `SMTP_*`: Email service configuration

### Running the Application

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will be available at `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `DELETE /api/user/delete-account` - Delete account

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/user/:id/role` - Update user role
- `PUT /api/admin/user/:id/status` - Update user status
- `PUT /api/admin/user/:id` - Update user details

## License

ISC
