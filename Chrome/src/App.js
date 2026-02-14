import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [bgImage, setBgImage] = useState(null);
  const fileInputRef = useRef();

  const searchGoogle = (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    if (query) {
      window.location.href =
        "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
  };

  const urlSearch = (e) => {
    e.preventDefault();
    const url = e.target.url.value;
    if (!url) return;

    if (url.includes(".") && !url.includes(" ")) {
      window.location.href =
        url.startsWith("http") ? url : "https://" + url;
    } else {
      window.location.href =
        "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBgImage(URL.createObjectURL(file));
    }
  };

  return (
    <div
      className={`app ${darkMode ? "dark" : "light"}`}
      style={{
        backgroundImage: bgImage
          ? `url(${bgImage})`
          : "linear-gradient(to right, #202124, #303134)"
      }}
    >
      {/* Top Bar */}
      <div className="top-bar">
        <form onSubmit={urlSearch} className="url-bar">
          <span className="icon">🔒</span>
          <input
            type="text"
            name="url"
            placeholder="Search Google or type a URL"
          />
        </form>

        <div className="top-actions">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙" : "☀️"}
          </button>
          <button onClick={() => fileInputRef.current.click()}>
            🖼
          </button>
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleBackgroundUpload}
          />
        </div>
      </div>

      {/* Center Logo */}
      <div className="center">
        <h1 className="logo">
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>o</span>
          <span style={{ color: "#FBBC05" }}>o</span>
          <span style={{ color: "#4285F4" }}>g</span>
          <span style={{ color: "#34A853" }}>l</span>
          <span style={{ color: "#EA4335" }}>e</span>
        </h1>

        {/* Main Search */}
        <form onSubmit={searchGoogle} className="search-box">
          <span className="icon">🔍</span>
          <input
            type="text"
            name="query"
            placeholder="Search Google"
          />
          <span className="icon">🎤</span>
        </form>
      </div>
    </div>
  );
}

export default App;
