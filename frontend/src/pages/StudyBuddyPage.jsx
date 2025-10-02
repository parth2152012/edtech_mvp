import React, { useState, useEffect } from "react";

export default function StudyBuddy() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [formattedAnswer, setFormattedAnswer] = useState("");

  const buildFormattedText = (data) => {
    if (!data) return "";

    if (typeof data === "string") {
      return data;
    }

    if (data.text) {
      return data.text;
    }

    const sections = [];

    if (data.definition) {
      sections.push(`Definition:\n${data.definition}`);
    }

    if (data.simple_explanation) {
      sections.push(`Simple Explanation:\n${data.simple_explanation}`);
    }

    if (Array.isArray(data.examples) && data.examples.length > 0) {
      const examples = data.examples
        .map((example, index) => `${index + 1}. ${example}`)
        .join("\n");
      sections.push(`Examples:\n${examples}`);
    }

    if (data.formula) {
      sections.push(`Formula:\n${data.formula}`);
    }

    if (Array.isArray(data.key_takeaways) && data.key_takeaways.length > 0) {
      const takeaways = data.key_takeaways.map((point) => `- ${point}`).join("\n");
      sections.push(`Key Takeaways:\n${takeaways}`);
    }

    if (!sections.length) {
      return JSON.stringify(data, null, 2);
    }

    return sections.join("\n\n");
  };

  const renderAnswerSections = (text) => {
    return text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((block, index) => {
        const lines = block.split("\n");
        const [firstLine, ...rest] = lines;
        const hasTitle = firstLine.includes(":");
        const [title, ...titleContent] = hasTitle ? firstLine.split(":") : [firstLine];
        const bodyLines = hasTitle
          ? [titleContent.join(":").trim(), ...rest].filter((line) => line.trim())
          : lines.filter((line) => line.trim());

        const trimmedLines = bodyLines.map((line) => line.trim());
        const isBulletList =
          trimmedLines.length > 1 && trimmedLines.every((line) => line.startsWith("- "));
        const isNumberedList =
          trimmedLines.length > 1 && trimmedLines.every((line) => /^\d+\.\s/.test(line));

        const renderBody = () => {
          if (isBulletList) {
            return (
              <ul className="list-disc list-inside space-y-1">
                {trimmedLines.map((line, idx) => (
                  <li key={idx}>{line.replace(/^-\s*/, "").trim()}</li>
                ))}
              </ul>
            );
          }

          if (isNumberedList) {
            return (
              <ol className="list-decimal list-inside space-y-1">
                {trimmedLines.map((line, idx) => (
                  <li key={idx}>{line.replace(/^\d+\.\s*/, "").trim()}</li>
                ))}
              </ol>
            );
          }

          return trimmedLines.map((content, contentIndex) => (
            <p key={contentIndex}>{content}</p>
          ));
        };

        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            {hasTitle && (
              <h3 className="text-lg font-semibold text-blue-600 mb-2">{title.trim()}</h3>
            )}
            <div className="space-y-2 text-gray-700">{renderBody()}</div>
          </div>
        );
      });
  };

  // Load history from localStorage on first load
  useEffect(() => {
    const savedHistory = localStorage.getItem("studyBuddyHistory");
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      const normalized = parsed.map((item) => ({
        ...item,
        formattedText: item.formattedText || buildFormattedText(item.answer),
      }));
      setHistory(normalized);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("studyBuddyHistory", JSON.stringify(history));
  }, [history]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/studybuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      const textAnswer = buildFormattedText(data);

      setAnswer(data);
      setFormattedAnswer(textAnswer);

      const newEntry = { question, answer: data, formattedText: textAnswer };
      setHistory([newEntry, ...history]); // latest on top
      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Left: Current Question/Answer */}
      <div className="w-2/3 bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">📚 Study Buddy</h1>
        <textarea
          className="w-full p-3 border rounded-md"
          rows="3"
          placeholder="Ask me anything about math, science, etc..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={handleAsk}
          className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ask
        </button>

        {formattedAnswer && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">✨ Answer</h2>
            <div className="grid gap-4">
              {renderAnswerSections(formattedAnswer)}
            </div>
          </div>
        )}
      </div>

      {/* Right: History */}
      <div className="w-1/3 bg-gray-50 rounded-xl shadow-md p-4 overflow-y-auto h-[80vh]">
        <h2 className="text-lg font-bold mb-3">🕘 History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No past questions yet.</p>
        ) : (
          history.map((item, i) => (
            <div
              key={i}
              className="mb-4 p-3 bg-white rounded-lg border shadow-sm space-y-2"
            >
              <p className="font-semibold">Q: {item.question}</p>
              <div className="border-t border-gray-200 pt-2 text-sm text-gray-600 space-y-2">
                {renderAnswerSections(item.formattedText)}
              </div>
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => {
          setHistory([]);
          localStorage.removeItem("studyBuddyHistory");
        }}
        className="mt-3 ml-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Clear History
      </button>
    </div>
  );
}
