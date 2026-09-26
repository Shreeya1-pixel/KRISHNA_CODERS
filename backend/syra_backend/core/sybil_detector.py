"""
Lightweight Sybil / swarm detector for the security decision plane.

When the same payload fingerprint arrives from many distinct user_ids in a
short window, flag SYBIL_SUSPECT. This is Web3-shaped trust logic (cheap
multiplicity vs. real stake) — not a blockchain product.
"""
from __future__ import annotations

import hashlib
import logging
import time
from collections import defaultdict, deque
from typing import Any, Deque, Dict, Set, Tuple

logger = logging.getLogger("syra.sybil")

# Tunables for demo + local stress tests
WINDOW_SECONDS = 30.0
DISTINCT_USER_THRESHOLD = 5
MAX_EVENTS = 5000


class SybilDetector:
    """In-memory burst detector keyed by payload fingerprint."""

    def __init__(
        self,
        window_seconds: float = WINDOW_SECONDS,
        distinct_user_threshold: int = DISTINCT_USER_THRESHOLD,
    ) -> None:
        self.window = window_seconds
        self.threshold = distinct_user_threshold
        # fingerprint -> deque[(timestamp, user_id)]
        self._events: Dict[str, Deque[Tuple[float, str]]] = defaultdict(
            lambda: deque(maxlen=MAX_EVENTS)
        )
        self._suspect_hits = 0

    @staticmethod
    def fingerprint(text: str) -> str:
        """Stable shape hash: lowercase + collapsed whitespace."""
        norm = " ".join((text or "").lower().split())
        return hashlib.sha256(norm.encode("utf-8")).hexdigest()[:16]

    def observe(self, text: str, user_id: str) -> Dict[str, Any]:
        """
        Record a scan observation. Returns sybil context for the scan response.
        """
        now = time.time()
        fp = self.fingerprint(text)
        uid = (user_id or "anonymous").strip() or "anonymous"
        bucket = self._events[fp]
        bucket.append((now, uid))

        # Prune outside window
        cutoff = now - self.window
        while bucket and bucket[0][0] < cutoff:
            bucket.popleft()

        users: Set[str] = {u for _, u in bucket}
        count = len(bucket)
        distinct = len(users)
        suspect = distinct >= self.threshold

        if suspect:
            self._suspect_hits += 1
            logger.warning(
                "SYBIL_SUSPECT fp=%s distinct_users=%s events=%s window=%.0fs",
                fp,
                distinct,
                count,
                self.window,
            )

        return {
            "sybil_suspect": suspect,
            "sybil_fingerprint": fp,
            "sybil_distinct_users": distinct,
            "sybil_event_count": count,
            "sybil_window_seconds": self.window,
            "sybil_threshold": self.threshold,
        }

    def stats(self) -> Dict[str, Any]:
        return {
            "active_fingerprints": len(self._events),
            "suspect_hits": self._suspect_hits,
            "window_seconds": self.window,
            "distinct_user_threshold": self.threshold,
        }


_detector: SybilDetector | None = None


def get_sybil_detector() -> SybilDetector:
    global _detector
    if _detector is None:
        _detector = SybilDetector()
    return _detector
