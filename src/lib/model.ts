/**
 * LMIS forecasting engine (v1).
 *
 * Combines heterogeneous public signals into a single demand index, compares
 * it against training capacity, and forecasts the next cycle's seat targets
 * at national / state / district granularity.
 *
 *   Demand Index  DI = 0.50·vacancyIndex + 0.30·growthIndex + 0.20·wageIndex
 *   Demand        = workforce × skill-requiring posting rate × (0.75 + 0.5·DI/100)
 *   Supply        = annual seats × fill rate × sector seat mix
 *   Gap %         = (demand − supply) / demand × 100
 *   Target        = supply × (1 + 0.55 · gap%/100), clamped to [0.6×, 1.6×]
 *
 * District values are disaggregated from state aggregates with seeded,
 * deterministic weights (stable across reloads — no randomness at runtime).
 */

import {
  AFFINITY,
  DEFAULT_AFFINITY,
  METRO_BOOST,
  MODEL,
  NATIONAL_REFS,
  PILOT_SEAT_SHARE,
  SECTORS,
  STATES,
  TRADES,
  type Sector,
  type SectorId,
  type StateMeta,
} from "@/data/lmis";
import { DISTRICT_PATHS } from "@/data/indiaDistricts";

/* ------------------------------------------------------------------ types */

export type Severity =
  | "acute-shortage"
  | "shortage"
  | "balanced"
  | "oversupply"
  | "saturation";

export type Trend = "widening" | "narrowing" | "stable";

export type Level = "national" | "state" | "district";

export interface Scope {
  level: Level;
  stateSlug?: string;
  districtSlug?: string;
}

export interface ForecastRow {
  level: Level;
  stateSlug: string;
  stateName: string;
  stateNameHi: string;
  stateCode: string;
  region: StateMeta["region"] | "National";
  districtSlug?: string;
  districtName?: string;
  districtCode?: string;
  sector: SectorId | "all";
  sectorName: string;
  sectorNameHi: string;
  /** Composite demand index, 0–100. */
  demandIndex: number;
  /** Projected formal vacancies needing NSQF-level skills, per year. */
  demand: number;
  /** Certified candidates emerging from the training base per year. */
  supply: number;
  gap: number;
  gapPct: number;
  severity: Severity;
  /** Recommended seat allocation for the next cycle. */
  recommended: number;
  /** recommended vs current supply, %. */
  deltaPct: number;
  trend: Trend;
  flag: "shortage" | "saturation" | null;
  /** Ranking weight: severity × demand volume. */
  score: number;
}

export interface TradeRow {
  tradeId: string;
  name: string;
  nameHi: string;
  sector: SectorId;
  sectorName: string;
  sectorNameHi: string;
  qp: string | null;
  nsqf: number;
  demand: number;
  supply: number;
  gapPct: number;
  severity: Severity;
  recommended: number;
  deltaPct: number;
  flag: "shortage" | "saturation" | null;
  score: number;
}

/* -------------------------------------------------------- deterministic rng */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(key: string): number {
  let t = (hash(key) + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

/* --------------------------------------------------------------- selectors */

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s])) as Record<
  SectorId,
  Sector
>;
export const STATE_BY_SLUG = Object.fromEntries(STATES.map((s) => [s.slug, s]));

/* ------------------------------------------------------------ static terms */

function affinity(sector: SectorId, stateSlug: string): number {
  return AFFINITY[sector]?.[stateSlug] ?? DEFAULT_AFFINITY;
}

/** Σ workers × affinity per sector — keeps national totals preserved. */
const AFF_NORM: Record<SectorId, number> = (() => {
  const out = {} as Record<SectorId, number>;
  for (const sec of SECTORS) {
    let weighted = 0;
    let plain = 0;
    for (const st of STATES) {
      weighted += st.workers * affinity(sec.id, st.slug);
      plain += st.workers;
    }
    out[sec.id] = plain / weighted; // multiplier so shares sum back to total
  }
  return out;
})();

/** State seat pool: annual capacity × fill rate (certified candidates). */
function stateSeats(state: StateMeta): number {
  return state.itiCount * MODEL.seatsPerIti;
}

function pilotSeatPool(state: StateMeta): number {
  return stateSeats(state) * MODEL.fillRate * PILOT_SEAT_SHARE;
}

