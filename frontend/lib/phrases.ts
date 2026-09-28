// Curated common-phrase tables for PolyTranslate AI pair pages.
// English -> X direction, keyed by the NON-English ISO 639-1 code.
// Only phrases included here are ones verified as correct.
// `roman` is included only where the transliteration is certain.

export interface Phrase { en: string; text: string; roman?: string; }

export const PHRASES: Record<string, Phrase[]> = {
  ur: [
    { en: "Hello", text: "السلام علیکم", roman: "Assalam-o-Alaikum" },
    { en: "Thank you", text: "شکریہ", roman: "Shukriya" },
    { en: "Please", text: "براہ کرم", roman: "Barah-e-karam" },
    { en: "Yes", text: "جی ہاں", roman: "Jee haan" },
    { en: "No", text: "نہیں", roman: "Nahin" },
    { en: "Good morning", text: "صبح بخیر", roman: "Subah bakhair" },
    { en: "Good night", text: "شب بخیر", roman: "Shab bakhair" },
    { en: "How are you?", text: "آپ کیسے ہیں؟", roman: "Aap kaise hain?" },
    { en: "Welcome", text: "خوش آمدید", roman: "Khush aamdeed" },
    { en: "Excuse me / Sorry", text: "معاف کیجیے", roman: "Maaf kijiye" },
  ],
  ar: [
    { en: "Hello", text: "السلام عليكم", roman: "As-salamu alaykum" },
    { en: "Thank you", text: "شكراً", roman: "Shukran" },
    { en: "Please", text: "من فضلك", roman: "Min fadlik" },
    { en: "Yes", text: "نعم", roman: "Na'am" },
    { en: "No", text: "لا", roman: "La" },
    { en: "Good morning", text: "صباح الخير", roman: "Sabah al-khayr" },
    { en: "Good night", text: "تصبح على خير", roman: "Tusbih ala khayr" },
    { en: "How are you?", text: "كيف حالك؟", roman: "Kayfa haluk?" },
    { en: "Welcome", text: "أهلاً وسهلاً", roman: "Ahlan wa sahlan" },
    { en: "Excuse me", text: "عذراً", roman: "'Udhran" },
  ],
  es: [
    { en: "Hello", text: "Hola" },
    { en: "Thank you", text: "Gracias" },
    { en: "Please", text: "Por favor" },
    { en: "Yes", text: "Sí" },
    { en: "No", text: "No" },
    { en: "Good morning", text: "Buenos días" },
    { en: "Good night", text: "Buenas noches" },
    { en: "How are you?", text: "¿Cómo estás?" },
    { en: "Welcome", text: "Bienvenido" },
    { en: "Excuse me", text: "Perdón" },
  ],
  fr: [
    { en: "Hello", text: "Bonjour" },
    { en: "Thank you", text: "Merci" },
    { en: "Please", text: "S'il vous plaît" },
    { en: "Yes", text: "Oui" },
    { en: "No", text: "Non" },
    { en: "Good morning", text: "Bonjour" },
    { en: "Good night", text: "Bonne nuit" },
    { en: "How are you?", text: "Comment allez-vous ?" },
    { en: "Welcome", text: "Bienvenue" },
    { en: "Excuse me", text: "Excusez-moi" },
  ],
  de: [
    { en: "Hello", text: "Hallo" },
    { en: "Thank you", text: "Danke" },
    { en: "Please", text: "Bitte" },
    { en: "Yes", text: "Ja" },
    { en: "No", text: "Nein" },
    { en: "Good morning", text: "Guten Morgen" },
    { en: "Good night", text: "Gute Nacht" },
    { en: "How are you?", text: "Wie geht es Ihnen?" },
    { en: "Welcome", text: "Willkommen" },
    { en: "Excuse me", text: "Entschuldigung" },
  ],
  hi: [
    { en: "Hello", text: "नमस्ते", roman: "Namaste" },
    { en: "Thank you", text: "धन्यवाद", roman: "Dhanyavaad" },
    { en: "Please", text: "कृपया", roman: "Kripaya" },
    { en: "Yes", text: "हाँ", roman: "Haan" },
    { en: "No", text: "नहीं", roman: "Nahin" },
    { en: "Good morning", text: "सुप्रभात", roman: "Suprabhat" },
    { en: "Good night", text: "शुभ रात्रि", roman: "Shubh raatri" },
    { en: "How are you?", text: "आप कैसे हैं?", roman: "Aap kaise hain?" },
    { en: "Welcome", text: "स्वागत है", roman: "Swaagat hai" },
    { en: "Excuse me / Sorry", text: "माफ़ कीजिए", roman: "Maaf kijiye" },
  ],
  fa: [
    { en: "Hello", text: "سلام", roman: "Salam" },
    { en: "Thank you", text: "ممنون", roman: "Mamnoon" },
    { en: "Please", text: "لطفاً", roman: "Lotfan" },
    { en: "Yes", text: "بله", roman: "Bale" },
    { en: "No", text: "نه", roman: "Na" },
    { en: "Good morning", text: "صبح بخیر", roman: "Sobh bekheyr" },
    { en: "Good night", text: "شب بخیر", roman: "Shab bekheyr" },
    { en: "How are you?", text: "چطور هستید؟", roman: "Chetor hastid?" },
    { en: "Welcome", text: "خوش آمدید", roman: "Khosh amadid" },
    { en: "Excuse me", text: "ببخشید", roman: "Bebakhshid" },
  ],
  pt: [
    { en: "Hello", text: "Olá" },
    { en: "Thank you", text: "Obrigado" },
    { en: "Please", text: "Por favor" },
    { en: "Yes", text: "Sim" },
    { en: "No", text: "Não" },
    { en: "Good morning", text: "Bom dia" },
    { en: "Good night", text: "Boa noite" },
    { en: "How are you?", text: "Como você está?" },
    { en: "Welcome", text: "Bem-vindo" },
    { en: "Excuse me", text: "Com licença" },
  ],
  ru: [
    { en: "Hello", text: "Здравствуйте", roman: "Zdravstvuyte" },
    { en: "Thank you", text: "Спасибо", roman: "Spasibo" },
    { en: "Please", text: "Пожалуйста", roman: "Pozhaluysta" },
    { en: "Yes", text: "Да", roman: "Da" },
    { en: "No", text: "Нет", roman: "Net" },
    { en: "Good morning", text: "Доброе утро", roman: "Dobroye utro" },
    { en: "Good night", text: "Спокойной ночи", roman: "Spokoinoy nochi" },
    { en: "How are you?", text: "Как дела?", roman: "Kak dela?" },
    { en: "Welcome", text: "Добро пожаловать", roman: "Dobro pozhalovat'" },
    { en: "Excuse me", text: "Извините", roman: "Izvinite" },
  ],
  zh: [
    { en: "Hello", text: "你好", roman: "Nǐ hǎo" },
    { en: "Thank you", text: "谢谢", roman: "Xièxie" },
    { en: "Please", text: "请", roman: "Qǐng" },
    { en: "Yes", text: "是的", roman: "Shì de" },
    { en: "No", text: "不", roman: "Bù" },
    { en: "Good morning", text: "早上好", roman: "Zǎoshang hǎo" },
    { en: "Good night", text: "晚安", roman: "Wǎn'ān" },
    { en: "How are you?", text: "你好吗？", roman: "Nǐ hǎo ma?" },
    { en: "Welcome", text: "欢迎", roman: "Huānyíng" },
    { en: "Sorry", text: "对不起", roman: "Duìbuqǐ" },
  ],
  tr: [
    { en: "Hello", text: "Merhaba" },
    { en: "Thank you", text: "Teşekkür ederim" },
    { en: "Please", text: "Lütfen" },
    { en: "Yes", text: "Evet" },
    { en: "No", text: "Hayır" },
    { en: "Good morning", text: "Günaydın" },
    { en: "Good night", text: "İyi geceler" },
    { en: "How are you?", text: "Nasılsınız?" },
    { en: "Welcome", text: "Hoş geldiniz" },
    { en: "Excuse me", text: "Affedersiniz" },
  ],
};

export interface PhraseRow { a: string; b: string; }

// Returns rows for a pair page: a = source-language phrase, b = target-language phrase.
export function phrasesForPair(sourceCode: string, targetCode: string): PhraseRow[] {
  if (sourceCode === "en" && PHRASES[targetCode]) {
    return PHRASES[targetCode].map((p) => ({ a: p.en, b: p.text }));
  }
  if (targetCode === "en" && PHRASES[sourceCode]) {
    return PHRASES[sourceCode].map((p) => ({ a: p.text, b: p.en }));
  }
  return [];
}
