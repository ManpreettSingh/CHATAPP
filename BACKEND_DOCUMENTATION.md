# 📚 BACKEND COMPLETE DOCUMENTATION

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technologies & Dependencies](#technologies--dependencies)
4. [Database Models](#database-models)
5. [Server Setup & Configuration](#server-setup--configuration)
6. [Authentication System](#authentication-system)
7. [Messaging System](#messaging-system)
8. [Real-Time Communication (Socket.IO)](#real-time-communication-socketio)
9. [Middleware](#middleware)
10. [Routes & API Endpoints](#routes--api-endpoints)
11. [Controllers](#controllers)
12. [Utilities & Helpers](#utilities--helpers)
13. [Security Features](#security-features)
14. [Environment Variables](#environment-variables)


## Overview

This is a **real-time chat application backend** built with Node.js and Express. It provides:
- User authentication (signup, login, logout)
- Real-time messaging with Socket.IO
- Image upload functionality via Cloudinary
- JWT-based authentication
- MongoDB database for data persistence

---

## Project Structure

```
backend/
├── src/
│   ├── index.js                    # Main server entry point
│   ├── controllers/                # Business logic
│   │   ├── auth.controllers.js     # Authentication logic
│   │   └── message.controller.js   # Messaging logic
│   ├── lib/                        # Utilities & configurations
│   │   ├── cloudinary.js           # Cloudinary setup
│   │   ├── db.js                   # MongoDB connection
│   │   ├── socket.js               # Socket.IO configuration
│   │   └── utils.js                # Helper functions (JWT generation)
│   ├── middleware/                 # Express middleware
│   │   └── auth.middleware.js      # Authentication middleware
│   ├── models/                     # Database schemas
│   │   ├── message.model.js        # Message schema
│   │   └── user.model.js           # User schema
│   └── routes/                     # API routes
│       ├── auth.route.js           # Auth endpoints
│       └── message.route.js        # Message endpoints
├── package.json                    # Project dependencies
└── .env                            # Environment variables
```

---

## Technologies & Dependencies

### Core Technologies
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time bidirectional communication

### Key Dependencies

```json
{
  "bcryptjs": "^3.0.2",          // Password hashing
  "cloudinary": "^2.7.0",        // Image upload/storage
  "cookie-parser": "^1.4.7",     // Parse cookies
  "cors": "^2.8.5",              // Cross-origin resource sharing
  "dotenv": "^17.2.3",           // Environment variables
  "express": "^5.1.0",           // Web framework
  "jsonwebtoken": "^9.0.2",      // JWT authentication
  "mongoose": "^8.19.1",         // MongoDB ODM
  "socket.io": "^4.8.1"          // Real-time communication
}
```

### Dev Dependencies
- **nodemon** - Auto-restart server on file changes

---

## Database Models

### 1. User Model (`user.model.js`)

**Purpose:** Stores user account information

```javascript
{
  email: String,        // Unique user email
  fullName: String,     // User's full name
  password: String,     // Hashed password (min 6 chars)
  profilePic: String,   // Cloudinary image URL (default: "")
  timestamps: true      // createdAt, updatedAt
}
```

**Features:**
- Email must be unique
- Password is hashed before storage (never stored in plain text)
- Automatic timestamps for tracking account creation/updates
- Optional profile picture

**Schema Definition:**
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: "",
  },
}, { timestamps: true });
```

---

### 2. Message Model (`message.model.js`)

**Purpose:** Stores chat messages between users

```javascript
{
  senderId: ObjectId,      // Reference to User who sent
  receiverId: ObjectId,    // Reference to User who receives
  text: String,            // Message text content (optional)
  image: String,           // Cloudinary image URL (optional)
  timestamps: true         // createdAt, updatedAt
}
```

**Features:**
- References to User model for sender and receiver
- Supports text messages, images, or both
- Automatic timestamps for message tracking
- Can send text-only, image-only, or both together

**Schema Definition:**
```javascript
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
}, { timestamps: true });
```

---

## Server Setup & Configuration

### Main Server File (`index.js`)

**Purpose:** Entry point that initializes the server and connects all components

```javascript
import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js"
import cors from "cors"
import { app, server } from "./lib/socket.js"

dotenv.config()

const PORT = process.env.PORT

// Middleware
app.use(express.json({ limit: '10mb' }))           // Parse JSON bodies (10MB limit)
app.use(express.urlencoded({ limit: '10mb', extended: true })) // Parse URL-encoded data
app.use(cookieParser())                             // Parse cookies
app.use(cors({
  origin: "http://localhost:5173",                  // Frontend URL
  credentials: true,                                // Allow cookies
}))

// Routes
app.use("/api/auth", authRoutes)                    // Authentication endpoints
app.use("/api/messages", messageRoutes)             // Message endpoints

// Start server
server.listen(PORT, () => {
  console.log("server is running on PORT: ", PORT)
  connectDB()                                       // Connect to MongoDB
})
```

**Key Configuration:**
- **Body Parsing:** Accepts JSON and URL-encoded data up to 10MB (for image uploads)
- **Cookie Parser:** Enables reading JWT tokens from cookies
- **CORS:** Allows frontend (localhost:5173) to access backend
- **Credentials:** Enables sending cookies cross-origin
- **Routes:** Prefixes all auth routes with `/api/auth` and messages with `/api/messages`

---

### Database Connection (`lib/db.js`)

**Purpose:** Establishes connection to MongoDB

```javascript
export const connectDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch(error) {
    console.log("MongoDB connection error:", error)
  }
}
```

**Flow:**
1. Reads MongoDB URI from environment variables
2. Attempts connection using Mongoose
3. Logs success or failure
4. Connection is maintained throughout app lifecycle

---

### Cloudinary Setup (`lib/cloudinary.js`)

**Purpose:** Configure image upload service

```javascript
import { v2 as cloudinary } from "cloudinary"
import { config } from 'dotenv'

config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary
```

**What is Cloudinary?**
- Cloud-based image and video management service
- Stores profile pictures and message images
- Provides secure URLs for uploaded images
- Handles image optimization automatically

---

## Authentication System

### How Authentication Works

```
User Signup/Login
       ↓
Password Hashed (bcrypt)
       ↓
JWT Token Generated
       ↓
Token Stored in HTTP-Only Cookie
       ↓
Token Sent with Every Request
       ↓
Middleware Verifies Token
       ↓
User Authenticated
```

---

### 1. Signup Process (`signup` controller)

**Endpoint:** `POST /api/auth/signup`

**What it does:**
1. Receives user data (fullName, email, password)
2. Validates all fields are provided
3. Checks password length (minimum 6 characters)
4. Checks if email already exists in database
5. Hashes the password using bcrypt (10 salt rounds)
6. Creates new user in database
7. Generates JWT token
8. Sends token as HTTP-only cookie
9. Returns user data (without password)

**Code Breakdown:**
```javascript
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body
  
  try {
    // STEP 1: Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }
    
    // STEP 2: Check password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      })
    }
    
    // STEP 3: Check if email exists
    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "Email already exists" })
    }
    
    // STEP 4: Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // STEP 5: Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    })
    
    // STEP 6: Generate JWT token
    if (newUser) {
      generateToken(newUser._id, res)
      await newUser.save()
      
      // STEP 7: Return user data
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      })
    }
  } catch (error) {
    console.log("Error in signup controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
```

**Why Hash Passwords?**
- Never store plain text passwords
- If database is compromised, passwords are still safe
- bcrypt is one-way encryption (cannot be decrypted)
- Salt adds randomness to prevent rainbow table attacks

---

### 2. Login Process (`login` controller)

**Endpoint:** `POST /api/auth/login`

**What it does:**
1. Receives email and password
2. Finds user by email
3. Compares provided password with hashed password
4. Generates JWT token if password matches
5. Returns user data

**Code Breakdown:**
```javascript
export const login = async (req, res) => {
  const { email, password } = req.body
  
  try {
    // STEP 1: Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    
    // STEP 2: Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    
    // STEP 3: Generate token
    generateToken(user._id, res)
    
    // STEP 4: Return user data
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.log("Error in login controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
```

**Security Note:** Never reveal whether email or password was wrong - always say "Invalid credentials"

---

### 3. JWT Token Generation (`lib/utils.js`)

**Purpose:** Create and store JWT tokens

```javascript
export const generateToken = (userId, res) => {
  // STEP 1: Create JWT with userId payload
  const token = jwt.sign(
    { userId },                           // Payload
    process.env.JWT_SECRET,               // Secret key
    { expiresIn: "7d" }                   // Expires in 7 days
  )
  
  // STEP 2: Store token in HTTP-only cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,     // 7 days in milliseconds
    httpOnly: true,                       // Cannot be accessed by JavaScript
    sameSite: "strict",                   // CSRF protection
    secure: process.env.NODE_ENV !== "development",  // HTTPS only in production
  })
  
  return token
}
```

**What is JWT?**
- **JSON Web Token** - Secure way to transmit information
- Contains 3 parts: Header, Payload, Signature
- Encoded but NOT encrypted (don't put sensitive data)
- Used to verify user identity without database lookup

**Cookie Options Explained:**
- **httpOnly:** Prevents XSS attacks (JavaScript can't access)
- **sameSite:** Prevents CSRF attacks (only sent to same site)
- **secure:** Only sends over HTTPS in production
- **maxAge:** Cookie expires after 7 days

---

### 4. Logout (`logout` controller)

**Endpoint:** `POST /api/auth/logout`

**What it does:**
1. Clears the JWT cookie
2. Returns success message

```javascript
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 })  // Clear cookie
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.log("Error in logout controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
```

---

### 5. Update Profile (`updateProfile` controller)

**Endpoint:** `PUT /api/auth/update-profile`

**What it does:**
1. Receives new profile picture (base64 encoded)
2. Uploads to Cloudinary
3. Updates user in database
4. Returns updated user data

```javascript
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body
    const userId = req.user._id  // From auth middleware
    
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" })
    }
    
    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }  // Return updated document
    )
    
    res.status(200).json(updatedUser)
  } catch (error) {
    console.log("Error in update profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
```

---

### 6. Check Auth (`checkAuth` controller)

**Endpoint:** `GET /api/auth/check`

**What it does:**
- Verifies if user is authenticated
- Returns current user data
- Used on app startup to maintain login state

```javascript
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user)  // req.user set by protectRoute middleware
  } catch (error) {
    console.log("Error in checkAuth controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
```

---

## Middleware

### Authentication Middleware (`protectRoute`)

**Purpose:** Verify JWT token and authenticate requests

**Location:** `middleware/auth.middleware.js`

```javascript
export const protectRoute = async (req, res, next) => {
  try {
    // STEP 1: Get token from cookie
    const token = req.cookies.jwt
    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No Token Provided" 
      })
    }
    
    // STEP 2: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid Token" 
      })
    }
    
    // STEP 3: Find user from token
    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // STEP 4: Attach user to request
    req.user = user
    next()  // Continue to route handler
    
  } catch (error) {
    console.log("Error in protecting middleware:", error.message)
    res.status(500).json({ message: "Internal Server error" })
  }
}
```

**How it Works:**
1. Extracts JWT from cookie
2. Verifies token signature and expiration
3. Fetches user from database
4. Attaches user object to request
5. Calls `next()` to proceed to route handler

**Usage:**
```javascript
router.get("/protected-route", protectRoute, controllerFunction)
```

---

## Messaging System

### 1. Get Users for Sidebar (`getUsersForSidebar`)

**Endpoint:** `GET /api/messages/users`

**Purpose:** Get list of all users except current user

```javascript
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    
    // Find all users except current user
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId }  // $ne = "not equal"
    }).select("-password")          // Exclude password field
    
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}
```

**Returns:**
```json
[
  {
    "_id": "user_id_1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/image.jpg"
  },
  ...
]
```

---

### 2. Get Messages (`getMessages`)

**Endpoint:** `GET /api/messages/:id`

**Purpose:** Get all messages between current user and another user

```javascript
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params  // Other user's ID
    const myId = req.user._id                // Current user's ID
    
    // Find all messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },      // I sent
        { senderId: userToChatId, receiverId: myId },      // They sent
      ],
    })
    
    res.status(200).json(messages)
  } catch (error) {
    console.log("Error in getMessages controller:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}
```

**Query Explanation:**
- `$or` operator finds messages where EITHER condition is true
- Gets messages in both directions (sent and received)
- Returns messages in chronological order

---

### 3. Send Message (`sendMessages`)

**Endpoint:** `POST /api/messages/send/:id`

**Purpose:** Send a text/image message to another user

```javascript
export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body
    const { id: receiverId } = req.params
    const senderId = req.user._id
    
    let imageUrl
    
    // STEP 1: Upload image to Cloudinary if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }
    
    // STEP 2: Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    })
    
    await newMessage.save()
    
    // STEP 3: Send real-time notification via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }
    
    res.status(201).json(newMessage)
  } catch (error) {
    console.log("Error in sending Message controller:", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
```

**Flow:**
1. Extract message data and receiver ID
2. Upload image to Cloudinary if present
3. Save message to database
4. Check if receiver is online (has socket connection)
5. If online, emit "newMessage" event via Socket.IO
6. Return saved message

---

## Real-Time Communication (Socket.IO)

### Socket.IO Setup (`lib/socket.js`)

**Purpose:** Enable real-time bidirectional communication

```javascript
import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true
  }
})

