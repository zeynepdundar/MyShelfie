"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Sunucu verisi (kitaplar, alıntılar) TanStack Query önbelleğinde durur;
 * Redux yalnızca oturum durumunu tutar.
 *
 * İstemci bileşen başına bir kez kurulur (useState), modül seviyesinde değil:
 * aksi hâlde sunucu tarafında farklı isteklerin önbelleği karışabilir.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Sayfalar arası geçişte aynı listeyi tekrar çekmesin; bir dakika taze.
        staleTime: 60_000,
        // Render'ın ücretsiz planında ilk istek yavaş olabilir; bir kez tekrar dene.
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Üretimde kendiliğinden hiçbir şey çizmez. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
