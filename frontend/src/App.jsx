import React, { useState } from 'react'

export default function App() {
  const [response, setResponse] = useState(null)

  async function callBackend() {
    const res = await fetch("http://127.0.0.1:8000/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "2x + 3 = 7" })
    })
    const data = await res.json()
    setResponse(data)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <h1>🚀 EdTech MVP</h1>
      <button onClick={callBackend}>Test Backend</button>
      {response && (
        <pre>{JSON.stringify(response, null, 2)}</pre>
      )}
    </div>
  )
}
 