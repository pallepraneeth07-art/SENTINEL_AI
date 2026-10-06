import time
import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from app.models.schemas import (
    ScanRequest,
    ScanResponse,
    DetokenizeRequest,
    DetokenizeResponse,
    AuditLogEntry
)
from app.core.pii_engine import pii_engine
from app.core.security import security_analyzer
from app.routers.audit import record_audit_log

router = APIRouter(tags=["Scan & Governance"])

@router.post("/scan", response_model=ScanResponse)
async def scan_payload(payload: ScanRequest, request: Request):
    """
    Main zero-trust gateway inspection endpoint.
    Performs real-time PII anonymization, threat & prompt injection detection,
    and returns sanitized payload with trust metrics.
    """
    start_time = time.perf_counter()
    req_id = f"sentinel-{uuid.uuid4().hex[:8]}"
    session_id = payload.session_id or req_id

    # 1. PII detection and reversible synthetic tokenization
    sanitized_text, detected_entities, token_map = pii_engine.scan_and_tokenize(
        payload.prompt,
        session_id=session_id
    )

    # 2. Threat & Adversarial injection analysis
    threat_vectors, threat_score = security_analyzer.analyze_threats(payload.prompt)

    # 3. Explainable Trust & Safety Index computation
    trust_breakdown, decision = security_analyzer.calculate_trust_score(
        prompt=payload.prompt,
        threat_vectors=threat_vectors,
        threat_score=threat_score,
        detected_entities=detected_entities
    )

    # If quarantined, the output payload sent downstream is blocked
    effective_sanitized_prompt = (
        "[QUARANTINE_BLOCKED - High risk prompt injection or security policy violation detected]"
        if decision == "QUARANTINE_BLOCKED"
        else sanitized_text
    )

    # Calculate latency
    latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
    timestamp_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Hash client IP for privacy-preserving audit telemetry
    client_ip = request.client.host if request.client else "127.0.0.1"
    ip_hash = hashlib.sha256(client_ip.encode("utf-8")).hexdigest()[:12]

    # Highest threat level
    threat_level = "NONE"
    if any(tv.severity == "CRITICAL" for tv in threat_vectors):
        threat_level = "CRITICAL"
    elif any(tv.severity == "HIGH" for tv in threat_vectors):
        threat_level = "HIGH"
    elif any(tv.severity == "MEDIUM" for tv in threat_vectors):
        threat_level = "MEDIUM"
    elif detected_entities:
        threat_level = "LOW"

    # Record telemetry event
    summary_text = (
        f"{decision}: {len(threat_vectors)} threats detected, {len(detected_entities)} PII items sanitized."
    )
    audit_entry = AuditLogEntry(
        id=req_id,
        timestamp=timestamp_iso,
        client_ip_hash=ip_hash,
        decision=decision,
        threat_count=len(threat_vectors),
        pii_count=len(detected_entities),
        trust_score=trust_breakdown.trust_score,
        latency_ms=latency_ms,
        summary=summary_text,
        threat_level=threat_level,
        original_prompt_preview=payload.prompt[:120] + ("..." if len(payload.prompt) > 120 else ""),
        sanitized_prompt_preview=effective_sanitized_prompt[:120] + ("..." if len(effective_sanitized_prompt) > 120 else "")
    )
    record_audit_log(audit_entry)

    return ScanResponse(
        request_id=req_id,
        timestamp=timestamp_iso,
        decision=decision,
        original_prompt=payload.prompt,
        sanitized_prompt=effective_sanitized_prompt,
        detected_entities=detected_entities,
        threat_vectors=threat_vectors,
        threat_score=threat_score,
        trust_breakdown=trust_breakdown,
        latency_ms=latency_ms,
        token_map=token_map
    )


@router.post("/detokenize", response_model=DetokenizeResponse)
async def detokenize_payload(payload: DetokenizeRequest):
    """
    Reverses synthetic tokens back into the original values for safe client presentation
    after LLM response generation.
    """
    if not payload.token_map:
        return DetokenizeResponse(restored_text=payload.text, tokens_restored=0)

    restored_text, count = pii_engine.detokenize(payload.text, payload.token_map)
    return DetokenizeResponse(
        restored_text=restored_text,
        tokens_restored=count
    )
