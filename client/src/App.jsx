import React from "react";
import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./components/Dashboard";

function App() {
  // Theme state initialization
  const [theme, setTheme] = useState(() => {
    // Prefer stored preference; default to light regardless of system mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return "light";
  });

  // Effect to apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <Dashboard theme={theme} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
}

export default App;
