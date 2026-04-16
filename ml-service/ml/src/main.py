"""
Immigration Case OS — ML / RAG service.

Sprint 1 ships only the /health endpoint. Sprints 3-4 add OCR, classification,
embeddings, and assessment scoring (per docs/sequence-diagrams.md §5-§7).

Every request from this service that touches Postgres MUST set the
`app.current_tenant` GUC before any query — same pattern as the NestJS
TenantInterceptor. See docs/architecture.md §4.3.
"""

from __future__ import annotations

import os
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="ico-ml",
    version="0.0.1",
    description="Immigration Case OS — ML / RAG service",
)


class HealthResponse(BaseModel):
    ok: bool
    service: str
    version: str
    sprint: int


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        ok=True,
        service="ico-ml",
        version="0.0.1",
        sprint=1,
    )


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "ico-ml",
        "status": "Sprint 1 stub. OCR / RAG / scoring endpoints land in Sprint 3+",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("ML_PORT", "5000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
