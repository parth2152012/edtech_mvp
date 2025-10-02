from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (React) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for hackathon demo; later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello from EdTech Backend"}

@app.post("/parse")
def parse_problem(problem: dict):
    # placeholder parser
    return {"parsed": f"Problem received: {problem['text']}"}
