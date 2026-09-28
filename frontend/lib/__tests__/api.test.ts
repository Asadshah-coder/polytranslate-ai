import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import {
  ApiError,
  apiBaseUrl,
  backTranslate,
  detectLanguage,
  getBillingPlans,
  getDashboardStats,
  getHistory,
  getLanguages,
  improveText,
  login,
  paraphrase,
  setToken,
  summarize,
  transcribeAudio,
  translate,
} from "../api";

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (k: string) => {
        if (k.toLowerCase() === "content-type") return "application/json";
        return headers[k.toLowerCase()] ?? null;
      },
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
    blob: async () => new Blob([JSON.stringify(body)]),
  } as unknown as Response;
}

const BASE = "http://localhost:8000";

describe("api client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // api.ts guards window; simulate a browser-less env for determinism
    vi.stubGlobal("window", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setToken(null);
  });

  it("exposes the API base URL", () => {
    expect(apiBaseUrl()).toBe(BASE);
  });

  it("builds the translate URL and sends JSON with defaults", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ translated_text: "x", source_lang: "en", target_lang: "ur" }),
    );
    await translate({ text: "Hello", source_lang: "auto", target_lang: "ur" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/api/v1/translate`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      text: "Hello",
      source_lang: "auto",
      target_lang: "ur",
      tone: "general",
      style: "natural",
    });
  });

  it("omits the Authorization header when no token is stored", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ languages: [], count: 0 }));
    await getLanguages();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers as Record<string, string>).not.toHaveProperty("Authorization");
  });

  it("maps a 503 to a friendly service-unavailable message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: "Translation service is temporarily unavailable." }, 503));
    const err = await translate({ text: "hi", source_lang: "en", target_lang: "ur" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(503);
    expect((err as ApiError).detail).toMatch(/temporarily unavailable/i);
  });

  it("preserves server-provided detail strings", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: "Monthly character limit reached." }, 402));
    const err = await getDashboardStats().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(402);
    expect((err as ApiError).detail).toBe("Monthly character limit reached.");
  });

  it("joins pydantic-style validation error arrays", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: [{ msg: "Field required" }, { msg: "Too long" }] }, 422),
    );
    const err = await improveText("", "en").catch((e) => e);
    expect((err as ApiError).detail).toContain("Field required");
  });

  it("maps network failure to status 0 with a friendly message", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("fetch failed"));
    const err = await summarize("text").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
    expect((err as ApiError).detail).toMatch(/could not reach the server/i);
  });

  it("maps 429 to the contract rate-limit message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: "Rate limit exceeded. Try again shortly." }, 429));
    const err = await detectLanguage("hello").catch((e) => e);
    expect((err as ApiError).status).toBe(429);
    expect((err as ApiError).detail).toMatch(/rate limit/i);
  });

  it("maps 501 without detail to the not-configured fallback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, 501));
    const err = await transcribeAudio(new Blob(["x"])).catch((e) => e);
    expect((err as ApiError).status).toBe(501);
    expect((err as ApiError).detail).toMatch(/not configured/i);
  });

  it("sends login as OAuth2 password form with username=email", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: "tok", token_type: "bearer" }));
    await login("a@b.com", "secret123");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/api/v1/auth/login`);
    expect(init.headers).toMatchObject({ "Content-Type": "application/x-www-form-urlencoded" });
    const params = new URLSearchParams(init.body as string);
    expect(params.get("username")).toBe("a@b.com");
    expect(params.get("password")).toBe("secret123");
  });

  it("rewrites 401 on login to incorrect-credentials message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: "Authentication required." }, 401));
    const err = await login("a@b.com", "wrong").catch((e) => e);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).detail).toMatch(/incorrect email or password/i);
  });

  it("builds history query params correctly", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }));
    await getHistory("invoice", 10, 20);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/history?");
    expect(url).toContain("search=invoice");
    expect(url).toContain("limit=10");
    expect(url).toContain("offset=20");
  });

  it("hits the right endpoints for writing tools", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ paraphrased_text: "p", alternatives: [] }))
      .mockResolvedValueOnce(
        jsonResponse({
          original_text: "a",
          translated_text: "b",
          back_translated_text: "c",
          source_lang: "en",
          target_lang: "ur",
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ plans: [] }));
    await paraphrase("text", "academic");
    await backTranslate("a", "en", "ur");
    await getBillingPlans();
    const urls = fetchMock.mock.calls.map((c) => (c as [string, RequestInit])[0]);
    expect(urls).toEqual([
      `${BASE}/api/v1/paraphrase`,
      `${BASE}/api/v1/back-translate`,
      `${BASE}/api/v1/billing/plans`,
    ]);
  });
});