// Map to store online users: { userId: socketId }
const userSocketMap = {}

// Helper function to get socket ID by user ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}

// Connection event
io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id)
  
  const userId = socket.handshake.query.userId
  
  if (userId) {
    console.log("User connected:", userId)
    userSocketMap[userId] = socket.id
    
    // Broadcast online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  }
  
  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    
    // Find and remove disconnected user
    const disconnectedUserId = Object.keys(userSocketMap).find(
      key => userSocketMap[key] === socket.id
    )
    
    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId]
      console.log("Updated online users:", Object.keys(userSocketMap))
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
    }
  })
})

export { io, app, server }
```

### How Socket.IO Works

**1. User Connects:**
```
User logs in → Frontend connects to Socket.IO
       ↓
Sends userId in connection query
       ↓
Backend stores: userSocketMap[userId] = socketId
       ↓
Broadcasts online users list to everyone
```

**2. Sending Messages:**
```
User A sends message
       ↓
Message saved to database
       ↓
Backend looks up User B's socketId
       ↓
If online: emit "newMessage" to User B's socket
       ↓
User B receives message instantly
```

**3. User Disconnects:**
```
User closes browser/logs out
       ↓
"disconnect" event fired
       ↓
Remove user from userSocketMap
       ↓
Broadcast updated online users list
```

### Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `connection` | Client → Server | User connects |
| `disconnect` | Client → Server | User disconnects |
| `getOnlineUsers` | Server → Client | Send list of online users |
| `newMessage` | Server → Client | Send new message to specific user |

---

## Routes & API Endpoints

### Authentication Routes (`routes/auth.route.js`)

```javascript
import express from "express"
import { 
  checkAuth, 
  login, 
  logout, 
  signup, 
  updateProfile 
} from "../controllers/auth.controllers.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes (no authentication required)
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

