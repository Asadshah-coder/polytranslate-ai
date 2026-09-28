"""Prompt builders for the AI writing tools (grammar, paraphrase, summarize)."""


def build_improve_prompt(language_name: str, kind: str) -> tuple[str, str]:
    if kind == "improve":
        system = (
            f"You are a professional editor. Improve the user's {language_name} "
            "text: fix grammar, improve clarity, flow, and readability, and make "
            "word choice more precise. Preserve the original meaning, facts, "
            "names, numbers, and tone. Return ONLY the improved text — no "
            "explanations, no quotation marks, no preamble."
        )
        instruction = "Improve the following text:"
    else:  # grammar
        system = (
            f"You are a grammar expert. Correct the grammar, spelling, and "
            f"punctuation of the user's {language_name} text while preserving "
            "its exact meaning, style, and vocabulary choices. Do not rephrase "
            "beyond what grammar correction requires. Return ONLY the corrected "
            "text — no explanations, no quotation marks, no preamble."
        )
        instruction = "Correct the grammar of the following text:"
    return system, instruction


PARAPHRASE_STYLES: dict[str, str] = {
    "simple": "plain, easy-to-understand language suitable for a general audience",
    "professional": "a polished, professional workplace register",
    "academic": "a formal academic register with precise vocabulary",
    "creative": "a vivid, expressive, creative voice with varied sentence structure",
}


def build_paraphrase_prompt(style: str) -> tuple[str, str]:
    style_desc = PARAPHRASE_STYLES.get(style, PARAPHRASE_STYLES["professional"])
    system = (
        "You are a skilled writing assistant. Paraphrase the user's text in "
        f"{style_desc}, preserving the original meaning, facts, names, and "
        "numbers exactly. Do not add new information.\n\n"
        "Respond in this exact format:\n"
        "<paraphrased text on one or more lines>\n"
        "Alternatives:\n"
        "- <alternative 1>\n"
        "- <alternative 2>\n"
        "- <alternative 3>\n\n"
        "Provide exactly 3 distinct alternatives."
    )
    return system, "Paraphrase the following text:"


SUMMARIZE_FORMATS: dict[str, str] = {
    "short": (
        "Write a short summary of the text in 2-3 sentences, capturing only "
        "the essential points."
    ),
    "bullets": (
        "Summarize the text as a bullet list, one key point per line. "
        "Separate bullets with newlines. Keep each bullet to one line."
    ),
    "detailed": (
        "Write a detailed summary covering all major points, arguments, and "
        "conclusions of the text, organized into clear paragraphs."
    ),
}


def build_summarize_prompt(format: str) -> tuple[str, str]:
    guidance = SUMMARIZE_FORMATS.get(format, SUMMARIZE_FORMATS["short"])
    system = (
        "You are a precise summarization assistant. "
        f"{guidance} Preserve facts, names, and numbers accurately. "
        "Do not add information that is not in the text. "
        "Return ONLY the summary — no preamble, no title."
    )
    return system, "Summarize the following text:"
