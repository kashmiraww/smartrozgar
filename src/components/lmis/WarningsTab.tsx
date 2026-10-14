import { ArrowUpRight, TriangleAlert, Waves } from "lucide-react";
import type { ReactNode } from "react";
import type { SectorId } from "@/data/lmis";
import { MODEL } from "@/data/lmis";
import { useI18n } from "@/lib/i18n";
import { tradeWarnings, warnings, type Scope, type TradeWarning } from "@/lib/model";

const TOP_N = 8;

function WarningCard({
  title,
  count,
  tone,
  icon,
  children,
}: {
  title: string;
  count: number;
  tone: "shortage" | "saturation";
  icon: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const border =
    tone === "shortage" ? "border-sev-acute/25" : "border-sev-saturation/25";
  const head =
    tone === "shortage" ? "text-sev-acute" : "text-sev-saturation";
  const bg = tone === "shortage" ? "bg-sev-acute/10" : "bg-sev-saturation/10";
  return (
    <div className={`card-soft border ${border} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex size-7 items-center justify-center rounded-lg ${bg} ${head}`}>
            {icon}
          </span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className={`text-xs font-semibold tabular-nums ${head}`}>{count}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {count > 0 ? t("warn.showing", { n: Math.min(TOP_N, count) }) : t("warn.none")}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function WarningsTab({
  sector,
  onSelect,
}: {
  sector: SectorId | "all";
  onSelect: (scope: Scope) => void;
}) {
  const { t, loc, pct } = useI18n();
  const geo = warnings(sector);
  const trades = tradeWarnings(sector);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{t("warn.title")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("warn.sub", { cycle: MODEL.cycle })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WarningCard
          title={t("warn.geoShort")}
          count={geo.shortage.length}
          tone="shortage"
          icon={<TriangleAlert className="size-4" />}
        >
          <ul className="divide-y hairline">
            {geo.shortage.slice(0, TOP_N).map(({ row, scope }) => {
              const label =
                scope.level === "district"
                  ? `${loc(row.districtName ?? "", row.districtName ?? "")} · ${loc(row.stateName, row.stateNameHi)}`
                  : loc(row.stateName, row.stateNameHi);
              return (
                <li key={`${row.stateSlug}:${row.districtSlug ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(scope)}
                    className="group flex w-full items-center justify-between gap-3 py-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{label}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {row.sector === "all" ? t("sector.allShort") : row.sectorName}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-sev-acute">
                        {pct(row.gapPct)}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </WarningCard>

        <WarningCard
          title={t("warn.geoSat")}
          count={geo.saturation.length}
          tone="saturation"
          icon={<Waves className="size-4" />}
        >
          <ul className="divide-y hairline">
            {geo.saturation.slice(0, TOP_N).map(({ row, scope }) => {
              const label =
                scope.level === "district"
                  ? `${loc(row.districtName ?? "", row.districtName ?? "")} · ${loc(row.stateName, row.stateNameHi)}`
                  : loc(row.stateName, row.stateNameHi);
              return (
                <li key={`${row.stateSlug}:${row.districtSlug ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(scope)}
                    className="group flex w-full items-center justify-between gap-3 py-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{label}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {row.sector === "all" ? t("sector.allShort") : row.sectorName}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-sev-saturation">
                        {pct(row.gapPct)}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </WarningCard>

        <WarningCard
          title={t("warn.tradeShort")}
          count={trades.shortage.length}
          tone="shortage"
          icon={<TriangleAlert className="size-4" />}
        >
          <ul className="divide-y hairline">
            {trades.shortage.slice(0, TOP_N).map((w) => (
              <TradeItem key={`${w.stateSlug}-${w.row.tradeId}`} w={w} />
            ))}
          </ul>
        </WarningCard>

        <WarningCard
          title={t("warn.tradeSat")}
          count={trades.saturation.length}
          tone="saturation"
          icon={<Waves className="size-4" />}
        >
          <ul className="divide-y hairline">
            {trades.saturation.slice(0, TOP_N).map((w) => (
              <TradeItem key={`${w.stateSlug}-${w.row.tradeId}`} w={w} />
            ))}
          </ul>
        </WarningCard>
      </div>
    </div>
  );
}

function TradeItem({ w }: { w: TradeWarning }) {
  const { loc, pct } = useI18n();
  const tone = w.row.flag === "shortage" ? "text-sev-acute" : "text-sev-saturation";
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">
          {loc(w.row.name, w.row.nameHi)}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {loc(w.stateName, w.stateNameHi)} · {w.row.sectorName} · NSQF {w.row.nsqf}
        </span>
      </span>
      <span className={`shrink-0 text-xs font-semibold tabular-nums ${tone}`}>
        {pct(w.row.gapPct)}
      </span>
    </li>
  );
}
