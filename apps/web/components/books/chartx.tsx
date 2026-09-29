"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { useSelector } from "react-redux"
import { useLocale, useTranslations } from "next-intl"

import { RootState } from "@/lib/store"
import type { Book } from "@shelfie/types"
import { ChartContainer } from "@/components/ui/chart"
import { isBookFinished } from "@/lib/bookStatus"

/* Grafik renkleri temadan gelir; yüzey açık/koyu olduğunda kendiliğinden uyar. */
const BOOKS_COLOR = "var(--chart-1)"
const PAGES_COLOR = "#2DB872"
const CHART_TICK = "var(--sf-chart-tick)"
const CHART_GRID = "var(--sf-chart-grid)"

/** Üzerine gelinmeyen aylar soluklaşsın, aktif olan öne çıksın. */
const DIMMED = 0.35

function getBookDate(book: Book) {
  const rawDate = book.endDate || book.dateRead || book.dateAdded
  const parsedDate = new Date(rawDate)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function MyChart({ year }: { year: number }) {
  const { books } = useSelector((state: RootState) => state.books)
  const t = useTranslations("stats.chart")
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" })

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthlyBooks = books.filter((book) => {
        if (!isBookFinished(book)) {
          return false
        }

        const bookDate = getBookDate(book)

        return (
          bookDate !== null &&
          bookDate.getFullYear() === year &&
          bookDate.getMonth() === monthIndex
        )
      })

      return {
        name: monthFormatter.format(new Date(year, monthIndex, 1)),
        books: monthlyBooks.length,
        pages: monthlyBooks.reduce((sum, book) => sum + (book.pages || 0), 0),
        titles: monthlyBooks.map((book) => book.title),
      }
    })
  }, [books, year, locale])

  const chartConfig = {
    books: { label: t("booksSeries"), color: BOOKS_COLOR },
    pages: { label: t("pagesSeries"), color: PAGES_COLOR },
  }

  const isEmpty = chartData.every((month) => month.books === 0)
  const active = activeIndex === null ? null : chartData[activeIndex]
  const numberFormat = (value: number) => value.toLocaleString(locale)
  const opacityFor = (index: number) =>
    activeIndex === null || activeIndex === index ? 1 : DIMMED

  return (
    <div>
      {/* Eksen anahtarı: hangi eksenin neyi gösterdiği grafiğin hemen üstünde,
          ilgili kenara hizalı ve serinin rengiyle. */}
      <div className="mb-3 flex items-start justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: BOOKS_COLOR }}
          />
          <span className="font-medium text-foreground">{t("booksSeries")}</span>
          <span className="text-muted-foreground">· {t("leftAxis")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("rightAxis")} ·</span>
          <span className="font-medium text-foreground">{t("pagesSeries")}</span>
          <span aria-hidden className="relative flex h-3 w-5 items-center">
            <span
              className="h-0.5 w-full rounded-full"
              style={{ backgroundColor: PAGES_COLOR }}
            />
            <span
              className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: PAGES_COLOR }}
            />
          </span>
        </div>
      </div>

      <div className="relative">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state: { activeTooltipIndex?: number }) => {
              const next = state?.activeTooltipIndex
              setActiveIndex(typeof next === "number" ? next : null)
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: CHART_TICK, fontSize: 12 }}
            />
            {/* Sol eksen: kitap adedi — yalnızca tam sayılar. */}
            <YAxis
              yAxisId="books"
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
              width={32}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: BOOKS_COLOR, fontSize: 12 }}
            />
            {/* Sağ eksen: sayfa sayısı. */}
            <YAxis
              yAxisId="pages"
              orientation="right"
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax, 100)]}
              width={48}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={numberFormat}
              tick={{ fill: PAGES_COLOR, fontSize: 12 }}
            />
            <Bar
              dataKey="books"
              yAxisId="books"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`books-${entry.name}`}
                  fill={BOOKS_COLOR}
                  fillOpacity={opacityFor(index)}
                />
              ))}
            </Bar>
            <Line
              dataKey="pages"
              yAxisId="pages"
              type="monotone"
              stroke={PAGES_COLOR}
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={(props: { cx?: number; cy?: number; index?: number }) => (
                <circle
                  key={`pages-dot-${props.index}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={activeIndex === props.index ? 5.5 : 3.5}
                  fill={PAGES_COLOR}
                  stroke="var(--background)"
                  strokeWidth={2}
                  opacity={opacityFor(props.index ?? 0)}
                />
              )}
              activeDot={false}
            />
          </ComposedChart>
        </ChartContainer>

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-full bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
              {t("emptyYear", { year })}
            </p>
          </div>
        )}
      </div>

      {/* Hover detay şeridi — sadece bir aya gelindiğinde görünür.
          Dış kapsayıcı yüksekliği ayırdığı için grafik zıplamaz. */}
      <div className="mt-3 min-h-[3.25rem]">
        {active ? (
          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-8">
            <div>
              <p className="text-xs text-white/45">
                {active.name} {year}
              </p>
              <p
                className="mt-0.5 text-sm font-medium"
                style={{ color: BOOKS_COLOR }}
              >
                {t("monthBooks", { count: active.books })}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/45">{t("totalPages")}</p>
              <p
                className="mt-0.5 text-sm font-medium"
                style={{ color: PAGES_COLOR }}
              >
                {numberFormat(active.pages)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs text-white/45">{t("booksThatMonth")}</p>
              <p className="mt-0.5 truncate text-sm text-white/80">
                {active.titles.length > 0 ? active.titles.join(", ") : t("none")}
              </p>
            </div>
          </div>
        ) : (
          !isEmpty && (
            <p className="border-t border-white/10 pt-3 text-xs text-white/45">
              {t("hoverHint")}
            </p>
          )
        )}
      </div>
    </div>
  )
}
