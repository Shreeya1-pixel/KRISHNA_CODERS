"""
Second ERP target: SAP-shaped webhook adapter.

Not a real SAP install — a live-tested stub that accepts OData/webhook-shaped
JSON and forwards text fields into POST /v1/scan (source_system=sap_webhook_stub).
Proves the "any ERP that can HTTP POST" claim beyond Demo ERP.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .universal import ScanContext, _run_scan

router = APIRouter(prefix="/v1/adapters", tags=["ERP adapters"])


class SapWebhookPayload(BaseModel):
    """Minimal SAP Gateway / Event Mesh style body."""

    eventType: str = "BusinessPartner.Changed"
    sapSystemId: str = "S4HANA-DEMO"
    userId: str = "SAP_SERVICE"
    businessObject: str = "BusinessPartner"
    # Free-text fields a real inject would scan before persistence
    note: Optional[str] = None
    description: Optional[str] = None
    longText: Optional[str] = None
    comments: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)


def _extract_text(body: SapWebhookPayload) -> str:
    chunks: List[str] = []
    for key in (body.note, body.description, body.longText, body.comments):
        if key and str(key).strip():
            chunks.append(str(key).strip())
    for k in ("NOTE", "DESCRIPTION", "LONG_TEXT", "REMARK", "TEXT"):
        v = body.payload.get(k)
        if v and str(v).strip():
            chunks.append(str(v).strip())
    if not chunks:
        # Fall back to stringified event metadata so empty hooks still exercise the path
        chunks.append(f"{body.eventType} {body.businessObject}")
    return "\n".join(chunks)


@router.post("/sap/webhook")
async def sap_webhook_stub(body: SapWebhookPayload):
    """
    Live-tested second ERP target (stub).

    Shape mimics SAP Event Mesh / Gateway webhook → SyRA scan before "save".
    """
    text = _extract_text(body)
    ctx = ScanContext(
        user_id=body.userId or "SAP_SERVICE",
        source_system="sap_webhook_stub",
        field_name="sap_long_text",
        agent_id=f"sap-adapter:{body.sapSystemId}",
        role="service",
    )
    result = await _run_scan(text, ctx)
    decision = (result.get("decision") or "ALLOW").upper()
    persist = decision == "ALLOW"
    return {
        "adapter": "sap_webhook_stub",
        "sapSystemId": body.sapSystemId,
        "eventType": body.eventType,
        "extracted_text": text,
        "syra": result,
        "erp_action": "PERSIST" if persist else "REJECT",
        "note": (
            "Stub only — proves a second HTTP ERP shape against /v1/scan. "
            "Not a certified SAP connector."
        ),
    }
