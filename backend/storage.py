from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from .schemas import AnalysisResult

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def clear_output_dir() -> None:
    if not OUTPUT_DIR.exists():
        return
    for item in OUTPUT_DIR.iterdir():
        if item.is_file():
            try:
                item.unlink()
            except OSError:
                continue


def save_analysis_result(result: AnalysisResult) -> str:
    ensure_output_dir()
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%S")
    filename = f"analysis_{timestamp}_{uuid4().hex}.json"
    file_path = OUTPUT_DIR / filename
    with file_path.open("w", encoding="utf-8") as fh:
        json.dump(result.model_dump(mode="json"), fh, ensure_ascii=False, indent=2)
    try:
        return str(file_path.relative_to(OUTPUT_DIR.parent))
    except ValueError:
        return str(file_path)
