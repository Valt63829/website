import { useTheme } from "../../context/ThemeContext";

const SettingsModal = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">

      <div className="bg-[#0f172a] p-6 rounded-xl w-80 border border-white/10">

        <h2 className="text-lg mb-4">Settings</h2>

        <button
          onClick={toggleTheme}
          className="w-full p-3 bg-white/10 rounded-lg"
        >
          Toggle Theme ({theme})
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-white text-black py-2 rounded-lg"
        >
          Close
        </button>

      </div>
    </div>
  );
};

export default SettingsModal;