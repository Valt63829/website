import React, { useState } from "react";
import axios from "axios";
import { db } from "../firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../firebase/auth";

function ChatUI() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendCommand = async () => {
    const res = await axios.post("http://localhost:5000/command", {
      command: message
    });

    setResponse(res.data.message);

    await addDoc(collection(db, "chatHistory"), {
      userId: auth.currentUser.uid,
      message,
      response: res.data.message,
      timestamp: new Date()
    });
  };

  return (
    <div>
      <h2>Jarvis</h2>
      <input onChange={(e)=>setMessage(e.target.value)} />
      <button onClick={sendCommand}>Send</button>
      <p>{response}</p>
    </div>
  );
}

export default ChatUI;