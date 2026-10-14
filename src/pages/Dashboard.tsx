import { useState } from "react";
import { ChevronRight, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Brand } from "@/components/lmis/Brand";
import { IndiaMap } from "@/components/lmis/IndiaMap";
import { DetailPanel } from "@/components/lmis/DetailPanel";
import { TargetsTab } from "@/components/lmis/TargetsTab";
import { WarningsTab } from "@/components/lmis/WarningsTab";
import { MethodologyTab } from "@/components/lmis/MethodologyTab";
import { KpiCard, LanguageToggle } from "@/components/lmis/bits";
import { MODEL, SECTORS, STATES, type SectorId } from "@/data/lmis";
import { DISTRICT_PATHS } from "@/data/indiaDistricts";
import { useI18n } from "@/lib/i18n";
import { districtRow, kpis, type Scope } from "@/lib/model";

type TabId = "map" | "targets" | "warnings" | "method";

const PILOT_STATE_SLUGS = new Set(
  STATES.filter((s) => s.pilot).map((s) => s.slug),
);

export default function Dashboard() {
  const { t, loc, fmt, lakh, pct } = useI18n();
  const [scope, setScope] = useState<Scope>({ level: "national" });
  const [sector, setSector] = useState<SectorId | "all">("all");
  const [tab, setTab] = useState<TabId>("map");

  const k = kpis(sector);

  const goNational = () => setScope({ level: "national" });
  const goState = (stateSlug: string) => setScope({ level: "state", stateSlug });
  const openScope = (next: Scope) => {
    setScope(next);
    setTab("map");
  };

  const stateInfo =
    scope.level === "national"
      ? null
      : STATES.find((s) => s.slug === scope.stateSlug) ?? null;

  const districtName =
    scope.level === "district" && scope.stateSlug && scope.districtSlug
      ? districtRow(scope.stateSlug, scope.districtSlug, sector).districtName
      : null;

  const gapTone = k.gapPct >= MODEL.bands.shortage ? "warning" : "neutral";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b hairline bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border hairline bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground lg:inline-flex">
              <Globe className="size-3" />
              {t("hdr.dataNote")}
            </span>
            <LanguageToggle />
            <LogoDropdown />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 sm:px-6">
        {/* Page head */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-6 pb-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              {t("app.workspace")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
              {t("dash.title")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border hairline bg-card px-2.5 py-1 font-medium">
              {t("hdr.cycle")}: {MODEL.cycle}
            </span>
            <span className="rounded-full border hairline bg-card px-2.5 py-1 text-muted-foreground">
              {t("hdr.run")}: {MODEL.runDate}
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiCard
            label={t("kpi.target")}
            hint={`${t("kpi.targetHint")} · ${pct(k.deltaPct)} ${t("kpi.delta")}`}
            value={lakh(k.recommended)}
            tone="brand"
          />
          <KpiCard
            label={t("kpi.gap")}
            hint={t("kpi.gapHint")}
            value={pct(k.gapPct)}
            tone={gapTone === "warning" ? "warning" : "neutral"}
          />
          <KpiCard
            label={t("kpi.flags")}
            hint={t("kpi.flagsHint", { n: fmt(k.totalDistricts) })}
            value={`${fmt(k.flaggedDistricts)}`}
          />
          <KpiCard
            label={t("kpi.di")}
            hint={t("kpi.diHint")}
            value={k.demandIndex}
          />
        </div>

        {/* Sector filter */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 pr-1 text-xs font-medium text-muted-foreground">
            {t("map.sectorFilter")}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSector("all")}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sector === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hairline bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("sector.allShort")}
            </button>
            {SECTORS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSector(sec.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  sector === sec.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hairline bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {loc(sec.name, sec.nameHi)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="mt-3">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto sm:w-fit">
            <TabsTrigger value="map" className="px-3">
              {t("tab.map")}
            </TabsTrigger>
            <TabsTrigger value="targets" className="px-3">
              {t("tab.targets")}
            </TabsTrigger>
            <TabsTrigger value="warnings" className="relative px-3">
              {t("tab.warnings")}
              {k.flaggedDistricts > 0 && (
                <span className="ml-1 rounded-full bg-sev-acute/15 px-1.5 py-0.5 text-[10px] font-semibold text-sev-acute">
                  {k.shortageDistricts}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="method" className="px-3">
              {t("tab.method")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
              <div className="flex min-w-0 flex-col gap-3">
                {/* Breadcrumb */}
                <nav
                  aria-label="breadcrumb"
                  className="flex flex-wrap items-center gap-1.5 text-sm"
                >
                  <button
                    type="button"
                    onClick={goNational}
                    className={`rounded-md px-1.5 py-0.5 transition-colors ${
                      scope.level === "national"
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("level.india")}
                  </button>
                  {stateInfo && (
                    <>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                      <button
                        type="button"
                        onClick={() => goState(stateInfo.slug)}
                        className={`rounded-md px-1.5 py-0.5 transition-colors ${
                          scope.level === "state"
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {loc(stateInfo.name, stateInfo.nameHi)}
                        {PILOT_STATE_SLUGS.has(stateInfo.slug) && (
                          <span className="ml-1.5 rounded border border-primary/30 bg-primary/10 px-1 py-px text-[10px] font-medium text-primary">
                            {t("map.pilot")}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                  {scope.level === "district" && districtName && (
                    <>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                      <span className="rounded-md px-1.5 py-0.5 font-semibold text-foreground">
                        {districtName}
                      </span>
                    </>
                  )}
                  <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
                    {stateInfo
                      ? t("map.districtCount", { n: DISTRICT_COUNTS[stateInfo.slug] ?? 0 })
                      : t("map.districtCount", { n: 726 })}
                  </span>
                </nav>

                <IndiaMap scope={scope} sector={sector} onSelect={openScope} />
              </div>

              <div className="min-w-0">
                <DetailPanel scope={scope} sector={sector} onSelect={openScope} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targets" className="mt-4">
            <TargetsTab sector={sector} />
          </TabsContent>

          <TabsContent value="warnings" className="mt-4">
            <WarningsTab sector={sector} onSelect={openScope} />
          </TabsContent>

          <TabsContent value="method" className="mt-4">
            <MethodologyTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/** District counts per state for the breadcrumb hint. */
const DISTRICT_COUNTS: Record<string, number> = Object.fromEntries(
  Object.entries(DISTRICT_PATHS).map(([slug, list]) => [slug, list.length]),
);
