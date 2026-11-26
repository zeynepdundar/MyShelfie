import type { ConfigContext, ExpoConfig } from "expo/config";

/* ============================================================================
   app.json'u olduğu gibi kullanır; tek ek iş production build koruması.
   EXPO_PUBLIC_* değerleri build anında uygulamaya gömülür. API adresi boş
   ya da yerel bir adres kalırsa uygulama kurulum ekranında takılır (App
   Review reddi). Bu yüzden production profilinde build'i baştan durdurur.
   Yalnızca EAS sunucusunda (EAS_BUILD=true) çalışır: orada .env yoktur,
   değerler EAS production ortamından gelir. Yereldeki .env (ör. yerel ağ
   IP'si) bu kontrolü etkilemez.
   ========================================================================== */

export default ({ config }: ConfigContext): ExpoConfig => {
  if (process.env.EAS_BUILD === "true" && process.env.EAS_BUILD_PROFILE === "production") {
    const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
    if (!apiUrl) {
      throw new Error(
        "EXPO_PUBLIC_API_URL boş. EAS production ortamına ekleyin: " +
          "eas env:create --environment production --name EXPO_PUBLIC_API_URL --value https://<render-api> --visibility plaintext"
      );
    }
    if (!apiUrl.startsWith("https://") || /localhost|127\.0\.0\.1|192\.168\.|10\.0\./.test(apiUrl)) {
      throw new Error(`EXPO_PUBLIC_API_URL production için geçerli değil: "${apiUrl}" (https ve canlı adres olmalı).`);
    }
  }
  return config as ExpoConfig;
};
