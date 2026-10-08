import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Platform } from "react-native";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";

/* Web uygulamasıyla aynı Firebase projesi (shelfie-7bb6c). Bu değerler gizli
   değildir; erişim Firebase Auth + API tarafındaki token doğrulamasıyla
   korunur. */
const firebaseConfig = {
  apiKey: "AIzaSyCY7ZnqQ2Bz5IQQJIhVzyAKYriUghrQ_y8",
  authDomain: "shelfie-7bb6c.firebaseapp.com",
  projectId: "shelfie-7bb6c",
  storageBucket: "shelfie-7bb6c.firebasestorage.app",
  messagingSenderId: "535811303475",
  appId: "1:535811303475:web:7836ac602e863c94ef5b46",
};

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

/**
 * Oturum telefonda AsyncStorage'da saklanır; uygulama kapanıp açılınca
 * kullanıcı tekrar giriş yapmak zorunda kalmaz. Fast Refresh modülü yeniden
 * çalıştırdığında initializeAuth ikinci kez çağrılamaz, o yüzden getAuth.
 * (Web önizlemesinde RN kalıcılığı yok; orada tarayıcı varsayılanı kullanılır.)
 */
export const auth: Auth =
  isFirstInit && Platform.OS !== "web"
    ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(app);

export default app;
