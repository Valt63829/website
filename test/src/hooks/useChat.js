import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { getAIResponse } from "../services/llm/index";

export const useChat = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(0); // 🔥 NEW

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chat");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(messages));
  }, [messages]);

  // Load from Firestore when login
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const q = query(
        collection(db, "chats"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const allChats = snapshot.docs.map((doc) => doc.data().messages);

      if (allChats.length > 0) {
        setMessages(allChats[allChats.length - 1]);
      }
    };

    loadChats();
  }, [user]);

  // Fake streaming
  const fakeStream = async (text, onChunk) => {
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((res) => setTimeout(res, 50));
      onChunk(words.slice(0, i + 1).join(" "));
    }
  };

  // Send message
  const sendMessage = async ({ text, file }) => {
    if (!text && !file) return;

    // 🔐 BLOCK after 3 responses (if not logged in)
    if (!user && responseCount >= 3) return;

    const userMsg = {
      role: "user",
      content: text || "",
      file: file ? URL.createObjectURL(file) : null,
    };

    const botMsg = { role: "assistant", content: "" };

    const updated = [...messages, userMsg, botMsg];
    setMessages(updated);
    setLoading(true);

    try {
      let responseText;

      if (file) {
        responseText = "I received your file. Processing...";
      } else {
        responseText = await getAIResponse(messages, text);
      }

      await fakeStream(responseText, (chunk) => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].content = chunk;
          return copy;
        });
      });

      // 🔥 increase response count
      if (!user) {
        setResponseCount((prev) => prev + 1);
      }

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, "chats"), {
          uid: user.uid,
          messages: updated,
          createdAt: new Date(),
        });
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setResponseCount(0); // 🔥 reset
    localStorage.removeItem("chat");
  };

  return {
    messages,
    sendMessage,
    loading,
    clearChat,
    responseCount, // 🔥 EXPORT
  };
};