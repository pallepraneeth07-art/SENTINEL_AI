from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class DetectedEntity(BaseModel):
    entity_type: str = Field(..., description="Type of entity: EMAIL, PHONE, SSN, CREDIT_CARD, IP_ADDRESS, API_KEY, NAME")
    token: str = Field(..., description="Synthetic token replacement, e.g., [EMAIL_1]")
    original_value: str = Field(..., description="Redacted raw original text string")
    start: int = Field(..., description="Character start offset in original prompt")
    end: int = Field(..., description="Character end offset in original prompt")
    confidence: float = Field(default=0.95, description="Confidence score from 0.0 to 1.0")

class ThreatVector(BaseModel):
    category: str = Field(..., description="Threat classification category")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    matched_pattern: str = Field(..., description="Trigger pattern or regex captured")
    description: str = Field(..., description="Plain explanation of the threat mechanics")
    risk_score: float = Field(..., description="Normalized risk contribution (0.0 to 1.0)")

class TrustScoreBreakdown(BaseModel):
    trust_score: int = Field(..., description="Explainable composite score (0 - 100)")
    injection_penalty: float = Field(..., description="Deduction from adversarial injections (max -40)")
    pii_penalty: float = Field(..., description="Deduction from PII exposure density (max -30)")
    anomaly_penalty: float = Field(..., description="Deduction from evasion/toxicity/anomalies (max -30)")
    explanation: str = Field(..., description="Human-readable decision explanation")

class ScanRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Raw incoming user prompt to inspect")
    session_id: Optional[str] = Field(default=None, description="Client or caller session ID")
    user_id: Optional[str] = Field(default=None, description="Client or tenant user identifier")
    allow_redacted_forward: Optional[bool] = Field(default=True, description="Whether to permit SANITIZE_AND_FORWARD")

class ScanResponse(BaseModel):
    request_id: str
    timestamp: str
    decision: str = Field(..., description="ALLOW | SANITIZE_AND_FORWARD | QUARANTINE_BLOCKED")
    original_prompt: str
    sanitized_prompt: str
    detected_entities: List[DetectedEntity]
    threat_vectors: List[ThreatVector]
    threat_score: float
    trust_breakdown: TrustScoreBreakdown
    latency_ms: float
    token_map: Dict[str, str]

class DetokenizeRequest(BaseModel):
    text: str = Field(..., description="Model response containing synthetic tokens like [EMAIL_1]")
    token_map: Dict[str, str] = Field(..., description="Session token mapping to restore")

class DetokenizeResponse(BaseModel):
    restored_text: str
    tokens_restored: int

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    client_ip_hash: str
    decision: str
    threat_count: int
    pii_count: int
    trust_score: int
    latency_ms: float
    summary: str
    threat_level: str
    original_prompt_preview: str
    sanitized_prompt_preview: str

class StatsResponse(BaseModel):
    total_requests: int
    blocked_attacks: int
    sanitized_requests: int
    allowed_requests: int
    pii_entities_protected: int
    avg_trust_score: float
    avg_latency_ms: float

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
