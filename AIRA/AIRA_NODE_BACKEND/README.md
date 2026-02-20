# HR Assistant Backend API

Backend authentication system for the HR AI Calling System built with Node.js, Express, MongoDB, JWT, and bcryptjs.

## Features

- User registration with password hashing
- User login with JWT token generation
- Protected routes with JWT authentication middleware
- MongoDB database integration
- Error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `PORT`: Server port (default: 5000)

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Endpoints

#### Register a new user
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional: user, admin, hr_manager
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── models/
│   └── User.js           # User model
├── routes/
│   └── authRoutes.js     # Auth endpoints
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Entry point
```

## Technologies Used

- **Express.js**: Web framework
- **MongoDB & Mongoose**: Database and ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment configuration
- **cors**: Cross-origin resource sharing

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token-based authentication
- Protected routes with authentication middleware
- Email validation
- Password minimum length validation
- Environment variable protection

## Testing

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Insomnia

## Notes

- Make sure MongoDB is running before starting the server
- Change the `JWT_SECRET` in production to a strong, random string
- The default JWT token expiration is set to 30 days
