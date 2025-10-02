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
    # Use .get() defensively as the model might occasionally skip fields
    definition = answer.get("definition") or ""
    simple_explanation = answer.get("simple_explanation") or ""
    examples = answer.get("examples") or []
    formula = answer.get("formula") or ""
    key_takeaways = answer.get("key_takeaways") or []

    sections: list[str] = []

    # clean helpers
    def normalize_text(value: str) -> str:
        # Replaces 3 or more newlines with 2 for consistent spacing
        return re.sub(r"\n{3,}", "\n\n", value.strip()) if isinstance(value, str) else str(value).strip()

    # FIX: Adding explicit newline after the bold title for cleaner separation
    if definition:
        sections.append(f"**Definition:**\n{normalize_text(definition)}")

    if simple_explanation:
        sections.append(f"**Simple Explanation:**\n{normalize_text(simple_explanation)}")

    if formula:
        # Added $ signs around the formula for visual clarity
        sections.append(f"**Formula:**\n${normalize_text(formula)}$")

    if examples:
        # Uses bullet points
        formatted_examples_lines = [f"• {normalize_text(example)}" for example in examples if isinstance(example, str)]
        sections.append("**Examples:**\n" + "\n".join(formatted_examples_lines))

    if key_takeaways:
        # Uses bullet points
        formatted_takeaways = [f"• {normalize_text(point)}" for point in key_takeaways if isinstance(point, str)]
        sections.append("**Key Takeaways:**\n" + "\n".join(formatted_takeaways))

    # Fallback to a readable error message if the structure is empty
    if not sections:
        return f"Error: Could not generate a complete answer. Raw JSON: {json.dumps(answer, indent=2, ensure_ascii=False)}"

    # Join all sections with two newlines for clean separation
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
    
    # --------------------------------------------------------------------------
    # KEY CHANGE: Using a strict prompt to request ONLY raw JSON output (no markdown)
    # This is the "something else" (pure prompt engineering) with better instructions.
    # --------------------------------------------------------------------------
    prompt = f"""
    You are a study buddy. Your task is to respond to the user's question by outputting a single, valid JSON object ONLY.
    DO NOT include any explanation, commentary, or markdown code blocks (like ```json) outside the JSON object.
    ALSO dont use $ signs or LaTeX formatting, just plain text in the JSON fields.
    ALWAYS output a valid JSON object that matches the specified schema below.

    The JSON must follow this exact schema structure:
    {{
        "definition": "[A formal definition of the topic]",
        "simple_explanation": "[A simple, easily understandable explanation of the topic]",
        "examples": ["[A brief, descriptive example 1]", "[A brief, descriptive example 2]", "[A brief, descriptive example 3]"],
        "formula": "[The relevant formula, if applicable]",
        "key_takeaways": ["[Key bullet point 1]", "[Key bullet point 2]", "[Key bullet point 3]"]
    }}

    Question: {item.question}
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        
        # Strip any remaining markdown code fences if the model still adds them
        if raw_text.startswith("```json") and raw_text.endswith("```"):
            raw_text = raw_text.lstrip("```json").rstrip("```").strip()
        elif raw_text.startswith("```") and raw_text.endswith("```"):
            raw_text = raw_text.lstrip("```").rstrip("```").strip()


        # Try to parse the clean text as JSON
        try:
            answer = json.loads(raw_text)
        except json.JSONDecodeError:
            # Fallback: if parsing fails, wrap the raw text as a definition
            answer = {
                "definition": raw_text,
                "simple_explanation": "Sorry, I couldn't process the full structure, here is the raw response.",
                "examples": [],
                "formula": "",
                "key_takeaways": []
            }

        formatted_answer = format_studybuddy_response(answer)

        return {"text": formatted_answer}

    except Exception as e:
        # Log the error for debugging
        print(f"An error occurred: {e}")
        return {"error": "Failed to process the request due to an internal error."}


@app.post("/clear_history")
def clear_history():
    """
    Frontend can call this if we later sync server-side history.
    For now, just returns confirmation.
    """
    return {"message": "History cleared (frontend should reset localStorage)."}
