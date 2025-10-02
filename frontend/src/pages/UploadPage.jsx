import React, { useState } from "react"

export default function UploadPage() {
  const [problem, setProblem] = useState("")
  const [result, setResult] = useState(null)

  async function submitProblem(e) {
    e.preventDefault()
    const res = await fetch("http://127.0.0.1:8000/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: problem })
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div>
      <h2>📝 Upload a Problem</h2>
      <form onSubmit={submitProblem} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Enter a math/science problem..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          style={{ width: "70%", padding: "0.6rem", marginRight: "0.5rem", borderRadius: "6px", border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          style={{ padding: "0.6rem 1.2rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}
        >
          Submit
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f3f4f6", borderRadius: "6px" }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
