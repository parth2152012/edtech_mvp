import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import UploadPage from "./pages/UploadPage"
import HintsPage from "./pages/HintsPage"
import QuizPage from "./pages/QuizPage"
import StudyBuddyPage from "./pages/StudyBuddyPage"

export default function App() {
  const [mode, setMode] = useState("quiz") // "quiz" | "study"

  return (
    <Router>
      <div style={{ fontFamily: "Inter, Arial, sans-serif", maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ color: "#2563eb", fontSize: "2rem", marginBottom: "0.5rem" }}>🚀 EdTech MVP</h1>
          <p style={{ color: "#6b7280" }}>Your AI-powered Learning Assistant</p>

          {/* Mode Switch */}
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={() => setMode("quiz")}
              style={{
                padding: "0.6rem 1.2rem",
                marginRight: "1rem",
                background: mode === "quiz" ? "#2563eb" : "#e5e7eb",
                color: mode === "quiz" ? "white" : "black",
                fontWeight: "bold",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              📝 Quiz Mode
            </button>
            <button
              onClick={() => setMode("study")}
              style={{
                padding: "0.6rem 1.2rem",
                background: mode === "study" ? "#16a34a" : "#e5e7eb",
                color: mode === "study" ? "white" : "black",
                fontWeight: "bold",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              🎓 Study Buddy
            </button>
          </div>

          {/* Nav Links */}
          {mode === "quiz" && (
            <nav style={{ marginTop: "1rem" }}>
              <Link to="/upload" style={{ marginRight: "1rem", textDecoration: "none", color: "#2563eb" }}>Upload</Link>
              <Link to="/hints" style={{ marginRight: "1rem", textDecoration: "none", color: "#2563eb" }}>Hints</Link>
              <Link to="/quiz" style={{ textDecoration: "none", color: "#2563eb" }}>Quiz</Link>
            </nav>
          )}
        </header>

        <main>
          <Routes>
            {mode === "quiz" ? (
              <>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/hints" element={<HintsPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="*" element={<UploadPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<StudyBuddyPage />} />
                <Route path="*" element={<StudyBuddyPage />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  )
}
