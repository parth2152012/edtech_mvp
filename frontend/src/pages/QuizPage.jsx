import React, { useState } from "react"

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)

  async function loadQuiz() {
    const res = await fetch("http://127.0.0.1:8000/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Solve 2+2" })
    })
    const data = await res.json()
    setQuiz(data)
    setSelected(null)
    setFeedback(null)
  }

  function checkAnswer(option) {
    setSelected(option)
    if (option === quiz.correct) {
      setFeedback("✅ Correct!")
    } else {
      setFeedback("❌ Try again!")
    }
  }

  return (
    <div>
      <h2>📚 Quiz</h2>
      <button
        onClick={loadQuiz}
        style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}
      >
        Load Quiz
      </button>

      {quiz && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: "6px" }}>
          <p><b>Q:</b> {quiz.question}</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {quiz.options.map((opt, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>
                <button
                  onClick={() => checkAnswer(opt)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    background: selected === opt ? "#e0f2fe" : "white",
                    cursor: "pointer"
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          {feedback && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{feedback}</p>}
        </div>
      )}
    </div>
  )
}