/** Supply-side sector mix: mostly national seat shares, mildly state-varied. */
function seatMix(state: StateMeta, sector: SectorId): number {
  const base = SECTOR_BY_ID[sector].seatShare;
  // Training capacity responds to industry clustering slowly (30% pass-
  // through) — most of the mix is inertial, which is what produces chronic
  // oversupply in states whose seat base was built for older demand.
  const inertia = 0.7 + 0.3 * affinity(sector, state.slug);
  const jitter = 0.9 + 0.2 * rand01(`${state.slug}:${sector}:mix`);
  return base * inertia * jitter;
}

const MIX_SUM: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const st of STATES) {
    out[st.slug] = SECTORS.reduce((sum, sec) => sum + seatMix(st, sec.id), 0);
  }
  return out;
})();

/* -------------------------------------------------------------- demand side */

/** Vacancy intensity (NCS posting signal), 0–100. */
function vacancyIndex(sector: Sector, state: StateMeta): number {
  const a = affinity(sector.id, state.slug);
  return clamp(sector.vacancyBase * (0.75 + 0.25 * a) * (0.9 + 0.2 * state.urban), 0, 100);
}

/** Employment growth momentum (PLFS sectoral trend), 0–100. */
function growthIndex(sector: Sector, state: StateMeta): number {
  const a = affinity(sector.id, state.slug);
  return clamp((sector.growth * (0.8 + 0.4 * a) * 100) / 18, 0, 100);
}

/** Real wage growth signal, 0–100. */
function wageIndex(sector: Sector, state: StateMeta): number {
  return clamp((sector.wageGrowth * (0.9 + 0.2 * state.urban) * 100) / 10, 0, 100);
}

export function demandIndex(sector: Sector, state: StateMeta): number {
  const { vacancy, growth, wage } = MODEL.weights;
  return (
    vacancy * vacancyIndex(sector, state) +
    growth * growthIndex(sector, state) +
    wage * wageIndex(sector, state)
  );
}

/** Projected annual formal vacancies for (state, sector). */
function stateDemand(state: StateMeta, sector: Sector): number {
  const di = demandIndex(sector, state);
  const workers = state.workers * 100_000; // lakh → persons
  const scaled = workers * sector.employmentShare * AFF_NORM[sector.id] * affinity(sector.id, state.slug);
  return scaled * sector.demandRate * (0.75 + 0.5 * (di / 100));
}

/** Certified candidates emerging for (state, sector) this year. */
function stateSupply(state: StateMeta, sector: Sector): number {
  const mixShare = seatMix(state, sector.id) / MIX_SUM[state.slug];
  return pilotSeatPool(state) * mixShare;
}

/* ------------------------------------------------------- district split */

interface DistrictEntry {
  slug: string;
  name: string;
  code: string;
}

function districtsOf(stateSlug: string): DistrictEntry[] {
  return (DISTRICT_PATHS[stateSlug] ?? []).map((d) => ({
    slug: d.slug,
    name: d.name,
    code: d.code,
  }));
}

function metroBoost(name: string): number {
  const n = name.toLowerCase();
  let boost = 1;
  for (const key of Object.keys(METRO_BOOST)) {
    if (n.includes(key)) boost = Math.max(boost, METRO_BOOST[key]);
  }
  return boost;
}

/** Deterministic per-district demand/supply weights, each summing to 1. */
const DIST_WEIGHTS: Record<string, { demand: number; supply: number }> = {};
for (const st of STATES) {
  const districts = districtsOf(st.slug);
  if (!districts.length) continue;
  const rawDemand: number[] = [];
  const rawSupply: number[] = [];
  for (const d of districts) {
    rawDemand.push((0.55 + 0.9 * rand01(`${d.code}:demand`)) * metroBoost(d.name));
    rawSupply.push(0.55 + 0.9 * rand01(`${d.code}:supply`));
  }
  const sumD = rawDemand.reduce((a, b) => a + b, 0);
  const sumS = rawSupply.reduce((a, b) => a + b, 0);
  districts.forEach((d, i) => {
    DIST_WEIGHTS[`${st.slug}:${d.slug}`] = {
      demand: rawDemand[i] / sumD,
      supply: rawSupply[i] / sumS,
    };
  });
}

