import { useMemo, useRef, useState, useCallback } from "react";
import { MAP_HEIGHT, MAP_VIEWBOX, STATE_PATHS, STATE_VIEW } from "@/data/indiaMap";
import { DISTRICT_PATHS } from "@/data/indiaDistricts";
import { type SectorId } from "@/data/lmis";
import { useI18n } from "@/lib/i18n";
import { districtRow, SECTOR_BY_ID, stateRow, type ForecastRow, type Scope } from "@/lib/model";
import { SEVERITY_META } from "@/lib/severity";
import { SeverityBadge } from "@/components/lmis/bits";

interface Props {
  scope: Scope;
  sector: SectorId | "all";
  onSelect: (next: Scope) => void;
}

interface HoverState {
  row: ForecastRow;
  name: string;
  x: number;
  y: number;
  width: number;
}

/** Pilot states — rendered with a marker dot on the national view. */
const STATES_PILOT = [
  "uttar-pradesh",
  "maharashtra",
  "karnataka",
  "tamil-nadu",
  "gujarat",
  "bihar",
];

/** States big enough on the national view to carry a text label. */
function labelableStates(): string[] {
  return Object.keys(STATE_VIEW).filter((slug) => {
    const [, , w, h] = STATE_VIEW[slug].bounds;
    return w >= 95 && h >= 75;
  });
}

