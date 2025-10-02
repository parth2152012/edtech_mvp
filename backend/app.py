import os
import re
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# -------------------------------
# Config
# -------------------------------
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Choose a supported Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# Allow frontend (React) to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for hackathon/demo, later restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Data Models
# -------------------------------
class QuestionRequest(BaseModel):
    question: str


# -------------------------------
# Helper Functions
# -------------------------------
def format_studybuddy_response(answer: dict) -> str:
    """Convert structured response into user-friendly text blocks."""
    definition = answer.get("definition") or ""
    simple_explanation = answer.get("simple_explanation") or ""
    examples = answer.get("examples") or []
    formula = answer.get("formula") or ""
    key_takeaways = answer.get("key_takeaways") or []

    sections: list[str] = []

    # clean helpers
    def normalize_text(value: str) -> str:
        return re.sub(r"\n{3,}", "\n\n", value.strip()) if isinstance(value, str) else str(value).strip()

    if definition:
        sections.append(f"Definition:\n{normalize_text(definition)}")

    if simple_explanation:
        sections.append(f"Simple Explanation:\n{normalize_text(simple_explanation)}")

    if examples:
        formatted_examples_lines = []
        for idx, example in enumerate(examples):
            if isinstance(example, dict):
                title = normalize_text(example.get("title") or "")
                description = normalize_text(example.get("description") or "")
                details_parts = [part for part in [title, description] if part]
                details = ": ".join(details_parts) if details_parts else json.dumps(example, ensure_ascii=False)
                formatted_examples_lines.append(f"{idx + 1}. {details}")
            else:
                formatted_examples_lines.append(f"{idx + 1}. {normalize_text(example)}")

        sections.append("Examples:\n" + "\n".join(formatted_examples_lines))

    if formula:
        sections.append(f"Formula:\n{normalize_text(formula)}")

    if key_takeaways:
        formatted_takeaways = []
        for point in key_takeaways:
            if isinstance(point, dict):
                title = normalize_text(point.get("title") or "")
                description = normalize_text(point.get("description") or "")
                details_parts = [part for part in [title, description] if part]
                details = ": ".join(details_parts) if details_parts else json.dumps(point, ensure_ascii=False)
                formatted_takeaways.append(f"- {details}")
            else:
                formatted_takeaways.append(f"- {normalize_text(point)}")

        sections.append("Key Takeaways:\n" + "\n".join(formatted_takeaways))

    # Fallback to raw JSON string if nothing is present
    if not sections:
        return json.dumps(answer, indent=2, ensure_ascii=False)

    return "\n\n".join(sections)


# -------------------------------
# Routes
# -------------------------------
@app.get("/")
def root():
    return {"message": "EdTech MVP Backend Running 🚀"}


@app.post("/studybuddy")
def study_buddy(item: QuestionRequest):
    """
    StudyBuddy endpoint:
    Takes a question and returns structured explanation.
    """

    prompt = f"""
    You are a study buddy. Answer this question in structured JSON format with fields:
    - definition
    - simple_explanation
    - examples (list of 2 examples)
    - formula
    - key_takeaways (list of 3 to 5 bullet points)

    Question: {item.question}
    """

    try:
        response = model.generate_content(prompt)

        # Try to parse as JSON
        try:
            answer = json.loads(response.text)
        except json.JSONDecodeError:
            # Fallback: wrap raw text
            answer = {
                "definition": response.text,
                "simple_explanation": "",
                "examples": [],
                "formula": "",
                "key_takeaways": []
            }

        formatted_answer = format_studybuddy_response(answer)

        return {"text": formatted_answer}

    except Exception as e:
        return {"error": str(e)}


@app.post("/clear_history")
def clear_history():
    """
    Frontend can call this if we later sync server-side history.
    For now, just returns confirmation.
    """
    return {"message": "History cleared (frontend should reset localStorage)."}
