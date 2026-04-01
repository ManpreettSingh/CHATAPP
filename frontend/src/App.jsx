import React from "react";
import Navbar from "./components/Navbar";
import { Routes,Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { axiosInstance } from "./lib/axios";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import {Loader} from "lucide-react"
import {Toaster} from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

function App() {
  const { authUser, checkAuth , isCheckingAuth ,onlineUsers } = useAuthStore();
  const { listenForMessages, stopListeningForMessages } = useChatStore();

  console.log({ onlineUsers })

  useEffect(()=>{
    checkAuth()
  },[checkAuth]);

  // Request notification permission
  useEffect(() => {
    if (authUser && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [authUser]);

  // Start listening for messages globally when user is authenticated
  useEffect(() => {
    if (authUser) {
      listenForMessages();
      return () => stopListeningForMessages();
    }
  }, [authUser, listenForMessages, stopListeningForMessages]);

  const {theme} = useThemeStore()
  console.log({authUser});

  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )

  return (
    <div data-theme={theme} >
      <Navbar/> 
      <Routes>
        <Route path="/" element={authUser ? <HomePage />:<Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> :<Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> :<Navigate to="/" /> } />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage />:<Navigate to="/login"/>} />
      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
