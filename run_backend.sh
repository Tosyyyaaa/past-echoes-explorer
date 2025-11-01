#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env" ]]; then
  echo "[pastport] Loading environment from .env"
  # shellcheck disable=SC1091
  source .env
fi

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "[pastport] WARNING: OPENAI_API_KEY is not set."
fi

if [[ -z "${PERPLEXITY_API_KEY:-}" ]]; then
  echo "[pastport] WARNING: PERPLEXITY_API_KEY is not set."
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