// Protected routes (authentication required)
router.put("/update-profile", protectRoute, updateProfile)
router.get("/check", protectRoute, checkAuth)

export default router
```

### Complete Auth API Reference

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/signup` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login to account |
| POST | `/api/auth/logout` | ❌ | Logout (clear cookie) |
| PUT | `/api/auth/update-profile` | ✅ | Update profile picture |
| GET | `/api/auth/check` | ✅ | Check if authenticated |

---

### Message Routes (`routes/message.route.js`)

```javascript
import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessages 
} from "../controllers/message.controller.js"

const router = express.Router()

// All message routes require authentication
router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessages)

export default router
```

### Complete Message API Reference

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/messages/users` | ✅ | Get all users for sidebar |
| GET | `/api/messages/:id` | ✅ | Get messages with specific user |
| POST | `/api/messages/send/:id` | ✅ | Send message to user |

---

## Security Features

### 1. Password Security
- **bcrypt hashing** with 10 salt rounds
- Passwords never stored in plain text
- Salts prevent rainbow table attacks

### 2. JWT Security
- **httpOnly cookies** prevent XSS attacks
- **sameSite: strict** prevents CSRF attacks
- **7-day expiration** limits token lifetime
- Secret key stored in environment variable

### 3. CORS Protection
- Only allows requests from frontend origin
- Credentials enabled for cookie transmission

### 4. Input Validation
- All endpoints validate required fields
- Password minimum length enforced
- Email uniqueness verified

### 5. Error Handling
- Generic error messages (don't reveal system info)
- Try-catch blocks on all async operations
- Proper HTTP status codes

---

## Environment Variables

Required `.env` file:

```env
# Server Configuration
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT Secret (random string)
JWT_SECRET=your_secret_key_here_make_it_long_and_random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Environment
NODE_ENV=development
```

### How to Get Cloudinary Credentials
1. Go to https://cloudinary.com/
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

---

## Complete Request/Response Flow

### Example: Sending a Message

**1. Client Request:**
```javascript
POST /api/messages/send/USER_ID_123
Headers: {
  Cookie: "jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Body: {
  "text": "Hello!",
  "image": null
}
```

**2. Server Processing:**
```
Request arrives
       ↓
