"""Curated SEO language-pair configurations.

Only meaningful, supported pairs are listed — no thin doorway pages.
Each pair carries genuinely useful unique content: an intro, FAQ, common
phrases (standard, dictionary-level translations), and practical tips.

Reverse pairs reuse the forward pair's phrases by swapping source/target.
The LanguagePair DB table can override these in the future without a deploy.
"""

from ..languages import registry

# Standard everyday phrases, English -> target. These are dictionary-level
# facts (greetings, thanks), not AI-generated content.
_BASE_PHRASES: dict[str, list[tuple[str, str]]] = {
    "ur": [
        ("Hello", "ہیلو"),
        ("Thank you", "شکریہ"),
        ("How are you?", "آپ کیسے ہیں؟"),
        ("Good morning", "صبح بخیر"),
        ("Good night", "شب بخیر"),
        ("Yes", "ہاں"),
        ("No", "نہیں"),
        ("Please", "براہ کرم"),
        ("Excuse me", "معاف کیجیے"),
        ("Welcome", "خوش آمدید"),
    ],
    "ar": [
        ("Hello", "مرحبا"),
        ("Thank you", "شكراً"),
        ("How are you?", "كيف حالك؟"),
        ("Good morning", "صباح الخير"),
        ("Good night", "تصبح على خير"),
        ("Yes", "نعم"),
        ("No", "لا"),
        ("Please", "من فضلك"),
        ("Excuse me", "عذراً"),
        ("Welcome", "أهلاً وسهلاً"),
    ],
    "es": [
        ("Hello", "Hola"),
        ("Thank you", "Gracias"),
        ("How are you?", "¿Cómo estás?"),
        ("Good morning", "Buenos días"),
        ("Good night", "Buenas noches"),
        ("Yes", "Sí"),
        ("No", "No"),
        ("Please", "Por favor"),
        ("Excuse me", "Disculpe"),
        ("Welcome", "Bienvenido"),
    ],
    "hi": [
        ("Hello", "नमस्ते"),
        ("Thank you", "धन्यवाद"),
        ("How are you?", "आप कैसे हैं?"),
        ("Good morning", "सुप्रभात"),
        ("Good night", "शुभ रात्रि"),
        ("Yes", "हाँ"),
        ("No", "नहीं"),
        ("Please", "कृपया"),
        ("Excuse me", "माफ़ कीजिए"),
        ("Welcome", "स्वागत है"),
    ],
    "fr": [
        ("Hello", "Bonjour"),
        ("Thank you", "Merci"),
        ("How are you?", "Comment ça va ?"),
        ("Good morning", "Bonjour"),
        ("Good night", "Bonne nuit"),
        ("Yes", "Oui"),
        ("No", "Non"),
        ("Please", "S'il vous plaît"),
        ("Excuse me", "Excusez-moi"),
        ("Welcome", "Bienvenue"),
    ],
    "de": [
        ("Hello", "Hallo"),
        ("Thank you", "Danke"),
        ("How are you?", "Wie geht es dir?"),
        ("Good morning", "Guten Morgen"),
        ("Good night", "Gute Nacht"),
        ("Yes", "Ja"),
        ("No", "Nein"),
        ("Please", "Bitte"),
        ("Excuse me", "Entschuldigung"),
        ("Welcome", "Willkommen"),
    ],
}

# (source, target) pairs to publish. English is one side of every pair:
# these are the genuinely high-traffic, meaningful combinations.
_PAIR_DIRECTIONS: list[tuple[str, str]] = [
    ("en", "ur"), ("ur", "en"),
    ("en", "ar"), ("ar", "en"),
    ("en", "es"), ("es", "en"),
    ("en", "hi"), ("hi", "en"),
    ("en", "fr"), ("fr", "en"),
    ("en", "de"), ("de", "en"),
]


def _slug(source_name: str, target_name: str) -> str:
    return f"{source_name}-to-{target_name}".lower().replace(" ", "-")


def _phrases(source: str, target: str) -> list[dict[str, str]]:
    if source == "en" and target in _BASE_PHRASES:
        pairs = _BASE_PHRASES[target]
    elif target == "en" and source in _BASE_PHRASES:
        pairs = [(t, s) for s, t in _BASE_PHRASES[source]]
    else:
        return []
    return [{"source": s, "target": t} for s, t in pairs]


