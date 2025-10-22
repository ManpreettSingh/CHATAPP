import {create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const SOCKET_URL ="http://localhost:5001"
export const useAuthStore = create((set,get) =>({
    authUser: null,
    isSigningUp: false,
    isLoggingIng: false,
    isUpdatingProfile:false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,


    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get("/auth/check")
            set({authUser   : res.data });  
        } catch (error) {
            console.log("Error in checkAuth: ",error);
            set({authUser: null})
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async(data)=>{
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            toast.success("Account created successfully ")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            set({isSigningUp: false });
        }
    },

    login: async(data) => {
        set({isLoggingIng : true})
        try {
            const res = await axiosInstance.post("/auth/login", data);
            if (res.data) {
                set({authUser: res.data});
                toast.success("Logged in Successfully");
                await get().connectSocket();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error?.response?.data?.message || "Login failed");
        } finally {
            set({isLoggingIng: false });
        }
    },

    logout: async() => {
        try {
            await axiosInstance.post("/auth/logout");
            get().disconnectSocket();
            set({authUser: null});
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    },

    updateProfile: async(data) => {
        set({ isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(error?.response?.data?.message || "Profile update failed");
        } finally {
            set({isUpdatingProfile: false});
        }
    },

    connectSocket: async () => {
        const {authUser } = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(SOCKET_URL, {
            query: {
                userId: authUser._id,
            }
        });
        
        socket.on("connect", () => {
            console.log("Socket connected with ID:", socket.id);
            console.log("User ID:", authUser._id);
        });

        socket.on("getOnlineUsers",(usersIds) => {
            console.log("Received online users:", usersIds);
            set({onlineUsers: usersIds})
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        socket.connect();
        set({socket: socket});
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            console.log("Disconnecting socket...");
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },



}));