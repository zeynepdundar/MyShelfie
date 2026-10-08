import { API_URL } from "@/lib/config";
import { auth } from "@/lib/firebase";

/* ============================================================================
   MyShelfie API istemcisi — web › lib/api.ts ile aynı sözleşme.
   Mobil uygulamada Firestore yolu yok; veri her zaman apps/api'den gelir.
   ========================================================================== */

export const isApiConfigured = API_URL.length > 0;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function authHeader(forceRefresh: boolean): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "Not signed in");
  const token = await user.getIdToken(forceRefresh);
  return { Authorization: `Bearer ${token}` };
}

const TIMEOUT_MS = 60_000;

/**
 * Oturumdaki kullanıcının Firebase ID token'ıyla istek atar. 401 gelirse
 * token'ı bir kez yenileyip tekrar dener. 204'te undefined döner.
 *
 * Render'ın ücretsiz planında sunucu uyuyorsa ilk istek uzun sürebilir;
 * zaman aşımı bu yüzden cömert tutuldu.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body }: { method?: Method; body?: unknown } = {}
): Promise<T> {
  if (!isApiConfigured) throw new ApiError(0, "EXPO_PUBLIC_API_URL is not set");

  const send = async (forceRefresh: boolean) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(`${API_URL}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(await authHeader(forceRefresh)),
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new ApiError(0, error instanceof Error ? error.message : "Network error");
    } finally {
      clearTimeout(timer);
    }
  };

  let response = await send(false);
  if (response.status === 401) response = await send(true);

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? `API ${response.status}`, payload?.details);
  }

  return payload as T;
}
