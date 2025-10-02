import React, { useState } from "react"

export default function HintsPage() {
  const [hints, setHints] = useState([])

  async function fetchHints() {
    const res = await fetch("http://127.0.0.1:8000/hints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Solve 2x + 3 = 7" })
    })
    const data = await res.json()
    setHints(data.hints)
  }

  return (
    <div>
      <h2>💡 Problem Hints</h2>
      <button
        onClick={fetchHints}
        style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}
      >
        Get Hints
      </button>

      {hints.length > 0 && (
        <ul style={{ marginTop: "1rem" }}>
          {hints.map((hint, i) => (
            <li key={i} style={{ marginBottom: "0.5rem" }}>👉 {hint}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