export function IndiaMap({ scope, sector, onSelect }: Props) {
  const { t, loc, fmt, lakh } = useI18n();
  const [hover, setHover] = useState<HoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stateSlug = scope.level === "national" ? null : (scope.stateSlug ?? null);
  const districtSlug = scope.level === "district" ? scope.districtSlug : null;

  const districts = useMemo(() => (stateSlug ? (DISTRICT_PATHS[stateSlug] ?? []) : []), [stateSlug]);
  const stateMeta = stateSlug ? (STATE_VIEW[stateSlug] ?? null) : null;

  const startHover = useCallback(
    (e: React.MouseEvent, row: ForecastRow, name: string) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover({
        row,
        name,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: rect.width,
      });
    },
    [],
  );

  const moveHover = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            width: rect.width,
          }
        : prev,
    );
  }, []);

  const clearHover = useCallback(() => setHover(null), []);

  const handleKey = (next: Scope) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(next);
    }
  };

  const national = scope.level === "national";
  const labelledStates = useMemo(() => labelableStates(), []);

  const sectorName = sector === "all" ? t("sector.all") : SECTOR_BY_ID[sector].name;

  const viewBox = national
    ? MAP_VIEWBOX
    : stateMeta
      ? `${stateMeta.bounds[0]} ${stateMeta.bounds[1]} ${stateMeta.bounds[2]} ${stateMeta.bounds[3]}`
      : MAP_VIEWBOX;

  // Font sizes in user units, derived from rendered height (~400px for a
  // 52vh map): font = viewBoxHeight × (11px / 400px) lands ~10–11px labels.
  const nationalFont = MAP_HEIGHT / 36;
  const stateFont = stateMeta ? Math.max(stateMeta.bounds[3], 40) / 36 : 5;
  const showDistrictLabels =
    !!stateMeta && districts.length <= 30 && stateMeta.bounds[2] >= 45;

  const tooltipLeft = hover
    ? Math.min(Math.max(hover.x, 78), Math.max(hover.width - 78, 78))
    : 0;
  const tooltipBelow = (hover?.y ?? 0) < 120;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="card-soft relative overflow-hidden p-2 sm:p-3"
        onMouseMove={hover ? moveHover : undefined}
        onMouseLeave={clearHover}
      >
        <svg
          viewBox={viewBox}
          className={
            national
              ? "h-[60vh] max-h-[660px] min-h-[400px] w-full"
              : "h-[52vh] max-h-[560px] min-h-[340px] w-full sm:h-[56vh]"
          }
          role="img"
          aria-label={`India skill demand–supply map — ${sectorName}`}
        >
          {national ? (
            <g>
              {Object.keys(STATE_PATHS).map((slug) => {
                const row = stateRow(slug, sector);
                const meta = SEVERITY_META[row.severity];
                const name = loc(row.stateName, row.stateNameHi);
                return (
                  <path
                    key={slug}
                    d={STATE_PATHS[slug]}
                    className={`${meta.fill} cursor-pointer stroke-[var(--card)] transition-[stroke] duration-150 hover:stroke-[oklch(0.45_0.085_192)] focus-visible:stroke-ring`}
                    strokeWidth={1}
                    tabIndex={0}
                    role="button"
                    aria-label={`${name} — ${t(meta.labelKey)} ${row.gapPct}%`}
                    onClick={() => onSelect({ level: "state", stateSlug: slug })}
                    onKeyDown={handleKey({ level: "state", stateSlug: slug })}
                    onMouseEnter={(e) => startHover(e, row, name)}
                    onBlur={clearHover}
                  />
                );
              })}
              {labelledStates.map((slug) => {
                const row = stateRow(slug, sector);
                const [cx, cy] = STATE_VIEW[slug].centroid;
                return (
                  <text
                    key={`lbl-${slug}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={nationalFont}
                    fontWeight={500}
                    pointerEvents="none"
                    paintOrder="stroke"
                    stroke="var(--card)"
                    strokeWidth={3.5}
                    className="fill-[oklch(0.3_0.02_255)]"
                  >
                    {loc(row.stateName, row.stateNameHi).split(" ")[0]}
                  </text>
                );
              })}
              {STATES_PILOT.map((slug) => {
                const view = STATE_VIEW[slug];
                if (!view) return null;
                const [cx, cy] = view.centroid;
                return (
                  <circle
                    key={`pilot-${slug}`}
                    cx={cx}
                    cy={cy + view.bounds[2] * 0.12}
                    r={9}
                    className="fill-[oklch(0.45_0.085_192)]"
                    stroke="var(--card)"
                    strokeWidth={3}
                    pointerEvents="none"
                  />
                );
              })}
            </g>
          ) : (
            <g>
              {districts.map((d) => {
                const row = districtRow(stateSlug!, d.slug, sector);
                const meta = SEVERITY_META[row.severity];
                const isSelected = districtSlug === d.slug;
                const name = loc(row.districtName ?? d.name, d.name);
                return (
                  <path
                    key={d.code}
                    d={d.d}
                    className={`${meta.fill} cursor-pointer stroke-[var(--card)] transition-[stroke] duration-150 hover:stroke-[oklch(0.45_0.085_192)] focus-visible:stroke-ring`}
                    strokeWidth={isSelected ? 2.4 : 0.7}
                    tabIndex={0}
                    role="button"
                    aria-label={`${name} — ${t(meta.labelKey)} ${row.gapPct}%`}
                    onClick={() =>
                      onSelect({ level: "district", stateSlug: stateSlug!, districtSlug: d.slug })
                    }
                    onKeyDown={handleKey({
                      level: "district",
                      stateSlug: stateSlug!,
                      districtSlug: d.slug,
                    })}
                    onMouseEnter={(e) => startHover(e, row, name)}
                    onBlur={clearHover}
                  />
                );
              })}
              {showDistrictLabels &&
                districts.map((d) => {
                  const isSelected = districtSlug === d.slug;
                  return (
                    <text
                      key={`lbl-${d.code}`}
                      x={d.cx}
                      y={d.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={stateFont}
                      fontWeight={isSelected ? 600 : 500}
                      pointerEvents="none"
                      paintOrder="stroke"
                      stroke="var(--card)"
                      strokeWidth={2.5}
                      className={isSelected ? "fill-primary" : "fill-[oklch(0.35_0.02_255)]"}
                    >
                      {d.name}
                    </text>
                  );
                })}
            </g>
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-20 w-56 -translate-x-1/2 rounded-xl border hairline bg-popover p-3 shadow-xl"
            style={{
              left: tooltipLeft,
              top: hover.y,
              transform: tooltipBelow
                ? "translate(-50%, 18px)"
                : "translate(-50%, calc(-100% - 16px))",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-tight font-semibold">{hover.name}</p>
              <SeverityBadge severity={hover.row.severity} />
            </div>
            <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>{t("panel.gap")}</dt>
                <dd className="font-semibold text-foreground">
                  {hover.row.gapPct > 0 ? "+" : ""}
                  {hover.row.gapPct}%
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{t("panel.projected")}</dt>
                <dd className="text-foreground">{lakh(hover.row.demand)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{t("panel.supply")}</dt>
                <dd className="text-foreground">{lakh(hover.row.supply)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{t("panel.recommended")}</dt>
                <dd className="font-medium text-primary">{fmt(hover.row.recommended)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          {national ? t("map.hint") : t("map.hintDistrict")}
        </p>
        <p className="text-[11px] text-muted-foreground/70">{t("map.boundaries")}</p>
      </div>
    </div>
  );
}
