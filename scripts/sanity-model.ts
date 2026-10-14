// Dev-only sanity check for src/lib/model.ts — run: bun run scripts/sanity-model.ts
import {
  kpis,
  nationalRow,
  districtRows,
  stateRows,
  tradeRows,
  warnings,
} from "../src/lib/model";
import { SECTORS } from "../src/data/lmis";

const nat = nationalRow("all");
console.log("NATIONAL (all sectors):", {
  demand: nat.demand,
  supply: nat.supply,
  gapPct: nat.gapPct,
  di: nat.demandIndex,
  recommended: nat.recommended,
  deltaPct: nat.deltaPct,
  trend: nat.trend,
});

for (const s of SECTORS) {
  const r = nationalRow(s.id);
  console.log(
    `  ${s.id.padEnd(13)} demand=${String(r.demand).padStart(8)} supply=${String(r.supply).padStart(7)} gap=${r.gapPct}% sev=${r.severity} rec=${r.recommended}`,
  );
}

const states = stateRows("all");
const sevCount: Record<string, number> = {};
for (const r of states) sevCount[r.severity] = (sevCount[r.severity] ?? 0) + 1;
console.log("STATE severity spread:", sevCount);
const sorted = [...states].sort((a, b) => a.gapPct - b.gapPct);
console.log(
  "  most saturated:",
  sorted.slice(0, 4).map((r) => `${r.stateName} ${r.gapPct}%`),
);
console.log(
  "  most short:",
  sorted.slice(-4).reverse().map((r) => `${r.stateName} ${r.gapPct}%`),
);

const dRows = districtRows("karnataka", "all");
console.log("KARNATAKA districts:", dRows.length, "gap range:",
  Math.min(...dRows.map((r) => r.gapPct)), "→", Math.max(...dRows.map((r) => r.gapPct)));

const k = kpis("all");
console.log("KPIs:", k);

const w = warnings("all");
console.log("warnings: shortage geo", w.shortage.length, "saturation geo", w.saturation.length,
  "| trades short", w.tradeShortage.length, "sat", w.tradeSaturation.length);
console.log("top shortage trades:", w.tradeShortage.slice(0, 3).map((t) => `${t.name} ${t.gapPct}%`));
console.log("top saturated trades:", w.tradeSaturation.slice(0, 3).map((t) => `${t.name} ${t.gapPct}%`));

const trades = tradeRows({ level: "state", stateSlug: "bihar" }, "all");
console.log("BIHAR trade rows:", trades.length, trades.slice(0, 3).map((t) => `${t.name}:${t.gapPct}%`));