function districtWeights(stateSlug: string, districtSlug: string, sector: SectorId) {
  const w = DIST_WEIGHTS[`${stateSlug}:${districtSlug}`] ?? { demand: 1, supply: 1 };
  const jitter = 0.8 + 0.4 * rand01(`${districtSlug}:${sector}:split`);
  return { demand: w.demand * jitter, supply: w.supply };
}

/* ------------------------------------------------------------- severity */

export function severityOf(gapPct: number): Severity {
  const b = MODEL.bands;
  if (gapPct >= b.acuteShortage) return "acute-shortage";
  if (gapPct >= b.shortage) return "shortage";
  if (gapPct > b.oversupply) return "balanced";
  if (gapPct > b.saturation) return "oversupply";
  return "saturation";
}

const SEVERITY_RANK: Record<Severity, number> = {
  saturation: 0,
  oversupply: 1,
  balanced: 2,
  shortage: 3,
  "acute-shortage": 4,
};

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_RANK[a] - SEVERITY_RANK[b];
}

function trendOf(demand: number, supply: number, growthRate: number): Trend {
  const capacityGrowth = 0.045; // historical seat-capacity expansion
  const prevDemand = demand / (1 + growthRate);
  const prevSupply = supply / (1 + capacityGrowth);
  const now = 1 - supply / demand;
  const prev = 1 - prevSupply / prevDemand;
  const delta = (now - prev) * 100;
  if (delta > 1) return "widening";
  if (delta < -1) return "narrowing";
  return "stable";
}

function growthRate(sector: Sector, state: StateMeta): number {
  return (sector.growth / 100) * (0.8 + 0.4 * affinity(sector.id, state.slug));
}

/* --------------------------------------------------------- row builders */

function buildRow(args: {
  level: Level;
  state: StateMeta;
  district?: DistrictEntry;
  sector: SectorId | "all";
  demandIndexValue: number;
  demand: number;
  supply: number;
  growthRate: number;
  step: number;
}): ForecastRow {
  const { level, state, district, sector } = args;
  const demand = Math.max(args.demand, 1);
  const supply = Math.max(args.supply, 0);
  const gap = demand - supply;
  const gapPct = clamp((gap / demand) * 100, -95, 95);
  const severity = severityOf(gapPct);
  const raw = supply * (1 + MODEL.elasticity * (gapPct / 100));
  const recommended = clamp(
    roundTo(raw, args.step),
    Math.round(supply * MODEL.targetMin),
    Math.max(args.step, Math.round(supply * MODEL.targetMax)),
  );
  const secMeta = sector === "all" ? null : SECTOR_BY_ID[sector];
  const flag =
    severity === "acute-shortage" ? "shortage" : severity === "saturation" ? "saturation" : null;

  return {
    level,
    stateSlug: state.slug,
    stateName: state.name,
    stateNameHi: state.nameHi,
    stateCode: state.code,
    region: state.region,
    districtSlug: district?.slug,
    districtName: district?.name,
    districtCode: district?.code,
    sector,
    sectorName: sector === "all" ? "All pilot sectors" : secMeta!.name,
    sectorNameHi: sector === "all" ? "सभी पायलट क्षेत्र" : secMeta!.nameHi,
    demandIndex: Math.round(args.demandIndexValue * 10) / 10,
    demand: Math.round(demand),
    supply: Math.round(supply),
    gap: Math.round(gap),
    gapPct: Math.round(gapPct * 10) / 10,
    severity,
    recommended,
    deltaPct:
      supply > 0 ? Math.round(((recommended - supply) / supply) * 1000) / 10 : 0,
    trend: trendOf(demand, supply, args.growthRate),
    flag,
    score: Math.abs(gapPct) * Math.log10(1 + demand),
  };
}

/* ------------------------------------------------------------ memoisation */

const cache = new Map<string, unknown>();
function memo<T>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit !== undefined) return hit as T;
  const value = make();
  cache.set(key, value);
  return value;
}

