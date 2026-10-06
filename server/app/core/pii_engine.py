import re
from typing import List, Tuple, Dict
from app.models.schemas import DetectedEntity

# Compile high-performance regex patterns
EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
    re.IGNORECASE
)

PHONE_PATTERN = re.compile(
    r'(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b'
)

SSN_PATTERN = re.compile(
    r'\b\d{3}[- ]\d{2}[- ]\d{4}\b'
)

CREDIT_CARD_PATTERN = re.compile(
    r'\b(?:4[0-9]{3}(?:[- ]?[0-9]{4}){3}|5[1-5][0-9]{2}(?:[- ]?[0-9]{4}){3}|3[47][0-9]{2}(?:[- ]?[0-9]{6}(?:[- ]?[0-9]{5})?)|6(?:011|5[0-9]{2})(?:[- ]?[0-9]{4}){3})\b'
)

IPV4_PATTERN = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
)

API_KEY_PATTERNS = [
    (re.compile(r'\b(sk-[a-zA-Z0-9_-]{20,48})\b'), "OpenAI API Key"),
    (re.compile(r'\b(AKIA[0-9A-Z]{16})\b'), "AWS Access Key ID"),
    (re.compile(r'\b(gh[pousr]_[A-Za-z0-9_]{36,40})\b'), "GitHub Personal Access Token"),
    (re.compile(r'(?:api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*["\']?([A-Za-z0-9_\-\.]{16,})["\']?', re.IGNORECASE), "Secret API Token"),
    (re.compile(r'Bearer\s+([A-Za-z0-9_\-\.]{24,})', re.IGNORECASE), "Bearer Token")
]

NAME_PREFIX_PATTERN = re.compile(
    r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
)

NAME_CONTEXT_PATTERN = re.compile(
    r'\b(?:patient|client|user|employee|customer|patient named|subject)\s+(?:named|is|called|:\s*)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    re.IGNORECASE
)


class PIIEngine:
    def __init__(self):
        # In-memory session key store for active tokens
        self._session_token_vault: Dict[str, Dict[str, str]] = {}

    def scan_and_tokenize(self, text: str, session_id: str = "default") -> Tuple[str, List[DetectedEntity], Dict[str, str]]:
        """
        Scans raw text for PII/PHI entities, applies synthetic reversible tokenization,
        and returns (sanitized_text, detected_entities_list, token_map).
        """
        raw_matches: List[Tuple[int, int, str, str, float]] = [] # (start, end, type, value, confidence)

        # 1. Email detection
        for match in EMAIL_PATTERN.finditer(text):
            raw_matches.append((match.start(), match.end(), "EMAIL", match.group(0), 0.99))

        # 2. SSN detection
        for match in SSN_PATTERN.finditer(text):
            raw_matches.append((match.start(), match.end(), "SSN", match.group(0), 0.98))

        # 3. Credit Card detection
        for match in CREDIT_CARD_PATTERN.finditer(text):
            raw_matches.append((match.start(), match.end(), "CREDIT_CARD", match.group(0), 0.96))

        # 4. API Keys detection
        for pattern, _ in API_KEY_PATTERNS:
            for match in pattern.finditer(text):
                # match group 1 if captured, else group 0
                val = match.group(1) if match.lastindex and match.lastindex >= 1 else match.group(0)
                start = match.start(1) if match.lastindex and match.lastindex >= 1 else match.start()
                end = match.end(1) if match.lastindex and match.lastindex >= 1 else match.end()
                raw_matches.append((start, end, "API_KEY", val, 0.99))

        # 5. IPv4 detection
        for match in IPV4_PATTERN.finditer(text):
            # Avoid matching version numbers or local loopback in harmless contexts if not desired
            raw_matches.append((match.start(), match.end(), "IP_ADDRESS", match.group(0), 0.92))

        # 6. Phone number detection (filtered for reasonable length)
        for match in PHONE_PATTERN.finditer(text):
            val = match.group(0)
            digits_count = sum(c.isdigit() for c in val)
            if 10 <= digits_count <= 15:
                raw_matches.append((match.start(), match.end(), "PHONE", val, 0.95))

        # 7. Name heuristics with title prefix
        for match in NAME_PREFIX_PATTERN.finditer(text):
            val = match.group(0)
            raw_matches.append((match.start(), match.end(), "NAME", val, 0.90))

        # 8. Name heuristics with medical/client context
        for match in NAME_CONTEXT_PATTERN.finditer(text):
            val = match.group(1)
            raw_matches.append((match.start(1), match.end(1), "NAME", val, 0.88))

        # Deduplicate and sort non-overlapping matches
        raw_matches.sort(key=lambda x: (x[0], -(x[1] - x[0])))
        filtered_matches: List[Tuple[int, int, str, str, float]] = []
        last_end = -1

        for start, end, etype, val, conf in raw_matches:
            if start >= last_end:
                filtered_matches.append((start, end, etype, val, conf))
                last_end = end

        # Construct synthetic tokens and perform reversible substitution
        type_counters: Dict[str, int] = {}
        token_map: Dict[str, str] = {}
        detected_entities: List[DetectedEntity] = []

        # Sort descending by start offset to perform in-place string replacement without index skew
        descending_matches = sorted(filtered_matches, key=lambda x: x[0], reverse=True)
        sanitized_chars = list(text)

        for start, end, etype, val, conf in descending_matches:
            type_counters[etype] = type_counters.get(etype, 0) + 1
            token = f"[{etype}_{type_counters[etype]}]"
            token_map[token] = val
            
            detected_entities.append(
                DetectedEntity(
                    entity_type=etype,
                    token=token,
                    original_value=val,
                    start=start,
                    end=end,
                    confidence=conf
                )
            )
            # Replace characters in buffer
            sanitized_chars[start:end] = list(token)

        # Restore detected entities order to match text appearance
        detected_entities.reverse()
        sanitized_text = "".join(sanitized_chars)

        # Cache session token map for reverse detokenization lookup
        if session_id:
            if session_id not in self._session_token_vault:
                self._session_token_vault[session_id] = {}
            self._session_token_vault[session_id].update(token_map)

        return sanitized_text, detected_entities, token_map

    def detokenize(self, text: str, token_map: Dict[str, str]) -> Tuple[str, int]:
        """
        Reverses synthetic tokens back into their original values using the token map.
        """
        restored = text
        count = 0
        for token, original in token_map.items():
            if token in restored:
                restored = restored.replace(token, original)
                count += 1
        return restored, count


# Global singleton instance
pii_engine = PIIEngine()
