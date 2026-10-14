/**
 * Export / API layer for v1.
 *
 * The same payload shape backs both the downloadable files and the documented
 * `GET /api/v1/forecast` contract shown in the Methodology tab, so planners
 * can wire forecasts into scheme target-setting workflows directly.
 */

import { MODEL, NATIONAL_REFS, SECTORS, SOURCES, type SectorId } from "@/data/lmis";
import {
  districtRows,
  kpis,
  nationalRow,
  scopeRow,
  stateRows,
  tradeRows,
  type ForecastRow,
  type Level,
} from "@/lib/model";

export interface ForecastMeta {
  product: string;
  version: string;
  cycle: string;
  modelRun: string;
  generatedAt: string;
  level: "state" | "district";
  sector: SectorId | "all";
  sources: string[];
  ncoCrosswalk: { status: string; reference: string };
  units: { demand: string; supply: string; seats: string; gap: string };
}

export interface ForecastPayload {
  meta: ForecastMeta;
  summary: Record<string, number>;
  rows: Record<string, number | string | null>[];
  trades: Record<string, number | string | null>[];
}

function rowObject(r: ForecastRow, sectorLabel: string): Record<string, number | string | null> {
  return {
    level: r.level,
    state_code: r.stateCode,
    state: r.stateName,
    district_code: r.districtCode ?? null,
    district: r.districtName ?? null,
    region: r.region,
    sector: sectorLabel,
    demand_index: r.demandIndex,
    projected_demand: r.demand,
    current_supply: r.supply,
    gap: r.gap,
    gap_pct: r.gapPct,
    severity: r.severity,
    recommended_seats: r.recommended,
    delta_pct: r.deltaPct,
    trend: r.trend,
    flag: r.flag,
  };
}

function sectorLabel(id: SectorId | "all"): string {
  if (id === "all") return "all-pilot-sectors";
  return id;
}

/** Full payload for the current filter — mirrors the documented API. */
export function buildPayload(level: "state" | "district", sector: SectorId | "all"): ForecastPayload {
  const rows: Record<string, number | string | null>[] =
    level === "state"
      ? stateRows(sector).map((r) => rowObject(r, sectorLabel(sector)))
      : districtRowsAll(sector).map((r) => rowObject(r, sectorLabel(sector)));

  const scope = level === "state" ? { level: "state" as Level } : { level: "national" as Level };
  const trades = tradeRows(scope, sector).map((t) => ({
    trade_id: t.tradeId,
    trade: t.name,
    sector: t.sector,
    qp: t.qp,
    nsqf: t.nsqf,
    projected_demand: t.demand,
    current_supply: t.supply,
    gap_pct: t.gapPct,
    severity: t.severity,
    recommended_seats: t.recommended,
    flag: t.flag,
  }));

  const k = kpis(sector);
  const nat = nationalRow(sector);

  return {
    meta: {
      product: "LMIS — Labour Market Intelligence System",
      version: "v1",
      cycle: MODEL.cycle,
      modelRun: MODEL.runDate,
      generatedAt: new Date().toISOString(),
      level,
      sector,
      sources: SOURCES.map((s) => s.url),
      ncoCrosswalk: {
        status: "indicative",
        reference: "NCVET — Mapping of Qualifications with NCO Codes",
      },
      units: {
        demand: "persons/year",
        supply: "certified candidates/year",
        seats: "seats/year",
        gap: "percent of projected demand",
      },
    },
    summary: {
      demand_index: nat.demandIndex,
      projected_demand: Math.round(nat.demand),
      current_supply: Math.round(nat.supply),
      gap_pct: nat.gapPct,
      recommended_seats: k.recommended,
      delta_pct: k.deltaPct,
      flagged_districts: k.flaggedDistricts,
      total_districts: k.totalDistricts,
      iti_count: NATIONAL_REFS.itiCount,
      iti_seat_capacity: NATIONAL_REFS.itiSeats,
    },
    rows,
    trades,
  };
}

function districtRowsAll(sector: SectorId | "all") {
  // Levels are per-state; flatten while keeping row shape intact.
  const out: ForecastRow[] = [];
  for (const r of stateRows(sector)) {
    out.push(...districtRows(r.stateSlug, sector));
  }
  return out;
}

const CSV_COLUMNS = [
  "level",
  "state_code",
  "state",
  "district_code",
  "district",
  "region",
  "sector",
  "demand_index",
  "projected_demand",
  "current_supply",
  "gap",
  "gap_pct",
  "severity",
  "recommended_seats",
  "delta_pct",
  "trend",
  "flag",
] as const;

function csvCell(value: number | string | null): string {
  if (value === null) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV (UTF-8 with BOM so Excel renders Devanagari correctly). */
export function buildCsv(level: "state" | "district", sector: SectorId | "all"): string {
  const payload = buildPayload(level, sector);
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of payload.rows) {
    lines.push(CSV_COLUMNS.map((c) => csvCell((row[c] as number | string | null) ?? null)).join(","));
  }
  return "\uFEFF" + lines.join("\n");
}

export function downloadFile(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const cycleSlug = () => MODEL.cycle.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "");

export function exportCsv(level: "state" | "district", sector: SectorId | "all"): void {
  downloadFile(
    `lmis-forecast-${level}-${cycleSlug()}.csv`,
    "text/csv;charset=utf-8",
    buildCsv(level, sector),
  );
}

export function exportJson(level: "state" | "district", sector: SectorId | "all"): void {
  downloadFile(
    `lmis-forecast-${level}-${cycleSlug()}.json`,
    "application/json",
    JSON.stringify(buildPayload(level, sector), null, 2),
  );
}

/** Compact example used by the Methodology/API tab. */
export function apiExample(): string {
  const row = scopeRow({ level: "state" }, "electronics");
  return JSON.stringify(
    {
      meta: {
        cycle: MODEL.cycle,
        level: "state",
        sector: "electronics",
        modelRun: MODEL.runDate,
      },
      summary: { gap_pct: nationalRow("electronics").gapPct },
      rows: [rowObject(row, "electronics")],
    },
    null,
    2,
  );
}

export const CSV_COLUMNS_EXPORT = CSV_COLUMNS;
export const SECTOR_EXPORT = SECTORS;
