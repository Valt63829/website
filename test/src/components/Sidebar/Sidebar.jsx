import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import ProfileModal from "../profile/ProfileModal";

const Sidebar = ({ clearChat, toggleSidebar }) => {
  const { user, userName, avatarLetter } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="h-screen w-72 backdrop-blur-2xl bg-white/5 border-r border-white/10 flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="logo"
              className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/20"
            />

            <h1 className="text-2xl font-bold text-white">
              ArcNova
            </h1>
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* NEW CHAT */}
        <div className="p-5">
          <button
            onClick={clearChat}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xl text-white font-medium transition-all duration-300 shadow-lg"
          >
            + New Chat
          </button>
        </div>

        {/* HISTORY */}
        <div className="px-5">

          <p className="text-gray-300 text-sm mb-5 uppercase tracking-wider">
            No chats yet
          </p>

        </div>
      </div>

      {/* BOTTOM PROFILE */}
      <div className="p-5 border-t border-white/10 relative">

        <div
          onClick={() => setOpenMenu((prev) => !prev)}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >

          {/* AVATAR */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {avatarLetter}
          </div>

          {/* USER INFO */}
          <div className="flex flex-col">

            <span className="text-white font-semibold">
              {userName}
            </span>

            <span className="text-xs text-gray-400">
              {userName === "Guest"
                ? "Not logged in"
                : "Online"}
            </span>

          </div>

        </div>

        {openMenu && (
          <div className="absolute bottom-20 left-0 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl">
            <button
              onClick={() => {
                setShowProfile(true);
                setOpenMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-white/10"
            >
              👤 Profile
            </button>
            
            <button className="w-full text-left px-4 py-2 hover:bg-white/10">
              🎨 Theme
            </button>

            <button className="w-full text-left px-4 py-2 hover:bg-white/10">
              ⚙️ Account
            </button>

            {user && (
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
              >
                🚪 Logout
              </button>
            )}

          </div>
        )}

      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

    </div>
  );
};
export default Sidebar;