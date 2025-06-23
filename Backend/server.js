require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./DB/connect");
const adminroutes = require("./routes/adminRoutes");
const bodyparser = require("body-parser");
const userroutes = require('./routes/userRoutes')
const halmet = require('helmet')
require('./config/passport')
const passport = require('passport')
const http = require('http'); 
const { Server } = require('socket.io'); 


const app = express();

//  HTTP server for WebSocket
const server = http.createServer(app);

const corOptions = {

  origin: ["http://localhost:5173"],
  credentials:true
}

//  WebSocket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

app.set('io',io)
app.set('connectedUsers',connectedUsers)

// WebSocket connection handler
io.on('connection', (socket) => {

  // When client sends their user ID after authentication
  socket.on('register_user', (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    // Clean up disconnected users
    for (let [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Middleware

app.options('*',cors(corOptions))

app.use(
  cors(corOptions)
);
app.use(cookieParser());
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(halmet())

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// Routes
app.use('/api/admin', adminroutes);
app.use('/userapi/user', userroutes);

// Start Server
connectDB();
const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen to support WebSocket
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
});


