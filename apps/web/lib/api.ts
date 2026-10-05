import { auth } from "@/lib/firebase";

/* ============================================================================
   MyShelfie API istemcisi
   NEXT_PUBLIC_API_URL tanımlıysa kitap verisi apps/api üzerinden okunur ve
   yazılır; tanımlı değilse uygulama eskisi gibi doğrudan Firestore'u kullanır
   (bkz. lib/booksRepo.ts). Böylece API yayına alınana kadar canlı site
   etkilenmez, yerelde .env.local'a tek satır ekleyerek API denenebilir.
   ========================================================================== */

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Kitap verisi API'den mi geliyor? */
export const isApiEnabled = API_URL.length > 0;

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

async function authHeader(forceRefresh = false): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "Not signed in");
  const token = await user.getIdToken(forceRefresh);
  return { Authorization: `Bearer ${token}` };
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/**
 * Oturumdaki kullanıcının Firebase ID token'ıyla API'ye istek atar.
 * Token süresi dolmuşsa (401) bir kez yenileyip tekrar dener.
 * 204 yanıtında undefined döner; hata durumunda ApiError fırlatır.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body }: { method?: Method; body?: unknown } = {}
): Promise<T> {
  if (!isApiEnabled) throw new Error("NEXT_PUBLIC_API_URL tanımlı değil");

  const send = async (forceRefresh: boolean) =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(await authHeader(forceRefresh)),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await send(false);
  if (response.status === 401) response = await send(true);

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `API ${response.status}`,
      payload?.details
    );
  }

  return payload as T;
}
