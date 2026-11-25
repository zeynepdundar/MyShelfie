import Svg, { Circle, G, Path, Rect } from "react-native-svg";

/**
 * Alt menü ikonları — web › components/icons/nav-icons.tsx ile aynı çizimler:
 * gravür / eski kitap baskısı havasında, fildişi yüzeyler ve sepya detaylar.
 * Renkler sabit; seçili olmayan sekmenin ikonu soluk gösterilir.
 */

const IVORY = "#ece2c8";
const PARCHMENT = "#d9c9a3";
const EDGE = "#b8a47a";
const SEPIA = "#5b4a32";

type TabIconProps = {
  focused: boolean;
  size?: number;
};

const opacityOf = (focused: boolean) => (focused ? 1 : 0.6);

/** Kütüphane: rafta dik duran üç kitap ve yanlarına yaslanmış bir kitap. */
export function LibraryTabIcon({ focused, size = 26 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={opacityOf(focused)}>
      <G stroke={EDGE} strokeWidth={0.7} strokeLinejoin="round">
        <Rect x={3.4} y={5.2} width={3.3} height={14.3} rx={0.4} fill={IVORY} />
        <Rect x={6.9} y={4.2} width={3.1} height={15.3} rx={0.4} fill={PARCHMENT} />
        <Rect x={10.2} y={6.4} width={2.9} height={13.1} rx={0.4} fill={IVORY} />
        <Path d="M13.6 19.5l3.5-12.6 2.9.8-3.4 12.6z" fill={PARCHMENT} />
      </G>
      <G stroke={SEPIA} strokeWidth={0.45} strokeLinecap="round">
        <Path d="M3.4 7.1h3.3M3.4 7.9h3.3M3.4 17h3.3M3.4 17.8h3.3" />
        <Path d="M6.9 6.2h3.1M6.9 7h3.1M6.9 17.1h3.1M6.9 17.9h3.1" />
        <Path d="M10.2 8.3h2.9M10.2 9.1h2.9M10.2 17.2h2.9M10.2 18h2.9" />
        <Path d="M16.6 8.9l2.9.8M16.4 9.7l2.9.8M14.4 16.4l2.9.8M14.2 17.2l2.9.8" />
        <Path d="M5 10v5M8.45 9.5v5.6M11.65 11v4.5" strokeOpacity={0.45} />
      </G>
      <Path d="M2.6 19.8h18.4" stroke={IVORY} strokeWidth={0.9} strokeLinecap="round" />
    </Svg>
  );
}

/** Hazinem: yıldızlı kitap ayracı. */
export function TreasuresTabIcon({ focused, size = 26 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={opacityOf(focused)}>
      <Path
        d="M7.2 3.4h9.6v17.2l-4.8-3.5-4.8 3.5z"
        fill={IVORY}
        stroke={EDGE}
        strokeWidth={0.7}
        strokeLinejoin="round"
      />
      <Path d="M7.2 3.4h9.6v2.2H7.2z" fill={PARCHMENT} stroke={EDGE} strokeWidth={0.5} />
      <G stroke={SEPIA} strokeWidth={0.4} strokeLinecap="round">
        <Path d="M8.5 6.6v11.6M15.5 6.6v11.6" strokeOpacity={0.5} />
        <Path d="M7.2 5.6h9.6" strokeOpacity={0.4} />
      </G>
      <Path
        d="M12 8.6l1 2.05 2.25.33-1.63 1.59.38 2.24L12 13.75l-2 1.06.38-2.24-1.63-1.59 2.25-.33z"
        fill={SEPIA}
      />
    </Svg>
  );
}

/** Hesap: oval çerçeveli bir okur portresi (madalyon). */
export function AccountTabIcon({ focused, size = 26 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={opacityOf(focused)}>
      {/* Çerçeve */}
      <Path
        d="M12 2.8c4.2 0 7 3.9 7 9.2s-2.8 9.2-7 9.2-7-3.9-7-9.2 2.8-9.2 7-9.2z"
        fill={PARCHMENT}
        stroke={EDGE}
        strokeWidth={0.7}
      />
      <Path
        d="M12 4.4c3.2 0 5.4 3.2 5.4 7.6s-2.2 7.6-5.4 7.6-5.4-3.2-5.4-7.6 2.2-7.6 5.4-7.6z"
        fill={IVORY}
        stroke={SEPIA}
        strokeWidth={0.4}
        strokeOpacity={0.5}
      />
      {/* Büst */}
      <Circle cx={12} cy={10.2} r={2.3} fill={SEPIA} />
      <Path d="M7.7 17.4c.7-2.6 2.3-3.9 4.3-3.9s3.6 1.3 4.3 3.9c-1.1 1.4-2.6 2.2-4.3 2.2s-3.2-.8-4.3-2.2z" fill={SEPIA} />
    </Svg>
  );
}
