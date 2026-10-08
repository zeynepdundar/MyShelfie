/* ============================================================================
   MyShelfie mobil teması — web'deki globals.css (--sf-*) ile aynı palet.
   Koyu cam görünüm: kitaplık fotoğrafı arka planda, içerik kartları nötr
   siyah tonlu cam. Ana iki renk: sarı #FFC703 ve yeşil #0a5b6f.
   ========================================================================== */

export const colors = {
  green900: "#05242d",
  green800: "#062f3a",
  green600: "#0a5b6f",
  green500: "#0d7288",
  green400: "#158fa8",

  yellow500: "#e6b303",
  yellow400: "#ffc703",
  yellow200: "#ffe08a",

  mint: "#b8d8cf",
  mintStrong: "#8fc4b6",

  success: "#7fd1b0",
  danger: "#ff8f8f",
  dangerStrong: "#a81f1f",

  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.6)",
  textFaint: "rgba(255, 255, 255, 0.42)",
  textOnAccent: "#17282d",

  /** Cam yüzeyler — BlurView'in üstüne serilen nötr siyah ton. */
  glass: "rgba(10, 8, 6, 0.55)",
  glassStrong: "rgba(10, 8, 6, 0.78)",
  glassModal: "rgba(12, 12, 13, 0.94)",

  control: "rgba(255, 255, 255, 0.08)",
  controlPressed: "rgba(255, 255, 255, 0.16)",
  controlBorder: "rgba(255, 255, 255, 0.16)",

  edge: "rgba(255, 255, 255, 0.1)",
  line: "rgba(255, 255, 255, 0.12)",
  lineStrong: "rgba(255, 255, 255, 0.24)",

  /** Alıntı yaprağı (çizgili defter) — yalnızca alıntılarda. */
  paper: "#f6f1e4",
  paperLine: "rgba(10, 91, 111, 0.16)",
  paperMargin: "rgba(220, 90, 90, 0.35)",
  paperInk: "#2a2620",

  background: "#0b0a09",
} as const;

export const fonts = {
  serif: "Fraunces_600SemiBold",
  serifRegular: "Fraunces_400Regular",
  serifItalic: "Fraunces_400Regular_Italic",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Durumun rozet renkleri (web › BOOK_STATUS_TONE ile aynı eşleme). */
export const statusTone = {
  completed: { fg: colors.success, bg: "rgba(127, 209, 176, 0.16)" },
  inProgress: { fg: colors.yellow400, bg: "rgba(255, 199, 3, 0.16)" },
  wantToRead: { fg: colors.mint, bg: "rgba(255, 255, 255, 0.1)" },
} as const;

/** Saydam sekme çubuğunun altında içerik kalmasın diye liste sonuna eklenen boşluk. */
export const TAB_BAR_SPACE = 84;