/** Forecast row for one state × one sector (or aggregated). */
export function stateRow(stateSlug: string, sector: SectorId | "all"): ForecastRow {
  return memo(`st:${stateSlug}:${sector}`, () => {
    const state = STATE_BY_SLUG[stateSlug];
    if (!state) throw new Error(`unknown state ${stateSlug}`);
    if (sector === "all") {
      let demand = 0;
      let supply = 0;
      let diNum = 0;
      let gRate = 0;
      for (const sec of SECTORS) {
        const d = stateDemand(state, sec);
        demand += d;
        supply += stateSupply(state, sec);
        diNum += demandIndex(sec, state) * d;
        gRate += growthRate(sec, state) * d;
      }
      return buildRow({
        level: "state",
        state,
        sector,
        demandIndexValue: diNum / demand,
        demand,
        supply,
        growthRate: gRate / demand,
        step: 100,
      });
    }
    const sec = SECTOR_BY_ID[sector];
    return buildRow({
      level: "state",
      state,
      sector,
      demandIndexValue: demandIndex(sec, state),
      demand: stateDemand(state, sec),
      supply: stateSupply(state, sec),
      growthRate: growthRate(sec, state),
      step: 100,
    });
  }) as ForecastRow;
}

/** Forecast row for one district × one sector (or aggregated). */
export function districtRow(
  stateSlug: string,
  districtSlug: string,
  sector: SectorId | "all",
): ForecastRow {
  return memo(`di:${stateSlug}:${districtSlug}:${sector}`, () => {
    const state = STATE_BY_SLUG[stateSlug];
    const district = districtsOf(stateSlug).find((d) => d.slug === districtSlug);
    if (!state || !district) throw new Error(`unknown district ${districtSlug}`);
    const nD = Math.max(districtsOf(stateSlug).length, 1);

    const collect = (sec: Sector) => {
      const w = districtWeights(stateSlug, districtSlug, sec.id);
      const baseDemand = stateDemand(state, sec);
      const baseSupply = stateSupply(state, sec);
      const relIntensity = w.demand * nD; // district demand share vs uniform
      const stateDi = demandIndex(sec, state);
      return {
        demand: baseDemand * w.demand,
        supply: baseSupply * w.supply,
        di: clamp(stateDi * (0.8 + 0.4 * relIntensity), 0, 100),
        g: growthRate(sec, state),
      };
    };

    if (sector === "all") {
      let demand = 0;
      let supply = 0;
      let diNum = 0;
      let gRate = 0;
      for (const sec of SECTORS) {
        const c = collect(sec);
        demand += c.demand;
        supply += c.supply;
        diNum += c.di * c.demand;
        gRate += c.g * c.demand;
      }
      return buildRow({
        level: "district",
        state,
        district,
        sector,
        demandIndexValue: diNum / demand,
        demand,
        supply,
        growthRate: gRate / demand,
        step: 10,
      });
    }
    const c = collect(SECTOR_BY_ID[sector]);
    return buildRow({
      level: "district",
      state,
      district,
      sector,
      demandIndexValue: c.di,
      demand: c.demand,
      supply: c.supply,
      growthRate: c.g,
      step: 10,
    });
  }) as ForecastRow;
}

/** National roll-up for one sector (or aggregated). */
export function nationalRow(sector: SectorId | "all"): ForecastRow {
  return memo(`nat:${sector}`, () => {
    const rows = STATES.map((st) => stateRow(st.slug, sector));
    const demand = rows.reduce((s, r) => s + r.demand, 0);
    const supply = rows.reduce((s, r) => s + r.supply, 0);
    const diNum = rows.reduce((s, r) => s + r.demandIndex * r.demand, 0);
    const rowsGrowth = STATES.map((st) => ({
      g: sector === "all"
        ? SECTORS.reduce(
            (s, sec) => s + growthRate(sec, st) * stateDemand(st, sec),
            0,
          ) / SECTORS.reduce((s, sec) => s + stateDemand(st, sec), 0)
        : growthRate(SECTOR_BY_ID[sector], st),
      d: stateRow(st.slug, sector).demand,
    }));
    const gRate = rowsGrowth.reduce((s, r) => s + r.g * r.d, 0) / demand;
    const row = buildRow({
      level: "national",
      state: STATE_BY_SLUG["uttar-pradesh"],
      sector,
      demandIndexValue: diNum / demand,
      demand,
      supply,
      growthRate: gRate,
      step: 100,
    });
    return {
      ...row,
      stateName: "India",
      stateNameHi: "भारत",
      stateCode: "00",
      region: "National" as const,
    };
  });
}

/** All state rows, optionally filtered by sector. */
export function stateRows(sector: SectorId | "all" = "all"): ForecastRow[] {
  return STATES.map((st) => stateRow(st.slug, sector));
}

/** All district rows for a state, optionally filtered by sector. */
export function districtRows(stateSlug: string, sector: SectorId | "all" = "all"): ForecastRow[] {
  return districtsOf(stateSlug).map((d) => districtRow(stateSlug, d.slug, sector));
}

