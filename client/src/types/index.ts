export interface DetectedEntity {
  entity_type: 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD' | 'IP_ADDRESS' | 'API_KEY' | 'NAME' | string;
  token: string;
  original_value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface ThreatVector {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matched_pattern: string;
  description: string;
  risk_score: number;
}

export interface TrustScoreBreakdown {
  trust_score: number;
  injection_penalty: number;
  pii_penalty: number;
  anomaly_penalty: number;
  explanation: string;
}

export interface ScanResponse {
  request_id: string;
  timestamp: string;
  decision: 'ALLOW' | 'SANITIZE_AND_FORWARD' | 'QUARANTINE_BLOCKED';
  original_prompt: string;
  sanitized_prompt: string;
  detected_entities: DetectedEntity[];
  threat_vectors: ThreatVector[];
  threat_score: number;
  trust_breakdown: TrustScoreBreakdown;
  latency_ms: number;
  token_map: Record<string, string>;
}

export interface DetokenizeResponse {
  restored_text: string;
  tokens_restored: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  client_ip_hash: string;
  decision: 'ALLOW' | 'SANITIZE_AND_FORWARD' | 'QUARANTINE_BLOCKED';
  threat_count: number;
  pii_count: number;
  trust_score: number;
  latency_ms: number;
  summary: string;
  threat_level: string;
  original_prompt_preview: string;
  sanitized_prompt_preview: string;
}

export interface StatsResponse {
  total_requests: number;
  blocked_attacks: number;
  sanitized_requests: number;
  allowed_requests: number;
  pii_entities_protected: number;
  avg_trust_score: number;
  avg_latency_ms: number;
}

export interface PredefinedAttack {
  id: string;
  title: string;
  category: string;
  badgeColor: string;
  prompt: string;
  description: string;
}
