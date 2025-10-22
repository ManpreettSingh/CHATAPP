import {Server} from "socket.io"
import http from "http"
import express from "express"


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        console.log("User connected:", userId);
        userSocketMap[userId] = socket.id;
        
        // Emit to all clients immediately when a new user connects
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Find and remove the disconnected user
        const disconnectedUserId = Object.keys(userSocketMap).find(
            key => userSocketMap[key] === socket.id
        );
        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log("Updated online users:", Object.keys(userSocketMap));
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export {io, app, server};