/** Rows for whatever scope the UI is showing. */
export function scopeRows(scope: Scope, sector: SectorId | "all" = "all"): ForecastRow[] {
  if (scope.level === "national") return stateRows(sector);
  if (scope.level === "state" && scope.stateSlug) return districtRows(scope.stateSlug, sector);
  if (scope.level === "district" && scope.stateSlug && scope.districtSlug) {
    return [districtRow(scope.stateSlug, scope.districtSlug, sector)];
  }
  return [];
}

/** Row describing the scope itself (drives the detail panel). */
export function scopeRow(scope: Scope, sector: SectorId | "all" = "all"): ForecastRow {
  if (scope.level === "national") return nationalRow(sector);
  if (scope.level === "state" && scope.stateSlug) return stateRow(scope.stateSlug, sector);
  if (scope.stateSlug && scope.districtSlug)
    return districtRow(scope.stateSlug, scope.districtSlug, sector);
  return nationalRow(sector);
}

/* ------------------------------------------------------------ trade rows */

const tradeCache = new Map<string, TradeRow[]>();

/** Trade-level rows for a scope, split with seeded supply variation. */
export function tradeRows(scope: Scope, sector: SectorId | "all" = "all"): TradeRow[] {
  const key = `${scope.level}:${scope.stateSlug ?? "-"}:${scope.districtSlug ?? "-"}:${sector}`;
  const hit = tradeCache.get(key);
  if (hit) return hit;

  const geoKey = scope.districtSlug ?? scope.stateSlug ?? "india";
  const relevant = TRADES.filter((t) => sector === "all" || t.sector === sector);
  const bySector = new Map<SectorId, { demand: number; supply: number }>();

  for (const t of relevant) {
    const row =
      scope.level === "national"
        ? nationalRow(t.sector)
        : scope.level === "state" && scope.stateSlug
          ? stateRow(scope.stateSlug, t.sector)
          : scope.stateSlug && scope.districtSlug
            ? districtRow(scope.stateSlug, scope.districtSlug, t.sector)
            : nationalRow(t.sector);
    bySector.set(t.sector, { demand: row.demand, supply: row.supply });
  }

  const rows: TradeRow[] = [];
  for (const sectorId of new Set(relevant.map((t) => t.sector))) {
    const trades = relevant.filter((t) => t.sector === sectorId);
    const totals = bySector.get(sectorId)!;
    // Supply does not track demand role-for-role — that is where the
    // per-trade saturation/shortage signals come from.
    const weights = trades.map(
      (t) => t.demandShare * (0.7 + 0.6 * rand01(`${geoKey}:${t.id}:trade`)),
    );
    const wSum = weights.reduce((a, b) => a + b, 0);
    trades.forEach((t, i) => {
      const demand = totals.demand * t.demandShare;
      const supply = totals.supply * (weights[i] / wSum);
      const gapPct = clamp(((demand - supply) / Math.max(demand, 1)) * 100, -95, 95);
      const severity = severityOf(gapPct);
      const raw = supply * (1 + MODEL.elasticity * (gapPct / 100));
      const recommended = clamp(
        roundTo(raw, 5),
        Math.round(supply * MODEL.targetMin),
        Math.max(5, Math.round(supply * MODEL.targetMax)),
      );
      rows.push({
        tradeId: t.id,
        name: t.name,
        nameHi: t.nameHi,
        sector: t.sector,
        sectorName: SECTOR_BY_ID[t.sector].name,
        sectorNameHi: SECTOR_BY_ID[t.sector].nameHi,
        qp: t.qp,
        nsqf: t.nsqf,
        demand: Math.round(demand),
        supply: Math.round(supply),
        gapPct: Math.round(gapPct * 10) / 10,
        severity,
        recommended,
        deltaPct:
          supply > 0 ? Math.round(((recommended - supply) / supply) * 1000) / 10 : 0,
        flag:
          severity === "acute-shortage"
            ? "shortage"
            : severity === "saturation"
              ? "saturation"
              : null,
        score: Math.abs(gapPct) * Math.log10(1 + demand),
      });
    });
  }
  rows.sort((a, b) => b.score - a.score);
  tradeCache.set(key, rows);
  return rows;
}

/* -------------------------------------------------------------- warnings */

