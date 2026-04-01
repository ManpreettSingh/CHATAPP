import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    text: {
        type : String,
    },
    image: {
        type: String,
    },
    },
    {timestamps: true}
);

// Compound index: speeds up fetching messages between two users sorted by time
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Text index: enables full-text search on message content
messageSchema.index({ text: "text" });

const Message = mongoose.model("Message ", messageSchema);

export default Message;