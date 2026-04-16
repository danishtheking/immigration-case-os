# services/ml — Immigration Case OS ML service

FastAPI service for OCR, document classification, embeddings, RAG retrieval,
and assessment generation.

## Sprint 1 status

Only `/health` is implemented. Sprints 3-4 add the real pipelines.

## Local dev

```bash
cd services/ml
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -e .[dev]
python src/main.py
```

The service listens on `http://localhost:5000`.