export interface Warnings {
  shortage: { row: ForecastRow; scope: Scope }[];
  saturation: { row: ForecastRow; scope: Scope }[];
  tradeShortage: TradeRow[];
  tradeSaturation: TradeRow[];
}

/** Early-warning flags across states, districts and trades. */
export function warnings(sector: SectorId | "all" = "all"): Warnings {
  return memo(`warn:${sector}`, () => {
    const shortage: { row: ForecastRow; scope: Scope }[] = [];
    const saturation: { row: ForecastRow; scope: Scope }[] = [];
    for (const st of STATES) {
      const sRow = stateRow(st.slug, sector);
      if (sRow.flag === "shortage")
        shortage.push({ row: sRow, scope: { level: "state", stateSlug: st.slug } });
      if (sRow.flag === "saturation")
        saturation.push({ row: sRow, scope: { level: "state", stateSlug: st.slug } });
      for (const d of districtsOf(st.slug)) {
        const row = districtRow(st.slug, d.slug, sector);
        if (row.flag === "shortage")
          shortage.push({ row, scope: { level: "district", stateSlug: st.slug, districtSlug: d.slug } });
        if (row.flag === "saturation")
          saturation.push({ row, scope: { level: "district", stateSlug: st.slug, districtSlug: d.slug } });
      }
    }
    shortage.sort((a, b) => b.row.score - a.row.score);
    saturation.sort((a, b) => b.row.score - a.row.score);
    const trades = tradeRows({ level: "national" }, sector);
    return {
      shortage,
      saturation,
      tradeShortage: trades.filter((t) => t.flag === "shortage"),
      tradeSaturation: trades.filter((t) => t.flag === "saturation"),
    };
  }) as Warnings;
}

/* ------------------------------------------------------------------- KPIs */

export interface Kpis {
  recommended: number;
  currentSupply: number;
  deltaPct: number;
  gapPct: number;
  demandIndex: number;
  flaggedDistricts: number;
  totalDistricts: number;
  shortageStates: number;
  saturationStates: number;
  shortageDistricts: number;
  saturationDistricts: number;
  totalSeats: number;
}

export function kpis(sector: SectorId | "all" = "all"): Kpis {
  return memo(`kpi:${sector}`, () => {
    const nat = nationalRow(sector);
    let flaggedDistricts = 0;
    let totalDistricts = 0;
    let shortageDistricts = 0;
    let saturationDistricts = 0;
    for (const st of STATES) {
      for (const d of districtsOf(st.slug)) {
        totalDistricts++;
        const row = districtRow(st.slug, d.slug, sector);
        if (row.flag) flaggedDistricts++;
        if (row.flag === "shortage") shortageDistricts++;
        if (row.flag === "saturation") saturationDistricts++;
      }
    }
    const states = stateRows(sector);
    const currentSupply = states.reduce((s, r) => s + r.supply, 0);
    const recommended = states.reduce((s, r) => s + r.recommended, 0);
    return {
      recommended,
      currentSupply,
      deltaPct: Math.round(((recommended - currentSupply) / currentSupply) * 1000) / 10,
      gapPct: nat.gapPct,
      demandIndex: nat.demandIndex,
      flaggedDistricts,
      totalDistricts,
      shortageStates: states.filter((r) => r.flag === "shortage").length,
      saturationStates: states.filter((r) => r.flag === "saturation").length,
      shortageDistricts,
      saturationDistricts,
      totalSeats: NATIONAL_REFS.itiSeats,
    };
  }) as Kpis;
}

/* ------------------------------------------------------------- formatting */

const inr = new Intl.NumberFormat("en-IN");
export const fmt = (n: number) => inr.format(Math.round(n));

/** 2617000 → "26.17 lakh" style reading of a headcount. */
export function lakh(n: number): string {
  if (Math.abs(n) >= 100_000) {
    const l = n / 100_000;
    return `${l >= 100 ? l.toFixed(1) : l.toFixed(2)} lakh`;
  }
  return inr.format(Math.round(n));
}

export function pct(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

/** Stable sort helper used by tables: severity first, then score. */
export function rankRows(rows: ForecastRow[]): ForecastRow[] {
  return [...rows].sort((a, b) => {
    const sev = compareSeverity(b.severity, a.severity);
    if (sev !== 0) return sev;
    return b.score - a.score;
  });
}
