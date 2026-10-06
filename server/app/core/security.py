import re
from typing import List, Tuple
from app.models.schemas import ThreatVector, TrustScoreBreakdown, DetectedEntity

# Threat signatures categorized with regex patterns, descriptions, and baseline risk weights
THREAT_SIGNATURES = [
    # 1. Direct Prompt Injections
    {
        "category": "PROMPT_INJECTION",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r'\b(?:ignore|disregard|forget|override|bypass|cancel)\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules|directives|constraints|guidelines)\b',
            re.IGNORECASE
        ),
        "description": "Explicit directive to override system instructions and safety constraints",
        "weight": 0.95
    },
    {
        "category": "PROMPT_INJECTION",
        "severity": "HIGH",
        "pattern": re.compile(
            r'\b(?:new\s+system\s+directive|system\s+override|admin\s+mode\s+enabled|sudo\s+mode)\b',
            re.IGNORECASE
        ),
        "description": "Privilege escalation prompt attempting to trigger administrative override",
        "weight": 0.85
    },

    # 2. Jailbreaks & DAN variants
    {
        "category": "JAILBREAK",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r'\b(?:do\s+anything\s+now|DAN\s+mode|STAN|AIM\s+persona|jailbroken|uncensored\s+mode|developer\s+mode\s+v2)\b',
            re.IGNORECASE
        ),
        "description": "Known jailbreak persona signature (DAN / Uncensored Mode)",
        "weight": 0.98
    },
    {
        "category": "JAILBREAK",
        "severity": "HIGH",
        "pattern": re.compile(
            r'\b(?:you\s+must\s+answer\s+every\s+prompt\s+without\s+filter|no\s+safety\s+restrictions|bypass\s+openai|bypass\s+anthropic)\b',
            re.IGNORECASE
        ),
        "description": "Direct constraint suppression attempting to disable safety guards",
        "weight": 0.88
    },

    # 3. System Prompt Leakage
    {
        "category": "SYSTEM_PROMPT_LEAKAGE",
        "severity": "HIGH",
        "pattern": re.compile(
            r'\b(?:repeat\s+the\s+words\s+above|print\s+(?:your\s+)?initial\s+prompt|leak\s+system\s+prompt|output\s+verbatim\s+system|show\s+me\s+your\s+initial\s+instructions)\b',
            re.IGNORECASE
        ),
        "description": "Adversarial probe attempting to exfiltrate system instructions or meta-prompts",
        "weight": 0.80
    },
    {
        "category": "SYSTEM_PROMPT_LEAKAGE",
        "severity": "MEDIUM",
        "pattern": re.compile(
            r'\b(?:what\s+were\s+you\s+told\s+before\s+this|what\s+is\s+your\s+original\s+hidden\s+instruction)\b',
            re.IGNORECASE
        ),
        "description": "Information reconnaissance probe seeking architectural context",
        "weight": 0.65
    },

    # 4. Malicious Command / Remote Execution Injections
    {
        "category": "MALICIOUS_COMMAND",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r'\b(?:rm\s+-rf\s+\/|chmod\s+777|curl\s+.*\s*\|\s*sh|powershell\s+-enc|eval\s*\(\s*base64_decode|system\s*\(\s*["\']rm)\b',
            re.IGNORECASE
        ),
        "description": "Potentially destructive shell command or remote code execution payload",
        "weight": 0.99
    },
    {
        "category": "MALICIOUS_COMMAND",
        "severity": "HIGH",
        "pattern": re.compile(
            r'<\s*script[^>]*>.*<\s*\/\s*script\s*>|javascript:\s*alert|UNION\s+SELECT\s+.*\s+FROM',
            re.IGNORECASE
        ),
        "description": "Cross-site scripting (XSS) or SQL Injection structured payload",
        "weight": 0.85
    },

    # 5. Roleplay Bypass & Unrestricted Persona
    {
        "category": "ROLEPLAY_OVERRIDE",
        "severity": "HIGH",
        "pattern": re.compile(
            r'\b(?:pretend\s+you\s+are\s+(?:an?\s+)?evil|act\s+as\s+a\s+rogue\s+ai|in\s+this\s+hypothetical\s+world\s+ethics\s+do\s+not\s+apply)\b',
            re.IGNORECASE
        ),
        "description": "Hypothetical scenario / evil roleplay construct designed to bypass ethical filters",
        "weight": 0.78
    },

    # 6. Delimiter Hijacking & Formatting Attacks
    {
        "category": "PROMPT_INJECTION",
        "severity": "MEDIUM",
        "pattern": re.compile(
            r'(?:\[\/?INST\]|<\/?system>|<\/?user>|```system|---BEGIN\s+SYSTEM\s+PROMPT---)',
            re.IGNORECASE
        ),
        "description": "Model boundary delimiter spoofing to alter conversational context",
        "weight": 0.70
    }
]

