import type { ReactNode } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { SEVERITY_META, SEVERITY_ORDER } from "@/lib/severity";
import type { Severity, Trend } from "@/lib/model";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className="flex items-center rounded-lg border hairline bg-muted/60 p-0.5"
      role="group"
      aria-label={t("nav.language")}
    >
      {(["en", "hi"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            lang === l
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "हि"}
        </button>
      ))}
    </div>
  );
}

export function SeverityBadge({
  severity,
  className = "",
}: {
  severity: Severity;
  className?: string;
}) {
  const { t } = useI18n();
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${meta.chip} ${className}`}
    >
      {t(meta.labelKey)}
    </span>
  );
}

export function GapLegend({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-x-3 gap-y-1.5" : "gap-2"}`}>
      {!compact && (
        <span className="text-xs font-medium text-muted-foreground">
          {t("map.legend")}
        </span>
      )}
      {SEVERITY_ORDER.map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={`size-2.5 rounded-[3px] ${SEVERITY_META[s].fill.replace("fill-", "bg-")}`}
          />
          {t(SEVERITY_META[s].labelKey)}
        </span>
      ))}
    </div>
  );
}

export function KpiCard({
  label,
  hint,
  value,
  tone = "neutral",
}: {
  label: string;
  hint?: string;
  value: ReactNode;
  tone?: "neutral" | "brand" | "warning";
}) {
  const toneClass =
    tone === "brand"
      ? "text-primary"
      : tone === "warning"
        ? "text-[oklch(0.5_0.13_45)]"
        : "text-foreground";
  return (
    <div className="card-soft px-4 py-3.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const TREND_KEY = {
  widening: "trend.widening",
  narrowing: "trend.narrowing",
  stable: "trend.stable",
} as const;

export function TrendChip({ trend }: { trend: Trend }) {
  const { t } = useI18n();
  const Icon = trend === "widening" ? ArrowUpRight : trend === "narrowing" ? ArrowDownRight : Minus;
  const cls =
    trend === "widening"
      ? "text-[oklch(0.5_0.13_45)]"
      : trend === "narrowing"
        ? "text-primary"
        : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="size-3.5" />
      {t(TREND_KEY[trend])}
    </span>
  );
}

export function FlagPill({ flag }: { flag: "shortage" | "saturation" | null }) {
  const { t } = useI18n();
  if (!flag) return <span className="text-xs text-muted-foreground">—</span>;
  const border = flag === "shortage" ? "border-sev-acute/30" : "border-sev-saturation/30";
  const text = flag === "shortage" ? "text-sev-acute" : "text-sev-saturation";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${border} ${text}`}
    >
      {t(flag === "shortage" ? "flag.shortage" : "flag.saturation")}
    </span>
  );
}
