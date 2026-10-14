/** Severity → label key, palette and map-fill classes (single source of truth). */

import type { Severity } from "@/lib/model";
import type { StringKey } from "@/lib/i18n";

export const SEVERITY_ORDER: Severity[] = [
  "acute-shortage",
  "shortage",
  "balanced",
  "oversupply",
  "saturation",
];

export const SEVERITY_META: Record<
  Severity,
  { labelKey: StringKey; descKey: StringKey; fill: string; chip: string; text: string }
> = {
  "acute-shortage": {
    labelKey: "sev.acute",
    descKey: "sev.acute.desc",
    fill: "fill-sev-acute",
    chip: "bg-sev-acute text-white",
    text: "text-sev-acute",
  },
  shortage: {
    labelKey: "sev.short",
    descKey: "sev.short.desc",
    fill: "fill-sev-shortage",
    chip: "bg-sev-shortage text-[oklch(0.25_0.08_40)]",
    text: "text-[oklch(0.5_0.13_45)]",
  },
  balanced: {
    labelKey: "sev.balanced",
    descKey: "sev.balanced.desc",
    fill: "fill-sev-balanced",
    chip: "bg-sev-balanced text-[oklch(0.42_0.01_255)]",
    text: "text-muted-foreground",
  },
  oversupply: {
    labelKey: "sev.over",
    descKey: "sev.over.desc",
    fill: "fill-sev-oversupply",
    chip: "bg-sev-oversupply text-[oklch(0.3_0.06_250)]",
    text: "text-[oklch(0.45_0.1_250)]",
  },
  saturation: {
    labelKey: "sev.sat",
    descKey: "sev.sat.desc",
    fill: "fill-sev-saturation",
    chip: "bg-sev-saturation text-white",
    text: "text-sev-saturation",
  },
};
