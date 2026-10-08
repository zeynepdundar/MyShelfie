import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";

import type { MessageKey } from "@/i18n";
import { meApi } from "@/lib/books";
import { auth } from "@/lib/firebase";

/* Giriş yolları (web ile aynı): misafir (anonymous), e-posta/şifre.
   Misafir hesap sonradan e-postaya bağlanabilir; uid değişmediği için
   API'deki kitaplar aynen kalır. Google ile giriş development build
   gerektirdiği için sonraki adımda eklenecek. */

interface AuthValue {
  user: User | null;
  initializing: boolean;
  signInGuest: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  /** Misafir hesabı e-posta/şifreye bağlar (uid aynı kalır). */
  linkEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [initializing, setInitializing] = useState(true);
  // Firebase aynı User nesnesini yerinde günceller (ör. isAnonymous);
  // tüketicilerin yeniden çizilmesi için sayaç.
  const [revision, bumpRevision] = useReducer((n: number) => n + 1, 0);

  useEffect(
    () =>
      onAuthStateChanged(auth, (next) => {
        setUser(next);
        setInitializing(false);
      }),
    []
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      initializing,
      signInGuest: async () => {
        await signInAnonymously(auth);
      },
      signInEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signUpEmail: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      },
      linkEmail: async (email, password) => {
        const current = auth.currentUser;
        if (!current) throw new Error("Not signed in");
        const credential = EmailAuthProvider.credential(email.trim(), password);
        await linkWithCredential(current, credential);
        bumpRevision();
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email.trim());
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
      deleteAccount: async () => {
        const current = auth.currentUser;
        if (!current) return;
        // Önce sunucudaki veri, sonra Firebase hesabı. Ters sırada token
        // geçersiz kalır ve API verisi silinemez.
        await meApi.remove();
        await deleteUser(current);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initializing, revision]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** Firebase hata kodunu kullanıcıya gösterilecek metnin anahtarına çevirir. */
export function authErrorKey(error: unknown): MessageKey {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/weak-password":
      return "auth.errors.weakPassword";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.errors.wrongCredentials";
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
      return "auth.errors.emailInUse";
    case "auth/too-many-requests":
      return "auth.errors.tooMany";
    case "auth/requires-recent-login":
      return "auth.errors.requiresRecentLogin";
    case "auth/network-request-failed":
      return "common.networkError";
    default:
      return "common.error";
  }
}