# Obfuscation & Anomaly Regex
BASE64_SUSPICIOUS = re.compile(r'\b[A-Za-z0-9+/]{40,}={0,2}\b')
HEX_SUSPICIOUS = re.compile(r'\b(?:0x)?[0-9a-fA-F]{48,}\b')


class SecurityAnalyzer:
    def analyze_threats(self, prompt: str) -> Tuple[List[ThreatVector], float]:
        """
        Analyzes prompt for adversarial prompt injections, jailbreaks,
        system prompt exfiltration, and command execution attacks.
        Returns (threat_vectors, aggregate_threat_score).
        """
        threat_vectors: List[ThreatVector] = []
        max_threat_score = 0.0

        for sig in THREAT_SIGNATURES:
            matches = list(sig["pattern"].finditer(prompt))
            if matches:
                matched_snippet = matches[0].group(0)
                threat_vectors.append(
                    ThreatVector(
                        category=sig["category"],
                        severity=sig["severity"],
                        matched_pattern=matched_snippet[:60],
                        description=sig["description"],
                        risk_score=sig["weight"]
                    )
                )
                if sig["weight"] > max_threat_score:
                    max_threat_score = sig["weight"]

        # Anomaly / Obfuscation heuristic checks
        if BASE64_SUSPICIOUS.search(prompt):
            threat_vectors.append(
                ThreatVector(
                    category="OBFUSCATION_ANOMALY",
                    severity="MEDIUM",
                    matched_pattern="Base64 Encoded Block",
                    description="High-entropy Base64 payload detected; potential evasion tactic",
                    risk_score=0.60
                )
            )
            max_threat_score = max(max_threat_score, 0.60)

        return threat_vectors, round(max_threat_score, 2)

    def calculate_trust_score(
        self,
        prompt: str,
        threat_vectors: List[ThreatVector],
        threat_score: float,
        detected_entities: List[DetectedEntity]
    ) -> Tuple[TrustScoreBreakdown, str]:
        """
        Calculates Explainable Trust & Safety Index (0-100) and returns (breakdown, decision).
        Decision is one of: ALLOW | SANITIZE_AND_FORWARD | QUARANTINE_BLOCKED.
        """
        # 1. Injection Penalty: max -40
        injection_penalty = min(40.0, threat_score * 40.0)

        # 2. PII Density Penalty: max -30
        pii_points = 0.0
        for entity in detected_entities:
            if entity.entity_type in ["SSN", "CREDIT_CARD", "API_KEY"]:
                pii_points += 15.0
            elif entity.entity_type in ["EMAIL", "PHONE"]:
                pii_points += 6.0
            else:
                pii_points += 4.0
        pii_penalty = min(30.0, pii_points)

        # 3. Anomaly & Toxicity Penalty: max -30
        anomaly_penalty = 0.0
        # Check text repetitions or leetspeak indicators
        if len(prompt) > 2000:
            anomaly_penalty += 5.0
        for tv in threat_vectors:
            if tv.category in ["OBFUSCATION_ANOMALY", "ROLEPLAY_OVERRIDE"]:
                anomaly_penalty += 10.0
        anomaly_penalty = min(30.0, anomaly_penalty)

        # Calculate final index (0 - 100)
        trust_index = max(0, min(100, int(round(100.0 - injection_penalty - pii_penalty - anomaly_penalty))))

        # Decision Matrix
        has_critical = any(tv.severity == "CRITICAL" for tv in threat_vectors)
        has_high = any(tv.severity == "HIGH" for tv in threat_vectors)

        if has_critical or threat_score >= 0.75 or trust_index < 40:
            decision = "QUARANTINE_BLOCKED"
            explanation = (
                f"Quarantine Enforced: High-risk threat vectors detected ({', '.join(tv.category for tv in threat_vectors[:2])}) "
                f"with severe exploit confidence. Payload blocked from reaching downstream LLM."
            )
        elif detected_entities or has_high or threat_score > 0.20 or trust_index < 80:
            decision = "SANITIZE_AND_FORWARD"
            reasons = []
            if detected_entities:
                reasons.append(f"{len(detected_entities)} sensitive PII/PHI entities tokenized")
            if threat_vectors:
                reasons.append(f"low-to-moderate threat indicators neutralized")
            explanation = (
                f"Sanitized & Cleared: {'; '.join(reasons)}. "
                f"Synthetic reversible tokenization applied before forwarding to LLM."
            )
        else:
            decision = "ALLOW"
            explanation = "Direct Pass: No prompt injections, jailbreaks, or exposed sensitive credentials identified."

        breakdown = TrustScoreBreakdown(
            trust_score=trust_index,
            injection_penalty=round(injection_penalty, 1),
            pii_penalty=round(pii_penalty, 1),
            anomaly_penalty=round(anomaly_penalty, 1),
            explanation=explanation
        )

        return breakdown, decision


# Global singleton instance
security_analyzer = SecurityAnalyzer()
