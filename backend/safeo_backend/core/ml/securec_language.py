"""
Arabic / Arabizi / Urdu text normalisation for downstream pattern matching.

Shared by MultilingualAgent; maps common Arabizi digit substitutions,
Eastern/Persian digits → ASCII, and phonetic intent lexemes so spell-by-ear
WhatsApp-style payloads still hit English threat patterns.
"""
from __future__ import annotations

import re
from typing import Dict

# Arabizi digit → letter (common chat shorthand)
_ARABIZI_DIGIT_MAP: Dict[str, str] = {
    "2": "a",
    "3": "a",
    "5": "kh",
    "6": "t",
    "7": "h",
    "8": "q",
    "9": "s",
}

# Eastern Arabic-Indic (U+0660–U+0669) and Extended/Persian (U+06F0–U+06F9) → ASCII
_ARABIC_DIGIT_MAP: Dict[str, str] = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
}

# Urdu-specific codepoints → rough Latin transliteration
_URDU_CHAR_MAP: Dict[str, str] = {
    "\u06ba": "n",  # ں
    "\u06c1": "h",  # ہ
    "\u06d2": "e",  # ے
    "\u0688": "d",  # ڈ
    "\u0691": "r",  # ڑ
    "\u0679": "t",  # ٹ
    "\u0686": "ch",  # چ
    "\u0698": "zh",  # ژ
    "\u06af": "g",  # گ
    "\u06be": "h",  # ھ
    "\u067e": "p",  # پ
}

# Arabic destructive / SQL intent → Latin tokens (spell-by-ear bridge)
_ARABIC_INTENT_MAP: Dict[str, str] = {
    "إسقاط": "drop",
    "اسقاط": "drop",
    "حذف": "delete",
    "انتخاب": "select",
    "اختيار": "select",
    "جدول": "table",
    "اتحاد": "union",
    "سكربت": "script",
    "تجاوز": "bypass",
}

# Phonetic / Arabizi intent phrases → English security lexemes
_PHONETIC_INTENT: tuple[tuple[str, str], ...] = (
    (r"\b(3tini|atini|edini|a3tini|eddeeny)\b", "give me"),
    (r"\b(edini|idini)\s+(admin|root|access)\b", r"give me \2"),
    (r"\b(bypass|bypas|byepass)\b", "bypass"),
    (r"\b(password|passw0rd|p@ssw0rd)\b", "password"),
    # Protect MFA tokens before Arabizi digit substitution eats the "2"
    (r"\b2fa\b", "mfa"),
    (r"\bmfa\b", "mfa"),
)


def normalise_arabic_digits(text: str) -> str:
    """Map Eastern/Persian digits to ASCII so SQL patterns still match."""
    if not text:
        return ""
    out = text
    for digit, ascii_d in _ARABIC_DIGIT_MAP.items():
        out = out.replace(digit, ascii_d)
    return out


def normalise_arabic_block(text: str) -> str:
    """Strip diacritics and normalise Arabic presentation forms."""
    if not text:
        return ""
    out = re.sub(r"[\u064b-\u065f\u0670]", "", text)
    return out


def normalise_arabizi(text: str) -> str:
    """
    Expand Arabizi digit substitutions in chat-style tokens only.

    Replaces digits that start a letter-run (3tini) or sit between letters (m7mad).
    Leaves ordinary numbers and codes (Q3, 2024, 1=1) untouched.
    """
    out = text.lower()

    def _sub(match: re.Match) -> str:
        d = match.group(0)
        return _ARABIZI_DIGIT_MAP.get(d, d)

    # Digit between letters: m7mad, 5alas
    out = re.sub(r"(?<=[a-z])[2356789](?=[a-z])", _sub, out)
    # Digit starting a chat word: 3tini, 7abibi (≥2 letters after)
    out = re.sub(r"\b[2356789](?=[a-z]{2,})", _sub, out)
    return out


def normalise_urdu_chars(text: str) -> str:
    """Map Urdu-specific letters to Latin approximations."""
    out = text
    for char, latin in _URDU_CHAR_MAP.items():
        out = out.replace(char, latin)
    return out


def expand_arabic_intent(text: str) -> str:
    """Append Latin glosses for known Arabic attack tokens (keeps original)."""
    out = text
    for ar, en in _ARABIC_INTENT_MAP.items():
        if ar in out:
            out = out.replace(ar, f"{ar} {en}")
    return out


def expand_phonetic_intent(text: str) -> str:
    """Bridge informal spell-by-ear tokens to English threat lexemes."""
    out = text
    for pattern, repl in _PHONETIC_INTENT:
        out = re.sub(pattern, repl, out, flags=re.IGNORECASE)
    return out


def normalise_mixed_script(text: str) -> str:
    """Full normalisation pipeline for multilingual / code-switch payloads."""
    if not text:
        return ""
    step = normalise_arabic_block(text)
    step = normalise_arabic_digits(step)
    step = expand_arabic_intent(step)
    step = normalise_urdu_chars(step)
    step = expand_phonetic_intent(step)
    step = normalise_arabizi(step)
    return re.sub(r"\s+", " ", step).strip()
