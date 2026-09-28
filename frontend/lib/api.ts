/**
 * Typed HTTP client for the PolyTranslate AI backend.
 * Consumes docs/api.md EXACTLY — field names and shapes match the contract.
 * Never throws raw stack traces; all failures surface as ApiError with a
 * user-friendly `detail` string.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export const TOKEN_STORAGE_KEY = "polytranslate_token";

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function friendlyForStatus(status: number): string {
  switch (status) {
    case 400:
      return "The request was invalid. Please check your input and try again.";
    case 401:
      return "Authentication required. Please sign in.";
    case 402:
      return "Monthly character limit reached. Please upgrade your plan or wait for the next cycle.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "The requested resource was not found.";
    case 413:
      return "The uploaded file is too large.";
    case 429:
      return "Rate limit exceeded. Please try again shortly.";
    case 501:
      return "This feature is not configured on the server yet.";
    case 503:
      return "The AI service is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = (data as Record<string, unknown>).detail;
  if (typeof d === "string" && d.trim()) return d;
  if (Array.isArray(d)) {
    const msgs = d
      .map((e) => (e && typeof e === "object" ? String((e as Record<string, unknown>).msg ?? "") : ""))
      .filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Token storage (documented: localStorage; see README + privacy page)  */
/* ------------------------------------------------------------------ */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/* ------------------------------------------------------------------ */
/* Core request helpers                                                */
/* ------------------------------------------------------------------ */

type JsonBody = Record<string, unknown>;

async function request<T>(path: string, init: RequestInit = {}, body?: JsonBody | FormData): Promise<T> {
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body; // browser sets multipart boundary itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers, body: payload });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your internet connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let detail = friendlyForStatus(res.status);
    if (contentType.includes("json")) {
      try {
        detail = extractDetail(await res.json()) || detail;
      } catch {
        /* keep friendly fallback */
      }
    }
    throw new ApiError(res.status, detail);
  }

  if (contentType.includes("json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export interface DownloadedFile {
  blob: Blob;
  filename: string;
}

function filenameFromDisposition(header: string | null, fallback: string): string {
  if (header) {
    const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (star) {
      try {
        return decodeURIComponent(star[1]);
      } catch {
        /* fall through */
      }
    }
    const plain = /filename="?([^";]+)"?/i.exec(header);
    if (plain) return plain[1];
  }
  return fallback;
}

async function requestBlob(path: string, body: FormData | JsonBody, fallbackName: string): Promise<DownloadedFile> {
  const headers: Record<string, string> = {};
  let payload: BodyInit;
  if (body instanceof FormData) {
    payload = body;
  } else {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: payload });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your internet connection and try again.");
  }
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let detail = friendlyForStatus(res.status);
    if (ct.includes("json")) {
      try {
        detail = extractDetail(await res.json()) || detail;
      } catch {
        /* keep fallback */
      }
    }
    throw new ApiError(res.status, detail);
  }
  const blob = await res.blob();
  return { blob, filename: filenameFromDisposition(res.headers.get("content-disposition"), fallbackName) };
}

/* ------------------------------------------------------------------ */
/* Contract types                                                      */
/* ------------------------------------------------------------------ */

export type Tone = "general" | "formal" | "casual" | "professional" | "academic" | "marketing" | "technical";
export type TranslateStyle = "natural" | "literal" | "professional" | "concise";
export type ParaphraseStyle = "simple" | "professional" | "academic" | "creative";
export type SummaryFormat = "short" | "bullets" | "detailed";

export interface TranslateResponse {
  translated_text: string;
  source_lang: string;
  source_lang_name: string;
  target_lang: string;
  target_lang_name: string;
  was_auto_detected: boolean;
  source_char_count: number;
  translated_char_count: number;
  duration_ms: number;
  provider: string;
  model: string;
  detection_confidence?: "high" | "medium" | "low" | null;
}

export interface DetectResponse {
  language_code: string;
  language_name: string;
  native_name: string;
  confidence: "high" | "medium" | "low" | null;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  direction: "ltr" | "rtl";
  locale: string;
}

