import {create } from "zustand"
import toast from "react-hot-toast"
import {axiosInstance} from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { use } from "react";
import playNotificationSound from "../lib/notificationSound";

export const useChatStore = create ((set,get)=> ({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    unreadMessages: {}, // Object to track unread messages per user: { userId: count }

    getUser : async() => {
        set({isUsersLoading:true});
        try {
            const res = await axiosInstance.get("/messages/users");
            set({users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isUsersLoading:false });
        }
    },

    getMessages : async (userId) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data })
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isMessagesLoading: false});
        }
    },
    sendMessages : async (messageData) => {
        const {selectedUser, messages} = get ();
        set({isSendingMessage: true});
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages : [...messages,res.data]})
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSendingMessage: false});
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) {
            console.log("Socket not connected");
            return;
        }
        socket.on("newMessage", (newMessage) => {
            const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(isMessageFromSelectedUser) {
                const {messages} = get();
                set({ messages: [...messages, newMessage] });
            }
            console.log("New message received:", newMessage);
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },

    // Listen for all incoming messages and show notifications
    listenForMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const {selectedUser, users, unreadMessages} = get();
            const isMessageFromSelectedUser = selectedUser?._id === newMessage.senderId;
            
            // If the message is not from the currently selected user, show notification
            if (!isMessageFromSelectedUser) {
                // Find the sender's info
                const sender = users.find(user => user._id === newMessage.senderId);
                const senderName = sender?.fullName || "Someone";
                
                // Increment unread message count
                const currentUnread = unreadMessages[newMessage.senderId] || 0;
                set({
                    unreadMessages: {
                        ...unreadMessages,
                        [newMessage.senderId]: currentUnread + 1
                    }
                });
                
                // Show toast notification with custom styling
                toast.success(
                    `💬 New message from ${senderName}`,
                    {
                        duration: 4000,
                        style: {
                            background: '#333',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '16px',
                        },
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    }
                );

                // Show browser notification if permission is granted
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(`New message from ${senderName}`, {
                        body: newMessage.text || "Sent you a message",
                        icon: sender?.profilePic || "/avatar.png",
                        tag: newMessage._id,
                    });
                }

                // Play notification sound
                playNotificationSound();
            }
        });
    },

    stopListeningForMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },

   setSelectedUser: (selectedUser) => {
       // Clear unread messages for this user when selecting them
       const {unreadMessages} = get();
       if (selectedUser && unreadMessages[selectedUser._id]) {
           const updatedUnread = {...unreadMessages};
           delete updatedUnread[selectedUser._id];
           set({ selectedUser, unreadMessages: updatedUnread });
       } else {
           set({ selectedUser });
       }
   }
}));