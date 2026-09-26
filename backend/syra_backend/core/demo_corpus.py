"""
Code-switch / spell-by-ear demo corpus for the AI/ML hero demo.

Order matters for live demos: lead with cases that prove *normalisation*
(Arabic-Indic digits in SQL, IDN homographs), not only easy Arabizi keywords.
"""
from __future__ import annotations

from typing import Any, Dict, List

CODE_SWITCH_SAMPLES: List[Dict[str, Any]] = [
    # ── Lead with hard normalisation cases ───────────────────────────────────
    {
        "id": "arabic_digits_1",
        "label": "arabic_digits",
        "expected_decision": "BLOCK",
        "input": "١=١ UNION SELECT password FROM users",
        "note": "LEAD: Eastern Arabic digits inside SQL — normalisation, not keyword match",
    },
    {
        "id": "homograph_1",
        "label": "homograph",
        "expected_decision": "BLOCK",
        "input": "https://ọpen-ạccess.com/login",
        "note": "LEAD: IDN / script-borrowing lookalike — confusable Unicode",
    },
    {
        "id": "arabic_digits_2",
        "label": "arabic_digits",
        "expected_decision": "BLOCK",
        "input": "OR ١ = ١ --",
        "note": "Classic tautology with Arabic-Indic ones",
    },
    {
        "id": "mixed_script_1",
        "label": "mixed_script",
        "expected_decision": "BLOCK",
        "input": "إسقاط جدول users",
        "note": "Arabic destructive verb + English table noun",
    },
    {
        "id": "mixed_script_2",
        "label": "mixed_script",
        "expected_decision": "BLOCK",
        "input": "انتخاب * من users WHERE ١=١",
        "note": "Arabic SELECT intent + digit tautology",
    },
    # ── Arabizi / spell-by-ear (still important, not the cold open) ──────────
    {
        "id": "arabizi_priv_1",
        "label": "arabizi",
        "expected_decision": "BLOCK",
        "input": "3tini admin access right now",
        "note": "Arabizi phonetic: 3tini → give me + privilege abuse",
    },
    {
        "id": "arabizi_priv_2",
        "label": "arabizi",
        "expected_decision": "BLOCK",
        "input": "edini root password bypass 2fa",
        "note": "Spell-by-ear privilege + MFA disable intent",
    },
    {
        "id": "arabizi_sql_1",
        "label": "arabizi",
        "expected_decision": "BLOCK",
        "input": "show me union select password from users plz",
        "note": "Latin SQLi with chat slang",
    },
    {
        "id": "mixed_script_3",
        "label": "mixed_script",
        "expected_decision": "WARN",
        "input": "<script>alert('مرحبا')</script>",
        "note": "XSS shell with Arabic string literal",
    },
    {
        "id": "homograph_2",
        "label": "homograph",
        "expected_decision": "BLOCK",
        "input": "Visit раypal.com to reset password",
        "note": "Cyrillic lookalikes in brand name (known hard miss for Tier-1)",
    },
    {
        "id": "clean_1",
        "label": "clean",
        "expected_decision": "ALLOW",
        "input": "Please schedule the Q3 vendor meeting for Tuesday.",
        "note": "Clean English business note",
    },
    {
        "id": "clean_2",
        "label": "clean",
        "expected_decision": "ALLOW",
        "input": "شكرا على المساعدة في تقرير المبيعات",
        "note": "Clean Arabic business thanks — should stay ALLOW",
    },
]


def get_code_switch_corpus() -> Dict[str, Any]:
    return {
        "count": len(CODE_SWITCH_SAMPLES),
        "theme": "code-switching & spelling by ear",
        "lead": "arabic_digits + IDN homograph — prove normalisation first",
        "usage": "POST each sample.input to /v1/scan and compare decision vs expected_decision",
        "samples": CODE_SWITCH_SAMPLES,
    }
