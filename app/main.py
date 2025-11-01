from __future__ import annotations

from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.pipeline import run_analysis
from backend.schemas import AnalysisResult
from backend.storage import (
    clear_output_dir,
    ensure_output_dir,
    save_analysis_result,
)
from .models import AnalysisRequest


app = FastAPI(title="PastPort API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    ensure_output_dir()
    clear_output_dir()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    clear_output_dir()


@app.get("/api/status")
async def status() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze(request: AnalysisRequest) -> AnalysisResult:
    payload = request.input_kwargs()
    if not payload["article_url"] and not payload["article_text"] and not payload["search_query"]:
        raise HTTPException(status_code=400, detail="Provide articleUrl, articleText, or searchQuery.")

    try:
        result = await run_analysis(**payload)
        output_path = save_analysis_result(result)
        result.meta.output_file = output_path
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return result


@app.post("/api/output/clear")
async def clear_output() -> dict[str, str]:
    clear_output_dir()
    return {"status": "cleared"}
