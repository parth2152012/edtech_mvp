import React, { useState, useEffect } from "react";

const AnswerSection = ({ text }) => {
  if (!text) return null;
  return (
    <div className="grid gap-4">
      {text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((block, index) => {
        const lines = block.split("\n");
        const [firstLine, ...rest] = lines;
        const isTitleBold = firstLine.startsWith("**") && firstLine.endsWith("**");
        const title = isTitleBold ? firstLine.slice(2, -2) : firstLine;
        const bodyLines = isTitleBold ? rest : lines;

        const trimmedLines = bodyLines.map((line) => line.trim());
        const isBulletList = trimmedLines.length > 0 && trimmedLines.every((line) => line.startsWith("• "));

        const renderBody = () => {
          if (isBulletList) {
            return (
              <ul className="list-disc list-inside space-y-1 pl-2">
                {trimmedLines.map((line, idx) => (
                  <li key={idx}>{line.replace(/^•\s*/, "").trim()}</li>
                ))}
              </ul>
            );
          }

          return trimmedLines.map((content, contentIndex) => (
            <p key={contentIndex} dangerouslySetInnerHTML={{ __html: content.replace(/\$(.*?)\$/g, '<i class="font-mono not-italic text-emerald-300">$1</i>') }} />
          ));
        };

        return (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm">
            {isTitleBold && (
              <h3 className="text-lg font-semibold text-blue-400 mb-2">{title}</h3>
            )}
            <div className="space-y-2 text-gray-300">{renderBody()}</div>
          </div>
        );
      })}
    </div>
  );
};

const HistoryItem = ({ item }) => {
  return (
    <details className="mb-4 bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
      <summary className="p-3 font-semibold cursor-pointer hover:bg-gray-700">
        Q: {item.question}
      </summary>
      <div className="border-t border-gray-700 p-3 text-sm text-gray-400 space-y-2">
        <AnswerSection text={item.answer.text} />
      </div>
    </details>
  );
};

export default function StudyBuddy() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load history from localStorage on first load
  useEffect(() => {
    const savedHistory = localStorage.getItem("studyBuddyHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("studyBuddyHistory", JSON.stringify(history));
  }, [history]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/studybuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (res.ok) {
      setAnswer(data);

      const newEntry = { question, answer: data };
      setHistory([newEntry, ...history]); // latest on top
      setQuestion("");
      } else {
        setAnswer({ text: `**Error:**\n${data.error || 'An unknown error occurred.'}` });
      }
    } catch (error) {
      console.error("Error:", error);
      setAnswer({ text: `**Error:**\nCould not connect to the server. Please try again later.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 p-4">
      {/* Left: Current Question/Answer */}
      <div className="w-2/3 bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-gray-100">🎓 Study Buddy</h1>
        <textarea
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="3"
          placeholder="Ask me anything about math, science, etc..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading}
          className="mt-3 w-28 h-10 flex items-center justify-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Ask"
          )}
        </button>

        {answer && (
          <div className="mt-6 space-y-3">
            <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-700 pb-2">✨ Answer</h2>
            <AnswerSection text={answer.text} />
          </div>
        )}
      </div>

      {/* Right: History */}
      <div className="w-1/3 bg-gray-900 rounded-xl shadow-2xl p-4 border border-gray-700 flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-100">🕘 History</h2>
          <button
            onClick={() => {
              setHistory([]);
              localStorage.removeItem("studyBuddyHistory");
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center mt-4">No past questions yet.</p>
          ) : (
            history.map((item, i) => <HistoryItem key={i} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
