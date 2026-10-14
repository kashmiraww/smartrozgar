import { motion } from "framer-motion";
import {
  ArrowRight,
  Database,
  FileDown,
  Layers,
  Map as MapIcon,
  Radar,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Brand } from "@/components/lmis/Brand";
import { IndiaMap } from "@/components/lmis/IndiaMap";
import { LanguageToggle } from "@/components/lmis/bits";
import { MODEL, NATIONAL_REFS, SECTORS, SOURCES, STATES } from "@/data/lmis";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { kpis } from "@/lib/model";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const enterPaths = ["/auth?returnTo=/dashboard", "/dashboard"] as const;

const SOURCE_CHIPS: { label: string; url: string }[] = [
  { label: "PLFS 2023–24", url: SOURCES[0].url },
  { label: "NCS / PIB", url: SOURCES[1].url },
  { label: "MSDE · DGET", url: SOURCES[2].url },
  { label: "NQR / SSC QPs", url: SOURCES[3].url },
];

export default function Landing() {
  const { t, loc, fmt, lakh, pct } = useI18n();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const enter = () => navigate(isAuthenticated ? enterPaths[1] : enterPaths[0]);
  const gotoMethod = () =>
    document.getElementById("methodology")?.scrollIntoView({ behavior: "smooth" });

  const k = kpis("all");
  const pilotStates = STATES.filter((s) => s.pilot);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      {/* ---------------------------------------------------------- header */}
      <header className="sticky top-0 z-40 border-b hairline bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="transition-colors hover:text-foreground">
              {t("features.eyebrow")}
            </button>
            <button onClick={() => document.getElementById("methodology")?.scrollIntoView({ behavior: "smooth" })} className="transition-colors hover:text-foreground">
              {t("nav.methodology")}
            </button>
            <button onClick={() => document.getElementById("pilot")?.scrollIntoView({ behavior: "smooth" })} className="transition-colors hover:text-foreground">
              {t("pilot.eyebrow")}
            </button>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={enter}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgb(16_24_40/0.12)] transition-transform hover:-translate-y-px sm:px-4"
            >
              {isAuthenticated ? t("nav.dashboard") : t("nav.signin")}
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 78% 8%, oklch(0.96 0.02 195 / 0.9), transparent 70%), radial-gradient(50% 40% at 8% 0%, oklch(0.97 0.005 250), transparent 65%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              {t("landing.badge")}
            </span>

            <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.35rem]">
              {t("landing.title1")}{" "}
              <span className="bg-gradient-to-r from-[oklch(0.42_0.09_195)] to-[oklch(0.5_0.13_25)] bg-clip-text text-transparent">
                {t("landing.title2")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
              {t("landing.sub")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={enter}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_oklch(0.45_0.085_192_/_0.8)] transition-transform hover:-translate-y-0.5"
              >
                {t("landing.ctaOpen")}
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={gotoMethod}
                className="inline-flex items-center gap-2 rounded-xl border hairline bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                {t("landing.ctaMethod")}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("landing.trust")}:</span>
              {SOURCE_CHIPS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border hairline bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Map preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="card-soft relative overflow-hidden">
              <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="size-2 rounded-full bg-sev-acute" />
                  <span className="size-2 rounded-full bg-sev-shortage" />
                  <span className="size-2 rounded-full bg-sev-oversupply" />
                  <span className="ml-1.5">{t("map.legend")}</span>
                </span>
                <span className="text-[11px] font-medium text-primary">{MODEL.cycle}</span>
              </div>
              <div className="px-3 pt-2 pb-3">
                <IndiaMap
                  scope={{ level: "national" }}
                  sector="all"
                  onSelect={enter}
                />
              </div>
            </div>

            {/* floating KPI chips */}
            <div className="pointer-events-none absolute -top-3 -left-3 hidden rounded-xl border hairline bg-popover px-3.5 py-2.5 shadow-lg sm:block">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {t("kpi.gap")}
              </p>
              <p className="text-lg font-semibold text-foreground">{pct(k.gapPct)}</p>
            </div>
            <div className="pointer-events-none absolute -right-3 -bottom-3 hidden rounded-xl border hairline bg-popover px-3.5 py-2.5 shadow-lg sm:block">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {t("kpi.target")}
              </p>
              <p className="text-lg font-semibold text-primary">{lakh(k.recommended)}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="border-y hairline bg-card/60">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {[
            { v: fmt(NATIONAL_REFS.districts), l: t("stat.districts") },
            { v: `${NATIONAL_REFS.states}`, l: t("stat.states") },
            { v: `${NATIONAL_REFS.itiCapacityLakh} lakh`, l: t("stat.seats") },
            { v: MODEL.cycle, l: t("stat.cycle") },
          ].map((s) => (
            <div key={s.l} className="text-center lg:text-left">
              <p className="text-2xl font-semibold tracking-tight">{s.v}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- features */}
      <motion.section id="features" {...reveal} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t("features.eyebrow")}
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("features.title")}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: <Layers className="size-4" />, t: t("f1.t"), d: t("f1.d") },
            { icon: <MapIcon className="size-4" />, t: t("f2.t"), d: t("f2.d") },
            { icon: <TriangleAlert className="size-4" />, t: t("f3.t"), d: t("f3.d") },
            { icon: <FileDown className="size-4" />, t: t("f4.t"), d: t("f4.d") },
          ].map((f) => (
            <div
              key={f.t}
              className="card-soft group p-5 transition-shadow hover:shadow-[0_20px_44px_-26px_rgb(16_24_40/0.3)]"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {f.icon}
              </span>
              <h3 className="mt-3.5 text-[15px] font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ---------------------------------------------------------- method */}
      <motion.section
        id="methodology"
        {...reveal}
        className="border-y hairline bg-secondary/50"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            {t("how.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("how.title")}
          </h2>

          <div className="relative mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: <Database className="size-5" />, t: t("h1.t"), d: t("h1.d") },
              { icon: <Layers className="size-5" />, t: t("h2.t"), d: t("h2.d") },
              { icon: <Radar className="size-5" />, t: t("h3.t"), d: t("h3.d") },
            ].map((s, i) => (
              <div key={s.t} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
                    {s.icon}
                  </span>
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("method.dataNote")}</span>
          </div>
        </div>
      </motion.section>

      {/* ---------------------------------------------------------- pilot */}
      <motion.section id="pilot" {...reveal} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              {t("pilot.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("pilot.title")}
            </h2>

            <p className="mt-5 text-sm font-medium">{t("pilot.statesLabel")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pilotStates.map((s) => (
                <span
                  key={s.slug}
                  className="rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
                >
                  {loc(s.name, s.nameHi)}
                </span>
              ))}
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapIcon className="size-4 text-primary" />
              {t("pilot.note", { n: NATIONAL_REFS.districts })}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">{t("pilot.sectorsLabel")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {SECTORS.map((sec) => (
                <div key={sec.id} className="card-soft flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{loc(sec.name, sec.nameHi)}</p>
                    <p className="text-[11px] text-muted-foreground">{loc(sec.ssc, sec.sscHi)}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                    title={t("pilot.growth")}
                  >
                    ↑ {sec.growth}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.32 0.06 205), oklch(0.38 0.075 195) 55%, oklch(0.34 0.07 230))",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(oklch(1 0 0 / 0.14) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/75">
              {t("cta.sub", { cycle: MODEL.cycle })}
            </p>
            <button
              type="button"
              onClick={enter}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[oklch(0.3_0.05_210)] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {isAuthenticated ? t("nav.dashboard") : t("nav.signin")}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      <footer className="border-t hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Brand compact />
          <p className="max-w-2xl text-[11px] leading-5 text-muted-foreground">
            {t("footer.note")}
          </p>
        </div>
      </footer>
    </div>
  );
}
