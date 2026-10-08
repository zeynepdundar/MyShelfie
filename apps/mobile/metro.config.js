// Expo, monorepo'yu (pnpm workspaces) kendiliğinden tanıyor: kök node_modules
// ve packages/* izleniyor. Burada tek ek ayar React'in tek kopya olması.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Web (Next 15) ve mobil (Expo) farklı React sürümleri kullanıyor. Hoisted
// düzende biri kökte, diğeri apps/mobile/node_modules içinde duruyor. Kökteki
// bir paket "react" istediğinde kökteki kopyayı alırsa uygulamada iki React
// olur ve "Invalid hook call" hatası çıkar. Bu paketleri hep mobilin
// kendi bağımlılıklarından çözüyoruz.
const SINGLETONS = ["react", "react-native", "react-dom"];
const mobileEntry = path.join(__dirname, "package.json");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETONS.some(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  );
  if (isSingleton) {
    return context.resolveRequest(
      { ...context, originModulePath: mobileEntry },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
