const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`max-w-[70%] p-3 rounded-xl text-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-200"
        }`}
      >
        {message.content}

{message.file && (
  <img
    src={message.file}
    alt="upload"
    className="mt-2 rounded-lg max-h-40"
  />
)}
      </div>

    </div>
  );
};

export default ChatMessage;