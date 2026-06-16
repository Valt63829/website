import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages, loading }) => {
  return (
    <div className="space-y-6">
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}

      {/* ✅ Typing Indicator */}
      {loading && (
        <div className="text-gray-400 text-sm">
          AI is typing...
        </div>
      )}
    </div>
  );
};

export default ChatWindow;