def _faq(source_name: str, target_name: str) -> list[dict[str, str]]:
    return [
        {
            "question": f"How accurate is AI translation from {source_name} to {target_name}?",
            "answer": (
                f"PolyTranslate AI uses context-aware large language models for {source_name} "
                f"to {target_name} translation, which handle idioms, grammar, and tone far better "
                f"than old word-by-word translators. Accuracy is high for everyday and business text, "
                "but for legal, medical, or certified documents you should still have a human "
                "reviewer check the result."
            ),
        },
        {
            "question": f"Can I translate {source_name} to {target_name} for free?",
            "answer": (
                f"Yes. The Free plan includes {source_name} to {target_name} text translation, "
                "automatic language detection, grammar tools, and translation history — no credit "
                "card required."
            ),
        },
        {
            "question": f"Does the translator handle {target_name} grammar correctly?",
            "answer": (
                f"Yes. The translation engine is instructed to respect {target_name} grammar, "
                "punctuation, and sentence structure, and to preserve names, numbers, dates, "
                "and URLs exactly as they appear in the source text."
            ),
        },
        {
            "question": f"Can I translate documents from {source_name} to {target_name}?",
            "answer": (
                f"Yes. Upload TXT, DOCX, or PDF files and PolyTranslate AI extracts the text, "
                f"translates it in paragraph-preserving chunks, and returns a translated {source_name} "
                f"to {target_name} document you can download."
            ),
        },
        {
            "question": f"How is this different from a basic {source_name}-{target_name} dictionary?",
            "answer": (
                "Dictionaries translate isolated words. PolyTranslate AI translates whole passages "
                "with context: it picks the meaning that fits the sentence, keeps the tone you "
                "select (formal, casual, business, academic), and keeps your formatting intact."
            ),
        },
    ]


def _tips(source_name: str, target_name: str) -> list[str]:
    return [
        f"Write complete sentences — context is what makes {source_name} to {target_name} AI translation accurate.",
        "Choose the right tone: 'formal' for official letters, 'casual' for chats, 'business' or 'academic' for work and study.",
        "Keep proper names, brand names, and technical terms as they are; the engine preserves them automatically.",
        "For long documents, translate once and use back-translation to sanity-check that the meaning survived the round trip.",
        f"When a result looks off, try the 'literal' style to see a closer-to-source rendering, then switch back to 'natural'.",
    ]


def _build_pair(source: str, target: str) -> dict:
    src = registry.get(source)
    tgt = registry.get(target)
    assert src and tgt
    src_name, tgt_name = src["name"], tgt["name"]
    return {
        "slug": _slug(src_name, tgt_name),
        "source_lang": source,
        "target_lang": target,
        "title": f"{src_name} to {tgt_name} Translator",
        "meta_description": (
            f"Translate {src_name} to {tgt_name} instantly with PolyTranslate AI — "
            f"fast, natural, context-aware AI translation with tone control, "
            f"grammar tools, and document support."
        ),
        "intro": (
            f"Translate {src_name} to {tgt_name} with AI that understands context, "
            f"not just words. Type or paste your {src_name} text, pick a tone — formal, "
            f"casual, business, or academic — and get a natural {tgt_name} translation "
            "in seconds. Automatic language detection, grammar correction, "
            "back-translation checking, and TXT/DOCX/PDF document translation are "
            "built in."
        ),
        "faq": _faq(src_name, tgt_name),
        "common_phrases": _phrases(source, target),
        "tips": _tips(src_name, tgt_name),
        "related": [
            _slug(registry.get(s)["name"], registry.get(t)["name"])  # type: ignore[index]
            for s, t in _PAIR_DIRECTIONS
            if (s, t) != (source, target) and (s == source or t == target)
        ][:6],
    }


_PAIRS: list[dict] = [_build_pair(s, t) for s, t in _PAIR_DIRECTIONS]
_BY_SLUG: dict[str, dict] = {p["slug"]: p for p in _PAIRS}


def get_pairs() -> list[dict]:
    """Summaries for the /seo/pairs endpoint and sitemap generation."""
    return [
        {
            "slug": p["slug"],
            "source_lang": p["source_lang"],
            "target_lang": p["target_lang"],
            "title": p["title"],
        }
        for p in _PAIRS
    ]


def get_pair(slug: str) -> dict | None:
    """Full pair config (title, meta, intro, faq, phrases, tips, related)."""
    return _BY_SLUG.get(slug)
