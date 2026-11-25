"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

import { auth } from "@/lib/firebase";
import { useAppDispatch } from "@/lib/hooks";
import { mapFirebaseUser, setStatus, setUser } from "@/lib/authSlice";

/**
 * Firebase oturumunu store'a bağlar.
 *
 * Bu olmadan oturum yalnızca giriş/çıkış thunk'larıyla değişirdi: sayfa
 * yenilendiğinde Firebase'de kayıtlı oturum dururken uygulama kullanıcıyı
 * çıkış yapmış sayardı.
 *
 * Kullanıcı değişince (çıkış, hesap silme, başka hesapla giriş) sorgu
 * önbelleği temizlenir: bir önceki kullanıcının kitapları ekranda kalmasın.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const lastUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    dispatch(setStatus("loading"));

    return onAuthStateChanged(auth, (firebaseUser) => {
      const uid = firebaseUser?.uid ?? null;
      if (lastUid.current !== undefined && lastUid.current !== uid) {
        queryClient.clear();
      }
      lastUid.current = uid;
      dispatch(setUser(mapFirebaseUser(firebaseUser)));
    });
  }, [dispatch, queryClient]);

  return <>{children}</>;
}