export interface HistoryItem {
  id: number;
  source_lang: string;
  target_lang: string;
  source_text: string;
  translated_text: string;
  tone: string;
  style: string;
  created_at: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

export interface DashboardStats {
  plan: string;
  chars_used_this_month: number;
  chars_limit: number;
  translations_count: number;
  documents_count: number;
  speech_requests: number;
}

export interface Plan {
  id: string;
  name: string;
  price_usd: number;
  monthly_characters: number;
  features: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  created_at: string;
}

export interface SeoPair {
  slug: string;
  source_lang: string;
  target_lang: string;
  title: string;
}

/* ------------------------------------------------------------------ */
/* Translation & writing tools                                         */
/* ------------------------------------------------------------------ */

export function translate(opts: {
  text: string;
  source_lang: string;
  target_lang: string;
  tone?: Tone;
  style?: TranslateStyle;
}): Promise<TranslateResponse> {
  return request<TranslateResponse>("/api/v1/translate", { method: "POST" }, {
    text: opts.text,
    source_lang: opts.source_lang,
    target_lang: opts.target_lang,
    tone: opts.tone ?? "general",
    style: opts.style ?? "natural",
  });
}

export function detectLanguage(text: string): Promise<DetectResponse> {
  return request<DetectResponse>("/api/v1/detect-language", { method: "POST" }, { text });
}

export function improveText(text: string, language = "en"): Promise<{ improved_text: string }> {
  return request("/api/v1/improve", { method: "POST" }, { text, language });
}

export function paraphrase(text: string, style: ParaphraseStyle = "professional"): Promise<{
  paraphrased_text: string;
  alternatives: string[];
}> {
  return request("/api/v1/paraphrase", { method: "POST" }, { text, style });
}

export function summarize(text: string, format: SummaryFormat = "short"): Promise<{ summary: string }> {
  return request("/api/v1/summarize", { method: "POST" }, { text, format });
}

export function backTranslate(text: string, source_lang: string, target_lang: string): Promise<{
  original_text: string;
  translated_text: string;
  back_translated_text: string;
  source_lang: string;
  target_lang: string;
}> {
  return request("/api/v1/back-translate", { method: "POST" }, { text, source_lang, target_lang });
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export function translateDocument(
  file: File,
  source_lang: string,
  target_lang: string,
  output_format: string,
): Promise<DownloadedFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("source_lang", source_lang);
  form.append("target_lang", target_lang);
  form.append("output_format", output_format);
  const ext = output_format || file.name.split(".").pop() || "txt";
  return requestBlob("/api/v1/documents/translate", form, `translated.${ext}`);
}

export function getSupportedFormats(): Promise<{ input: string[]; output: string[] }> {
  return request("/api/v1/documents/supported");
}

/* ------------------------------------------------------------------ */
/* Speech                                                              */
/* ------------------------------------------------------------------ */

export function transcribeAudio(audio: File | Blob): Promise<{ transcript: string; language_code: string | null }> {
  const form = new FormData();
  const file = audio instanceof File ? audio : new File([audio], "recording.webm", { type: audio.type || "audio/webm" });
  form.append("audio", file);
  return request("/api/v1/speech/transcribe", { method: "POST" }, form);
}

export function synthesizeSpeech(text: string, language: string, voice?: string | null, speed = 1.0): Promise<DownloadedFile> {
  return requestBlob("/api/v1/speech/synthesize", { text, language, voice: voice ?? null, speed }, "speech.mp3");
}

/* ------------------------------------------------------------------ */
/* Languages                                                           */
/* ------------------------------------------------------------------ */

export function getLanguages(): Promise<{ languages: Language[]; count: number }> {
  return request("/api/v1/languages");
}

export function getLanguage(code: string): Promise<Language> {
  return request(`/api/v1/languages/${encodeURIComponent(code)}`);
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export function signup(name: string, email: string, password: string): Promise<{
  access_token: string;
  token_type: string;
  user: User;
}> {
  return request("/api/v1/auth/signup", { method: "POST" }, { name, email, password });
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  // Contract: OAuth2 password form, username = email.
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your internet connection and try again.");
  }
  if (!res.ok) {
    let detail = friendlyForStatus(res.status);
    try {
      detail = extractDetail(await res.json()) || detail;
    } catch {
      /* keep fallback */
    }
    if (res.status === 401) detail = "Incorrect email or password.";
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as { access_token: string; token_type: string };
}

export function me(): Promise<User> {
  return request<User>("/api/v1/auth/me");
}

export function requestPasswordReset(email: string): Promise<{ message: string }> {
  return request("/api/v1/auth/password-reset/request", { method: "POST" }, { email });
}

export function confirmPasswordReset(token: string, new_password: string): Promise<{ message: string }> {
  return request("/api/v1/auth/password-reset/confirm", { method: "POST" }, { token, new_password });
}

/* ------------------------------------------------------------------ */
/* History / dashboard / billing / misc                                */
/* ------------------------------------------------------------------ */

export function getHistory(search?: string, limit = 20, offset = 0): Promise<HistoryResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) params.set("search", search);
  return request<HistoryResponse>(`/api/v1/history?${params.toString()}`);
}

export function deleteHistoryItem(id: number): Promise<void> {
  return request<void>(`/api/v1/history/${id}`, { method: "DELETE" });
}

export function clearHistory(): Promise<void> {
  return request<void>("/api/v1/history", { method: "DELETE" });
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request("/api/v1/dashboard/stats");
}

export function getBillingPlans(): Promise<{ plans: Plan[] }> {
  return request("/api/v1/billing/plans");
}

export function getSeoPairs(): Promise<{ pairs: SeoPair[] }> {
  return request("/api/v1/seo/pairs");
}

export function getHealth(): Promise<{
  status: string;
  version: string;
  provider_configured: boolean;
  provider: string;
  database: string;
}> {
  return request("/api/v1/health");
}

/** Base URL of the API, for building download links etc. */
export function apiBaseUrl(): string {
  return API_BASE;
}
