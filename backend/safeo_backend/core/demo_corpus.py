"""
Code-switch / spell-by-ear demo corpus for judges.

Returned by GET /v1/demo/code-switch — one-click samples for the hero demo.
"""
from __future__ import annotations

from typing import Any, Dict, List

CODE_SWITCH_SAMPLES: List[Dict[str, Any]] = [
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
        "id": "arabic_digits_1",
        "label": "arabic_digits",
        "expected_decision": "BLOCK",
        "input": "١=١ UNION SELECT password FROM users",
        "note": "Eastern Arabic digits inside SQL structure",
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
    {
        "id": "mixed_script_3",
        "label": "mixed_script",
        "expected_decision": "WARN",
        "input": "<script>alert('مرحبا')</script>",
        "note": "XSS shell with Arabic string literal",
    },
    {
        "id": "homograph_1",
        "label": "homograph",
        "expected_decision": "BLOCK",
        "input": "https://ọpen-ạccess.com/login",
        "note": "IDN / script-borrowing lookalike domain",
    },
    {
        "id": "homograph_2",
        "label": "homograph",
        "expected_decision": "BLOCK",
        "input": "Visit раypal.com to reset password",
        "note": "Cyrillic lookalikes in brand name",
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
        "usage": "POST each sample.input to /v1/scan and compare decision vs expected_decision",
        "samples": CODE_SWITCH_SAMPLES,
    }
