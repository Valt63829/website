import { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import Navbar from "../components/Navbar/Navbar";
import AuthModal from "../components/Auth/AuthModal";

import logo from "../assets/logo.png";

const Home = () => {
  const {
    messages,
    sendMessage,
    loading,
    clearChat,
    responseCount,
  } = useChat();

  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // 🔥 SHOW LOGIN AFTER 3 RESPONSES
  useEffect(() => {
    if (!user && responseCount >= 3) {
      setShowLogin(true);
    }
  }, [responseCount, user]);

  return (
    <div className="relative h-screen overflow-hidden text-white">

      {/* CLASSIC BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />

      {/* 🔥 SIDEBAR CLOSED LOGO */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-110 transition-all flex items-center justify-center"
        >
          <img
            src={logo}
            alt="logo"
            className="w-8 h-8 rounded-full object-cover"
          />
        </button>
      )}

      {/* 🔥 MAIN LAYOUT */}
      <div className="flex h-full">

        {/* SIDEBAR */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          } overflow-hidden`}
        >
          <Sidebar
            clearChat={clearChat}
            toggleSidebar={() => setSidebarOpen(false)}
          />
        </div>

        {/* MAIN AREA */}
        <div className="flex flex-col flex-1 relative">

          {/* NAVBAR */}
          <Navbar sidebarOpen={sidebarOpen} />

          {/* 🔥 NO MESSAGE SCREEN */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 px-6">

              {/* TITLE */}
              <h1 className="text-5xl md:text-6xl font-semibold mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-center">
                Welcome
              </h1>

              {/* CENTER INPUT */}
              <div className="w-full max-w-4xl transition-all duration-500">
                <ChatInput
                  onSend={sendMessage}
                  loading={loading}
                  disabled={!user && responseCount >= 3}
                />
              </div>
            </div>
          ) : (
            <>
              {/* CHAT WINDOW */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl w-full mx-auto space-y-6 scrollbar-hide">
                <ChatWindow
                  messages={messages}
                  loading={loading}
                />
              </div>

              {/* BOTTOM INPUT */}
              <div className="sticky bottom-0 w-full px-4 md:px-8 pb-6 backdrop-blur-md bg-black/10 border-t border-white/5">
                <div className="max-w-5xl mx-auto pt-4">
                  <ChatInput
                    onSend={sendMessage}
                    loading={loading}
                    disabled={!user && responseCount >= 3}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🔥 LOGIN MODAL */}
      {showLogin && !user && (
        <AuthModal onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
};

export default Home;