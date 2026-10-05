import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { env, hasFirebaseCredentials } from "./env.js";
import { serviceUnavailable, unauthorized } from "./http-error.js";
import type { AuthUser } from "./services/users.js";

let app: App | undefined;

export function getFirebaseApp(): App {
  if (!hasFirebaseCredentials) {
    throw serviceUnavailable(
      "Firebase kimlik bilgileri eksik. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY tanımlayın.",
    );
  }

  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
      });
  }

  return app;
}

/**
 * Firebase ID token'ını doğrular ve uid ile temel bilgileri döndürür.
 * Süresi dolmuş/bozuk token 401'e çevrilir; istemci token'ı yenileyip
 * tekrar dener (getIdToken(true)).
 */
export async function verifyIdToken(token: string): Promise<AuthUser> {
  const auth = getAuth(getFirebaseApp());

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    throw unauthorized(
      code === "auth/id-token-expired"
        ? "Oturum süresi doldu, token'ı yenileyin"
        : "Geçersiz kimlik token'ı",
    );
  }

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    displayName: (decoded.name as string | undefined) ?? null,
    photoUrl: decoded.picture ?? null,
    isAnonymous: decoded.firebase?.sign_in_provider === "anonymous",
  };
}
