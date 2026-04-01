import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose";


export const getUsersForSidebar = async (req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId }}).select("-password");
        res.status(200).json(filteredUsers)

    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({error: "Internal server error" });
    }
}; 

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async ( req,res) =>{
    try {
        const { text, image} = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl= uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        // later websocket 
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sending Message controller :", error.message);
        res.status(500).json({error: " Internal Server Error"})        
        
    }
}

// Aggregation: chat analytics for a conversation
export const getChatStats = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user._id;

        // Optional date range – default to last 7 days
        const days = parseInt(req.query.days) || 7;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const myObjId = new mongoose.Types.ObjectId(myId);
        const otherObjId = new mongoose.Types.ObjectId(otherUserId);

        const stats = await Message.aggregate([
            // Stage 1: $match – filter messages for this conversation in the date range
            {
                $match: {
                    $or: [
                        { senderId: myObjId, receiverId: otherObjId },
                        { senderId: otherObjId, receiverId: myObjId },
                    ],
                    createdAt: { $gte: since },
                },
            },
            // Stage 2: $facet – run multiple sub-pipelines in one query
            {
                $facet: {
                    // Sub-pipeline A: overall totals grouped by sender
                    senderSplit: [
                        {
                            $group: {
                                _id: "$senderId",
                                totalMessages: { $sum: 1 },
                                textMessages: { $sum: { $cond: [{ $ifNull: ["$text", false] }, 1, 0] } },
                                imageMessages: { $sum: { $cond: [{ $ifNull: ["$image", false] }, 1, 0] } },
                            },
                        },
                    ],
                    // Sub-pipeline B: daily message count trend
                    dailyTrend: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                                },
                                count: { $sum: 1 },
                            },
                        },
                        // Stage inside facet: $sort – sort daily data chronologically
                        { $sort: { _id: 1 } },
                    ],
                    // Sub-pipeline C: grand total
                    totals: [
                        {
                            $group: {
                                _id: null,
                                totalMessages: { $sum: 1 },
                                textMessages: { $sum: { $cond: [{ $ifNull: ["$text", false] }, 1, 0] } },
                                imageMessages: { $sum: { $cond: [{ $ifNull: ["$image", false] }, 1, 0] } },
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            dateRange: { days, since },
            ...stats[0],
        });
    } catch (error) {
        console.log("Error in getChatStats controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Text search: find messages matching a keyword in a conversation
export const searchMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user._id;
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({ error: "Search query 'q' is required" });
        }

        const messages = await Message.find({
            $and: [
                {
                    $or: [
                        { senderId: myId, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: myId },
                    ],
                },
                { $text: { $search: q } },
            ],
        }).sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in searchMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