protectRoute middleware runs
       ↓
JWT verified, user authenticated
       ↓
req.user set with user data
       ↓
sendMessages controller executes
       ↓
Message saved to MongoDB
       ↓
Check if receiver is online
       ↓
If online: emit Socket.IO event
       ↓
Return message to sender
```

**3. Server Response:**
```json
{
  "_id": "message_id_456",
  "senderId": "current_user_id",
  "receiverId": "USER_ID_123",
  "text": "Hello!",
  "image": null,
  "createdAt": "2025-11-02T10:30:00.000Z",
  "updatedAt": "2025-11-02T10:30:00.000Z"
}
```

**4. Real-Time Notification:**
```javascript
// Receiver's browser receives:
socket.on("newMessage", (message) => {
  // Message object (same as above)
})
```

---

## Summary

### Key Concepts

1. **Express Server** - Handles HTTP requests/responses
2. **MongoDB/Mongoose** - Stores users and messages
3. **JWT Authentication** - Secure, stateless authentication
4. **Socket.IO** - Real-time message delivery
5. **Cloudinary** - Cloud storage for images
6. **bcrypt** - Password hashing
7. **Middleware** - Request processing pipeline
8. **REST API** - Standard endpoint structure

### Data Flow

```
Client Request
     ↓
Express Middleware (CORS, JSON parsing, cookies)
     ↓
Authentication Middleware (JWT verification)
     ↓
Route Handler
     ↓
Controller (Business Logic)
     ↓
Database (MongoDB)
     ↓
Response to Client
     ↓
Socket.IO (if real-time update needed)
```

### Why This Architecture?

- **Separation of Concerns** - Routes, controllers, models separated
- **Reusability** - Middleware can be used across routes
- **Scalability** - Easy to add new features
- **Security** - Multiple layers of protection
- **Real-time** - Socket.IO for instant updates
- **Cloud Storage** - Cloudinary handles images efficiently

---

## 🎓 Learning Points

After understanding this backend, you should know:

✅ How to build a REST API with Express  
✅ How to implement JWT authentication  
✅ How to use MongoDB with Mongoose  
✅ How to implement real-time features with Socket.IO  
✅ How to handle file uploads with Cloudinary  
✅ How to secure an API with middleware  
✅ How to structure a Node.js application  
✅ How to handle cookies and sessions  
✅ How to implement CORS  
✅ How to hash passwords securely  

---

**End of Backend Documentation** 📚
