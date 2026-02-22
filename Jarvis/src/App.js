import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [messages, setMessages] = useState([]);
  const [command, setCommand] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const wakeRecognitionRef = useRef(null);
  const isCommandMode = useRef(false);

  // ===============================
  // 🔊 SPEAK FUNCTION
  // ===============================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  };

  // ===============================
  // SAFE START FUNCTION
  // ===============================
  const safeStart = (instance) => {
    if (!instance) return;
    try {
      instance.start();
    } catch (e) {}
  };

  // ===============================
  // 🎤 MAIN COMMAND RECOGNITION
  // ===============================
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      isCommandMode.current = true;
    };

    recognition.onend = () => {
      setListening(false);
      isCommandMode.current = false;

      if (wakeRecognitionRef.current) {
        safeStart(wakeRecognitionRef.current);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendCommand(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  // ===============================
  // 🧠 WAKE WORD SYSTEM
  // ===============================
  useEffect(() => {
    if (!SpeechRecognition) return;

    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = true;
    wakeRecognition.lang = "en-US";

    wakeRecognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (transcript.includes("hey jarvis") && !isCommandMode.current) {
        wakeRecognition.stop();

        speak("Hello sir, what can I do?");

        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Hello sir, what can I do?" },
        ]);

        setTimeout(() => {
          safeStart(recognitionRef.current);
        }, 1500);
      }
    };

    wakeRecognition.onend = () => {
      if (!isCommandMode.current) {
        safeStart(wakeRecognition);
      }
    };

    wakeRecognitionRef.current = wakeRecognition;
    safeStart(wakeRecognition);

    return () => wakeRecognition.stop();
  }, []);

  // ===============================
  // 📡 SEND COMMAND TO BACKEND
  // ===============================
  const sendCommand = async (voiceText) => {
    const finalCommand = voiceText || command;
    if (!finalCommand.trim()) return;

    const userMessage = { type: "user", text: finalCommand };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:5000/command", {
        command: finalCommand,
      });

      const botMessage = { type: "bot", text: res.data.message };
      setMessages((prev) => [...prev, botMessage]);

      speak(res.data.message);
    } catch (error) {
      const errorMsg = "Backend not responding.";
      setMessages((prev) => [...prev, { type: "bot", text: errorMsg }]);
      speak(errorMsg);
    }

    setCommand("");
  };

  // ===============================
  // 🎤 MANUAL MIC BUTTON
  // ===============================
  const startListening = () => {
    safeStart(recognitionRef.current);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1 className="title">JARVIS</h1>

        <div className="ai-core"></div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === "user" ? "user-msg" : "bot-msg"}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* ✅ FORM HANDLES ENTER + BUTTON */}
        <form
          className="input-area"
          onSubmit={(e) => {
            e.preventDefault();
            sendCommand();
          }}
        >
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type your command..."
          />

          <button type="submit">Send</button>

          <div
            className={`mic ${listening ? "listening" : ""}`}
            onClick={startListening}
          >
            🎤
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;