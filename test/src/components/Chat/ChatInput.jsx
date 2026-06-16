import { useState, useRef } from "react";

const ChatInput = ({ onSend, loading, disabled }) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const handleSend = () => {
  console.log("Sending:", input, file); // 👈 add this

  if (!input.trim() && !file) return;
  if (disabled) return;

  onSend({
    text: input,
    file: file,
  });

  setInput("");
  setFile(null);
};

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  return (
    <div className="w-full">

      {file && (
        <div className="mb-2 bg-white/5 border border-white/10 rounded-lg p-2 text-sm flex items-center justify-between">
          <span className="truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-red-400">
            ✕
          </button>
        </div>
      )}

      <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 shadow-xl ${disabled ? "opacity-50" : ""}`}>

        <button
          onClick={() => fileRef.current.click()}
          className="text-gray-400 text-lg"
          disabled={disabled}
        >
          📎
        </button>

        <input
          type="file"
          ref={fileRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          placeholder={disabled ? "Login to continue..." : "Ask anything"}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button className="text-gray-400" disabled={disabled}>
          🎤
        </button>

        <button
          onClick={handleSend}
          disabled={loading || disabled}
          className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatInput;