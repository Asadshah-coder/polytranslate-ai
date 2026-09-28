"""Central language registry.

109 real, well-established ISO 639-1 languages. Only languages the
configured LLM providers can actually translate are listed here —
nothing is invented. Each entry: code, name, native_name, direction, locale.

Use get() / all() / validate() — never hard-code language lists elsewhere.
"""

from __future__ import annotations

Language = dict[str, str]

_LANGUAGES: list[Language] = [
    {"code": "af", "name": "Afrikaans", "native_name": "Afrikaans", "direction": "ltr", "locale": "af-ZA"},
    {"code": "sq", "name": "Albanian", "native_name": "Shqip", "direction": "ltr", "locale": "sq-AL"},
    {"code": "am", "name": "Amharic", "native_name": "አማርኛ", "direction": "ltr", "locale": "am-ET"},
    {"code": "ar", "name": "Arabic", "native_name": "العربية", "direction": "rtl", "locale": "ar-SA"},
    {"code": "hy", "name": "Armenian", "native_name": "Հայերեն", "direction": "ltr", "locale": "hy-AM"},
    {"code": "az", "name": "Azerbaijani", "native_name": "Azərbaycan", "direction": "ltr", "locale": "az-AZ"},
    {"code": "eu", "name": "Basque", "native_name": "Euskara", "direction": "ltr", "locale": "eu-ES"},
    {"code": "be", "name": "Belarusian", "native_name": "Беларуская", "direction": "ltr", "locale": "be-BY"},
    {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "direction": "ltr", "locale": "bn-BD"},
    {"code": "bs", "name": "Bosnian", "native_name": "Bosanski", "direction": "ltr", "locale": "bs-BA"},
    {"code": "bg", "name": "Bulgarian", "native_name": "Български", "direction": "ltr", "locale": "bg-BG"},
    {"code": "ca", "name": "Catalan", "native_name": "Català", "direction": "ltr", "locale": "ca-ES"},
    {"code": "ceb", "name": "Cebuano", "native_name": "Bisaya", "direction": "ltr", "locale": "ceb-PH"},
    {"code": "zh", "name": "Chinese (Simplified)", "native_name": "简体中文", "direction": "ltr", "locale": "zh-CN"},
    {"code": "co", "name": "Corsican", "native_name": "Corsu", "direction": "ltr", "locale": "co-FR"},
    {"code": "hr", "name": "Croatian", "native_name": "Hrvatski", "direction": "ltr", "locale": "hr-HR"},
    {"code": "cs", "name": "Czech", "native_name": "Čeština", "direction": "ltr", "locale": "cs-CZ"},
    {"code": "da", "name": "Danish", "native_name": "Dansk", "direction": "ltr", "locale": "da-DK"},
    {"code": "dv", "name": "Dhivehi", "native_name": "ދިވެހި", "direction": "rtl", "locale": "dv-MV"},
    {"code": "nl", "name": "Dutch", "native_name": "Nederlands", "direction": "ltr", "locale": "nl-NL"},
    {"code": "en", "name": "English", "native_name": "English", "direction": "ltr", "locale": "en-US"},
    {"code": "eo", "name": "Esperanto", "native_name": "Esperanto", "direction": "ltr", "locale": "eo"},
    {"code": "et", "name": "Estonian", "native_name": "Eesti", "direction": "ltr", "locale": "et-EE"},
    {"code": "fi", "name": "Finnish", "native_name": "Suomi", "direction": "ltr", "locale": "fi-FI"},
    {"code": "fr", "name": "French", "native_name": "Français", "direction": "ltr", "locale": "fr-FR"},
    {"code": "fy", "name": "Frisian", "native_name": "Frysk", "direction": "ltr", "locale": "fy-NL"},
    {"code": "gl", "name": "Galician", "native_name": "Galego", "direction": "ltr", "locale": "gl-ES"},
    {"code": "ka", "name": "Georgian", "native_name": "ქართული", "direction": "ltr", "locale": "ka-GE"},
    {"code": "de", "name": "German", "native_name": "Deutsch", "direction": "ltr", "locale": "de-DE"},
    {"code": "el", "name": "Greek", "native_name": "Ελληνικά", "direction": "ltr", "locale": "el-GR"},
    {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "direction": "ltr", "locale": "gu-IN"},
    {"code": "ht", "name": "Haitian Creole", "native_name": "Kreyòl", "direction": "ltr", "locale": "ht-HT"},
    {"code": "ha", "name": "Hausa", "native_name": "Hausa", "direction": "ltr", "locale": "ha-NG"},
    {"code": "haw", "name": "Hawaiian", "native_name": "ʻŌlelo Hawaiʻi", "direction": "ltr", "locale": "haw-US"},
    {"code": "he", "name": "Hebrew", "native_name": "עברית", "direction": "rtl", "locale": "he-IL"},
    {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "direction": "ltr", "locale": "hi-IN"},
    {"code": "hmn", "name": "Hmong", "native_name": "Hmoob", "direction": "ltr", "locale": "hmn-US"},
    {"code": "hu", "name": "Hungarian", "native_name": "Magyar", "direction": "ltr", "locale": "hu-HU"},
    {"code": "is", "name": "Icelandic", "native_name": "Íslenska", "direction": "ltr", "locale": "is-IS"},
    {"code": "ig", "name": "Igbo", "native_name": "Igbo", "direction": "ltr", "locale": "ig-NG"},
    {"code": "id", "name": "Indonesian", "native_name": "Bahasa Indonesia", "direction": "ltr", "locale": "id-ID"},
    {"code": "ga", "name": "Irish", "native_name": "Gaeilge", "direction": "ltr", "locale": "ga-IE"},
    {"code": "it", "name": "Italian", "native_name": "Italiano", "direction": "ltr", "locale": "it-IT"},
    {"code": "ja", "name": "Japanese", "native_name": "日本語", "direction": "ltr", "locale": "ja-JP"},
    {"code": "jv", "name": "Javanese", "native_name": "Basa Jawa", "direction": "ltr", "locale": "jv-ID"},
    {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "direction": "ltr", "locale": "kn-IN"},
    {"code": "kk", "name": "Kazakh", "native_name": "Қазақша", "direction": "ltr", "locale": "kk-KZ"},
    {"code": "km", "name": "Khmer", "native_name": "ខ្មែរ", "direction": "ltr", "locale": "km-KH"},
    {"code": "rw", "name": "Kinyarwanda", "native_name": "Ikinyarwanda", "direction": "ltr", "locale": "rw-RW"},
    {"code": "ko", "name": "Korean", "native_name": "한국어", "direction": "ltr", "locale": "ko-KR"},
    {"code": "ku", "name": "Kurdish", "native_name": "Kurdî", "direction": "ltr", "locale": "ku-TR"},
    {"code": "ky", "name": "Kyrgyz", "native_name": "Кыргызча", "direction": "ltr", "locale": "ky-KG"},
    {"code": "lo", "name": "Lao", "native_name": "ລາວ", "direction": "ltr", "locale": "lo-LA"},
    {"code": "la", "name": "Latin", "native_name": "Latina", "direction": "ltr", "locale": "la"},
    {"code": "lv", "name": "Latvian", "native_name": "Latviešu", "direction": "ltr", "locale": "lv-LV"},
    {"code": "lt", "name": "Lithuanian", "native_name": "Lietuvių", "direction": "ltr", "locale": "lt-LT"},
    {"code": "lb", "name": "Luxembourgish", "native_name": "Lëtzebuergesch", "direction": "ltr", "locale": "lb-LU"},
    {"code": "mk", "name": "Macedonian", "native_name": "Македонски", "direction": "ltr", "locale": "mk-MK"},
    {"code": "mg", "name": "Malagasy", "native_name": "Malagasy", "direction": "ltr", "locale": "mg-MG"},
    {"code": "ms", "name": "Malay", "native_name": "Bahasa Melayu", "direction": "ltr", "locale": "ms-MY"},
    {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "direction": "ltr", "locale": "ml-IN"},
    {"code": "mt", "name": "Maltese", "native_name": "Malti", "direction": "ltr", "locale": "mt-MT"},
    {"code": "mi", "name": "Māori", "native_name": "Te Reo Māori", "direction": "ltr", "locale": "mi-NZ"},
    {"code": "mr", "name": "Marathi", "native_name": "मराठी", "direction": "ltr", "locale": "mr-IN"},
    {"code": "mn", "name": "Mongolian", "native_name": "Монгол", "direction": "ltr", "locale": "mn-MN"},
    {"code": "my", "name": "Myanmar (Burmese)", "native_name": "မြန်မာ", "direction": "ltr", "locale": "my-MM"},
    {"code": "ne", "name": "Nepali", "native_name": "नेपाली", "direction": "ltr", "locale": "ne-NP"},
    {"code": "no", "name": "Norwegian", "native_name": "Norsk", "direction": "ltr", "locale": "no-NO"},
    {"code": "ny", "name": "Nyanja", "native_name": "Chichewa", "direction": "ltr", "locale": "ny-MW"},
    {"code": "or", "name": "Odia (Oriya)", "native_name": "ଓଡ଼ିଆ", "direction": "ltr", "locale": "or-IN"},
    {"code": "ps", "name": "Pashto", "native_name": "پښتو", "direction": "rtl", "locale": "ps-AF"},
    {"code": "fa", "name": "Persian", "native_name": "فارسی", "direction": "rtl", "locale": "fa-IR"},
    {"code": "pl", "name": "Polish", "native_name": "Polski", "direction": "ltr", "locale": "pl-PL"},
    {"code": "pt", "name": "Portuguese", "native_name": "Português", "direction": "ltr", "locale": "pt-PT"},
    {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "direction": "ltr", "locale": "pa-IN"},
    {"code": "ro", "name": "Romanian", "native_name": "Română", "direction": "ltr", "locale": "ro-RO"},
    {"code": "ru", "name": "Russian", "native_name": "Русский", "direction": "ltr", "locale": "ru-RU"},
    {"code": "sm", "name": "Samoan", "native_name": "Gagana Samoa", "direction": "ltr", "locale": "sm-WS"},
    {"code": "gd", "name": "Scottish Gaelic", "native_name": "Gàidhlig", "direction": "ltr", "locale": "gd-GB"},
    {"code": "sr", "name": "Serbian", "native_name": "Српски", "direction": "ltr", "locale": "sr-RS"},
    {"code": "st", "name": "Sesotho", "native_name": "Sesotho", "direction": "ltr", "locale": "st-ZA"},
    {"code": "sn", "name": "Shona", "native_name": "chiShona", "direction": "ltr", "locale": "sn-ZW"},
    {"code": "sd", "name": "Sindhi", "native_name": "سنڌي", "direction": "rtl", "locale": "sd-PK"},
    {"code": "si", "name": "Sinhala", "native_name": "සිංහල", "direction": "ltr", "locale": "si-LK"},
    {"code": "sk", "name": "Slovak", "native_name": "Slovenčina", "direction": "ltr", "locale": "sk-SK"},
    {"code": "sl", "name": "Slovenian", "native_name": "Slovenščina", "direction": "ltr", "locale": "sl-SI"},
    {"code": "so", "name": "Somali", "native_name": "Soomaali", "direction": "ltr", "locale": "so-SO"},
    {"code": "es", "name": "Spanish", "native_name": "Español", "direction": "ltr", "locale": "es-ES"},
    {"code": "su", "name": "Sundanese", "native_name": "Basa Sunda", "direction": "ltr", "locale": "su-ID"},
    {"code": "sw", "name": "Swahili", "native_name": "Kiswahili", "direction": "ltr", "locale": "sw-KE"},
    {"code": "sv", "name": "Swedish", "native_name": "Svenska", "direction": "ltr", "locale": "sv-SE"},
    {"code": "tl", "name": "Tagalog", "native_name": "Tagalog", "direction": "ltr", "locale": "tl-PH"},
    {"code": "tg", "name": "Tajik", "native_name": "Тоҷикӣ", "direction": "ltr", "locale": "tg-TJ"},
    {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "direction": "ltr", "locale": "ta-IN"},
    {"code": "tt", "name": "Tatar", "native_name": "Татарча", "direction": "ltr", "locale": "tt-RU"},
    {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "direction": "ltr", "locale": "te-IN"},
    {"code": "th", "name": "Thai", "native_name": "ไทย", "direction": "ltr", "locale": "th-TH"},
    {"code": "tr", "name": "Turkish", "native_name": "Türkçe", "direction": "ltr", "locale": "tr-TR"},
    {"code": "tk", "name": "Turkmen", "native_name": "Türkmen", "direction": "ltr", "locale": "tk-TM"},
    {"code": "uk", "name": "Ukrainian", "native_name": "Українська", "direction": "ltr", "locale": "uk-UA"},
    {"code": "ur", "name": "Urdu", "native_name": "اردو", "direction": "rtl", "locale": "ur-PK"},
    {"code": "ug", "name": "Uyghur", "native_name": "ئۇيغۇر", "direction": "rtl", "locale": "ug-CN"},
    {"code": "uz", "name": "Uzbek", "native_name": "Oʻzbek", "direction": "ltr", "locale": "uz-UZ"},
    {"code": "vi", "name": "Vietnamese", "native_name": "Tiếng Việt", "direction": "ltr", "locale": "vi-VN"},
    {"code": "cy", "name": "Welsh", "native_name": "Cymraeg", "direction": "ltr", "locale": "cy-GB"},
    {"code": "xh", "name": "Xhosa", "native_name": "isiXhosa", "direction": "ltr", "locale": "xh-ZA"},
    {"code": "yi", "name": "Yiddish", "native_name": "ייִדיש", "direction": "rtl", "locale": "yi"},
    {"code": "yo", "name": "Yoruba", "native_name": "Yorùbá", "direction": "ltr", "locale": "yo-NG"},
    {"code": "zu", "name": "Zulu", "native_name": "isiZulu", "direction": "ltr", "locale": "zu-ZA"},
]

_INDEX: dict[str, Language] = {lang["code"]: lang for lang in _LANGUAGES}


def get(code: str) -> Language | None:
    """Return the language entry for a code, or None."""
    return _INDEX.get(code.lower().strip())


def all() -> list[Language]:
    """All registered languages (a copy)."""
    return list(_LANGUAGES)


def validate(code: str) -> bool:
    """True when the code is a registered ISO 639-1 language."""
    return code.lower().strip() in _INDEX


def is_rtl(code: str) -> bool:
    lang = get(code)
    return bool(lang) and lang["direction"] == "rtl"
