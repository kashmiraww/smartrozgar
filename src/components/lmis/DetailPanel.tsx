import { ChevronRight } from "lucide-react";
import { SECTORS, type SectorId } from "@/data/lmis";
import { useI18n, type StringKey } from "@/lib/i18n";
import {
  districtRow,
  nationalRow,
  rankRows,
  scopeRow,
  scopeRows,
  stateRow,
  tradeRows,
  type ForecastRow,
  type Scope,
} from "@/lib/model";
import { SEVERITY_META } from "@/lib/severity";
import { FlagPill, SeverityBadge, TrendChip } from "@/components/lmis/bits";

const LEVEL_KEY: Record<Scope["level"], StringKey> = {
  national: "level.india",
  state: "level.state",
  district: "level.district",
};

function GapBar({ value, severity }: { value: number; severity: ForecastRow["severity"] }) {
  const v = Math.max(-100, Math.min(100, value));
  const width = (Math.abs(v) / 100) * 50;
  const color =
    v >= 0 ? SEVERITY_META[severity].fill.replace("fill-", "bg-") : "bg-[oklch(0.5_0.125_255)]";
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
      <div
        className={`absolute inset-y-0 rounded-full ${color}`}
        style={
          v >= 0
            ? { left: "50%", width: `${width}%` }
            : { right: "50%", width: `${width}%` }
        }
      />
    </div>
  );
}

function rowFor(scope: Scope, sector: SectorId | "all"): ForecastRow {
  if (scope.level === "national") return nationalRow(sector);
  if (scope.level === "state" && scope.stateSlug) return stateRow(scope.stateSlug, sector);
  if (scope.stateSlug && scope.districtSlug)
    return districtRow(scope.stateSlug, scope.districtSlug, sector);
  return nationalRow(sector);
}

export function DetailPanel({
  scope,
  sector,
  onSelect,
}: {
  scope: Scope;
  sector: SectorId | "all";
  onSelect: (next: Scope) => void;
}) {
  const { t, loc, fmt, lakh, pct } = useI18n();
  const row = scopeRow(scope, sector);
  const isPilotState =
    scope.level === "state" &&
    scope.stateSlug &&
    PILOT_STATES.includes(scope.stateSlug);

  const title =
    scope.level === "national"
      ? t("level.india")
      : scope.level === "state"
        ? loc(row.stateName, row.stateNameHi)
        : loc(row.districtName ?? "", row.districtName ?? "");

  const siblings = rankRows(scopeRows(scope, sector)).filter(
    (r) => r.stateSlug !== row.stateSlug || r.districtSlug !== row.districtSlug,
  );

  const trades = tradeRows(scope, sector).slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="card-soft p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-secondary-foreground uppercase">
            {t(LEVEL_KEY[scope.level])}
          </span>
          {isPilotState && (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              {t("map.pilot")}
            </span>
          )}
          <FlagPill flag={row.flag} />
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <SeverityBadge severity={row.severity} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.di")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">{row.demandIndex}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.projected")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">{lakh(row.demand)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.supply")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">{lakh(row.supply)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.gap")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">{pct(row.gapPct)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.recommended")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold text-primary">
              {fmt(row.recommended)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("panel.delta")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold">{pct(row.deltaPct)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center justify-between border-t hairline pt-3">
          <span className="text-xs text-muted-foreground">{t("panel.trend")}</span>
          <TrendChip trend={row.trend} />
        </div>
      </div>

      {/* Sector split */}
      <div className="card-soft p-4">
        <h3 className="text-sm font-semibold">{t("panel.sectorMix")}</h3>
        <ul className="mt-3 space-y-3">
          {SECTORS.map((sec) => {
            const sRow = rowFor(scope, sec.id);
            return (
              <li key={sec.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-xs font-medium">
                    {loc(sec.name, sec.nameHi)}
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums">
                    {pct(sRow.gapPct)}
                  </span>
                </div>
                <div className="mt-1">
                  <GapBar value={sRow.gapPct} severity={sRow.severity} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Trades */}
      <div className="card-soft p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("panel.trades")}</h3>
          <span className="text-[11px] text-muted-foreground">
            {t("warn.showing", { n: trades.length })}
          </span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b hairline text-left text-muted-foreground">
                <th className="pb-1.5 font-medium">{t("th.trade")}</th>
                <th className="pb-1.5 font-medium">{t("th.qp")}</th>
                <th className="pb-1.5 text-right font-medium">{t("th.gap")}</th>
                <th className="pb-1.5 text-right font-medium">{t("th.severity")}</th>
                <th className="pb-1.5 text-right font-medium">{t("th.target")}</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((tr) => (
                <tr key={tr.tradeId} className="border-b hairline last:border-0">
                  <td className="py-2 pr-2">
                    <span className="font-medium">{loc(tr.name, tr.nameHi)}</span>
                    <span className="ml-1.5 text-muted-foreground">NSQF {tr.nsqf}</span>
                  </td>
                  <td className="py-2 pr-2 font-mono text-[11px] text-muted-foreground">
                    {tr.qp ?? "—"}
                  </td>
                  <td className="py-2 pr-2 text-right font-semibold tabular-nums">
                    {pct(tr.gapPct)}
                  </td>
                  <td className="py-2 pr-2 text-right">
                    <SeverityBadge severity={tr.severity} />
                  </td>
                  <td className="py-2 text-right font-semibold tabular-nums text-primary">
                    {fmt(tr.recommended)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranked siblings */}
      <div className="card-soft p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">{t("panel.rankTitle")}</h3>
            <p className="text-[11px] text-muted-foreground">{t("panel.rankSub")}</p>
          </div>
        </div>
        <ul className="mt-3 divide-y hairline">
          {siblings.slice(0, 10).map((r) => {
            const next: Scope =
              scope.level === "national"
                ? { level: "state", stateSlug: r.stateSlug }
                : { level: "district", stateSlug: r.stateSlug, districtSlug: r.districtSlug! };
            const label =
              scope.level === "national"
                ? loc(r.stateName, r.stateNameHi)
                : loc(r.districtName ?? "", r.districtName ?? "");
            return (
              <li key={`${r.stateSlug}:${r.districtSlug ?? ""}`}>
                <button
                  type="button"
                  onClick={() => onSelect(next)}
                  className="flex w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:bg-secondary/60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <SeverityBadge severity={r.severity} />
                    <span className="truncate text-xs font-medium">{label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
                    <span className="font-semibold">{pct(r.gapPct)}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const PILOT_STATES = [
  "uttar-pradesh",
  "maharashtra",
  "karnataka",
  "tamil-nadu",
  "gujarat",
  "bihar",
];
