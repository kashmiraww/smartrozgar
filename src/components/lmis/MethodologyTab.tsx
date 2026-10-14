import { useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODEL, SOURCES } from "@/data/lmis";
import { useI18n } from "@/lib/i18n";
import { apiExample } from "@/lib/export";
import { SEVERITY_ORDER } from "@/lib/severity";
import { SeverityBadge } from "@/components/lmis/bits";

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card-soft p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {n}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

export function MethodologyTab() {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const example = apiExample();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(example);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const bands: { sev: (typeof SEVERITY_ORDER)[number]; range: string }[] = [
    { sev: "acute-shortage", range: `≥ +${MODEL.bands.acuteShortage}%` },
    { sev: "shortage", range: `+${MODEL.bands.shortage}% … +${MODEL.bands.acuteShortage}%` },
    { sev: "balanced", range: `${MODEL.bands.oversupply}% … +${MODEL.bands.shortage}%` },
    { sev: "oversupply", range: `${MODEL.bands.saturation}% … ${MODEL.bands.oversupply}%` },
    { sev: "saturation", range: `≤ ${MODEL.bands.saturation}%` },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section n="1" title={t("method.indexTitle")}>
        <p>{t("method.indexBody")}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg border hairline bg-muted/60 p-3 font-mono text-[11px] leading-5 text-foreground">
{`DI = 0.50 × vacancy(NCS) + 0.30 × growth(PLFS)
     + 0.20 × wage
demand = workers × sectorShare × postingRate
         × (0.75 + 0.5 × DI/100)`}
        </pre>
      </Section>

      <Section n="2" title={t("method.gapTitle")}>
        <p>{t("method.gapBody")}</p>
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-foreground">
            {t("method.bandsTitle")}
          </p>
          {bands.map((b) => (
            <div key={b.sev} className="flex items-center justify-between gap-3 text-xs">
              <SeverityBadge severity={b.sev} />
              <span className="font-mono text-muted-foreground">{b.range}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section n="3" title={t("method.dataTitle")}>
        <p className="mb-3">{t("method.dataNote")}</p>
        <ul className="space-y-3">
          {SOURCES.map((s) => (
            <li key={s.label} className="rounded-lg border hairline p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{s.label}</p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary transition-colors hover:text-primary/80"
                  aria-label={s.label}
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{s.detail}</p>
              <p className="mt-1.5 text-[11px] text-primary/90">{s.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="flex flex-col gap-4">
        <Section n="4" title={t("method.apiTitle")}>
          <p>{t("method.apiBody")}</p>
          <div className="mt-3 rounded-lg border hairline bg-muted/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-[11px] break-all text-foreground">
                GET /api/v1/forecast?level=state&amp;sector=electronics
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 gap-1.5 px-2 text-xs"
                onClick={copy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? t("method.copied") : t("method.copy")}
              </Button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto font-mono text-[11px] leading-5 text-muted-foreground">
              {example}
            </pre>
          </div>
        </Section>

        <Section n="5" title={t("method.limitsTitle")}>
          <ul className="space-y-2.5">
            {(
              [
                ["method.l1", "L1"],
                ["method.l2", "L2"],
                ["method.l3", "L3"],
              ] as const
            ).map(([key]) => (
              <li key={key} className="flex gap-2 text-xs leading-5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground/80" lang={lang}>
            {t("footer.note")}
          </p>
        </Section>
      </div>
    </div>
  );
}
