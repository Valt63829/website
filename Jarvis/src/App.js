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

  // ============================================
  // 🎤 MAIN COMMAND LISTENER
  // ============================================
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      console.log("Command listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Command heard:", transcript);
      sendCommand(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      console.log("Command ended");
      // 🔥 Restart wake word after command finishes
      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.start();
      }
    };

    recognition.onerror = (event) => {
      console.log("Command error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  // ============================================
  // 🧠 WAKE WORD LISTENER (HEY JARVIS)
  // ============================================
  useEffect(() => {
    if (!SpeechRecognition) return;

    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = true;
    wakeRecognition.lang = "en-US";

    wakeRecognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      console.log("Wake hearing:", transcript);

      if (transcript.includes("hey jarvis")) {
        console.log("Wake word detected!");
        wakeRecognition.stop(); // stop wake
        if (recognitionRef.current) {
          recognitionRef.current.start(); // start command mic
        }
      }
    };

    wakeRecognition.onend = () => {
      console.log("Wake ended - restarting...");
      wakeRecognition.start(); // 🔥 auto restart
    };

    wakeRecognition.onerror = (event) => {
      console.log("Wake error:", event.error);
    };

    wakeRecognition.start();
    wakeRecognitionRef.current = wakeRecognition;

    return () => wakeRecognition.stop();
  }, []);

  // ============================================
  // 🔊 SPEAK FUNCTION
  // ============================================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  };

  // ============================================
  // 📡 SEND COMMAND TO BACKEND
  // ============================================
  const sendCommand = async (voiceText) => {
    const finalCommand = voiceText || command;
    if (!finalCommand) return;

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

  // ============================================
  // 🎤 MANUAL MIC BUTTON
  // ============================================
  const startListening = () => {
    if (wakeRecognitionRef.current) {
      wakeRecognitionRef.current.stop(); // stop wake first
    }
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1 className="title">JARVIS</h1>

        <div className={`ai-core ${listening ? "active" : ""}`}></div>

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

        <div className="input-area">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type your command..."
          />
          <button onClick={() => sendCommand()}>Send</button>

          <div
            className={`mic ${listening ? "listening" : ""}`}
            onClick={startListening}
          >
            🎤
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;