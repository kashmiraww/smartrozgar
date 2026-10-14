import { useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODEL, SECTORS, type SectorId } from "@/data/lmis";
import { useI18n } from "@/lib/i18n";
import { exportCsv, exportJson } from "@/lib/export";
import { nationalRow, rankRows, stateRows } from "@/lib/model";
import { FlagPill, SeverityBadge } from "@/components/lmis/bits";

type Level = "state" | "district";

export function TargetsTab({ sector }: { sector: SectorId | "all" }) {
  const { t, loc, fmt, lakh, pct } = useI18n();
  const [level, setLevel] = useState<Level>("state");

  const chartData = SECTORS.map((sec) => {
    const row = nationalRow(sec.id);
    return {
      name: loc(sec.name, sec.nameHi),
      current: row.supply,
      recommended: row.recommended,
    };
  });

  const rows = rankRows(stateRows(sector));

  const tooltipStyle: CSSProperties = {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    fontSize: 12,
    boxShadow: "0 8px 24px -12px rgb(16 24 40 / 0.25)",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{t("targets.chartTitle")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("targets.sub", { cycle: MODEL.cycle, e: MODEL.elasticity })}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px] bg-[oklch(0.72_0.02_255)]" />
              {t("targets.legendA")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px] bg-[oklch(0.45_0.085_192)]" />
              {t("targets.legendB")}
            </span>
          </div>
        </div>

        <div className="mt-4 h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval={0}
                height={44}
                angle={-18}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                width={44}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  `${fmt(Number(value))} seats`,
                  name === "current" ? t("targets.legendA") : t("targets.legendB"),
                ]}
              />
              <Bar dataKey="current" name={t("targets.legendA")} fill="oklch(0.72 0.02 255)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommended" name={t("targets.legendB")} fill="oklch(0.45 0.085 192)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("targets.note")}</p>
      </div>

      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{t("targets.stateTable")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("targets.apiNote")} · {sector === "all" ? t("sector.allShort") : SECTORS.find((s) => s.id === sector)?.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border hairline p-0.5">
              {(["state", "district"] as Level[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    level === lv
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(lv === "state" ? "level.state" : "level.district")}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => exportCsv(level, sector)}
            >
              <Download className="size-3.5" />
              {t("targets.exportCsv")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => exportJson(level, sector)}
            >
              <FileJson className="size-3.5" />
              {t("targets.exportJson")}
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b hairline text-left text-muted-foreground">
                <th className="pb-2 font-medium">{t("th.geo")}</th>
                <th className="pb-2 text-right font-medium">{t("th.di")}</th>
                <th className="pb-2 text-right font-medium">{t("th.supply")}</th>
                <th className="pb-2 text-right font-medium">{t("th.target")}</th>
                <th className="pb-2 text-right font-medium">{t("th.delta")}</th>
                <th className="pb-2 font-medium">{t("th.severity")}</th>
                <th className="pb-2 text-right font-medium">{t("th.flag")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.stateSlug}
                  className="border-b hairline transition-colors last:border-0 hover:bg-secondary/50"
                >
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">{loc(r.stateName, r.stateNameHi)}</span>
                    <span className="ml-2 text-[11px] text-muted-foreground">{r.region}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{r.demandIndex}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                    {lakh(r.supply)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-primary">
                    {fmt(r.recommended)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">
                    {pct(r.deltaPct)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <SeverityBadge severity={r.severity} />
                  </td>
                  <td className="py-2.5 text-right">
                    <FlagPill flag={r.flag} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
