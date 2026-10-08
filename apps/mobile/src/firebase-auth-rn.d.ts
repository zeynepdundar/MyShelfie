/*
 * firebase/auth çalışma zamanında Metro'nun "react-native" koşuluyla RN
 * derlemesini yükler ve getReactNativePersistence orada vardır. Ancak paket
 * tiplerini yalnızca web derlemesi için yayınlıyor; bu tanım eksik tipi ekler.
 */
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
