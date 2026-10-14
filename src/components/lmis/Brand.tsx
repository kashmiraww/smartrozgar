import { useI18n } from "@/lib/i18n";

/** LMIS mark — two bars closing a gap, inside a soft teal tile. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[9px] shadow-[0_1px_2px_rgb(16_24_40/0.12)]"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, oklch(0.52 0.09 192), oklch(0.4 0.085 205))",
      }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="3.4" height="10" rx="1.2" fill="white" fillOpacity="0.95" />
        <rect x="6.3" y="6" width="3.4" height="7" rx="1.2" fill="white" fillOpacity="0.7" />
        <rect x="11.6" y="1" width="3.4" height="12" rx="1.2" fill="white" fillOpacity="0.5" />
      </svg>
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark size={compact ? 26 : 30} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold tracking-tight">LMIS</span>
          {!compact && (
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
              v1
            </span>
          )}
        </span>
        <span className="hidden truncate text-[11px] text-muted-foreground md:block">
          {t("app.tagline")}
        </span>
      </span>
    </span>
  );
}
