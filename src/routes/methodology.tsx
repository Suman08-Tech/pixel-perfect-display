import { createFileRoute } from "@tanstack/react-router";
import { Bird, CalendarDays, CloudRain, History, Satellite, Stethoscope, Users } from "lucide-react";
import { Card, PageHeader, SyntheticTag } from "@/components/oh/ui";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Data Sources & Methodology — ONEHEALTH" },
      { name: "description", content: "How ONEHEALTH combines human, animal, weather, satellite, population, historical and event data into explainable risk scores." },
      { property: "og:title", content: "Data Sources & Methodology — ONEHEALTH" },
      { property: "og:description", content: "Data inputs, model design and the prototype status of each source." },
    ],
  }),
  component: Methodology,
});

const sources = [
  { i: Stethoscope, t: "Human health data", d: "Aggregated syndromic counts (fever, diarrhoea, respiratory) and lab confirmations from public facilities, at district/week level.", ex: "e.g. IDSP / IHIP-style reporting" },
  { i: Bird, t: "Animal health data", d: "Livestock and poultry morbidity/mortality, zoonotic event reports, dog-bite incidence from veterinary networks.", ex: "e.g. animal disease reporting systems" },
  { i: CloudRain, t: "Weather", d: "Rainfall, temperature, humidity and short-range forecasts; anomalies vs. climatology.", ex: "e.g. national meteorological feeds" },
  { i: Satellite, t: "Satellite data", d: "Surface water (NDWI), flood extent, vegetation (NDVI) and land surface temperature.", ex: "e.g. Sentinel / MODIS-derived indices" },
  { i: Users, t: "Population", d: "Population size and density to contextualise exposure and transmission potential.", ex: "e.g. census projections" },
  { i: History, t: "Historical disease data", d: "Multi-year seasonal baselines used to measure similarity to past outbreak conditions.", ex: "5-year district baselines" },
  { i: CalendarDays, t: "Contextual event data", d: "Festivals, mass gatherings, migration and school calendars that change contact patterns.", ex: "curated event calendar" },
];

function Methodology() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      <PageHeader eyebrow="Data sources & methodology" title="How the risk index is built" desc="Each signal is normalised, weighted against its historical baseline and combined into a 0–100 district index. Every score is decomposed into contributions so the reason behind it is always visible." />
      <div className="mb-6 rounded-2xl border border-dashed border-teal/50 bg-accent p-5 text-sm text-accent-foreground">
        <div className="mb-2"><SyntheticTag /></div>
        <strong>No data in this prototype is live.</strong> All values, districts scores, warnings and trends are synthetic and generated for demonstration. Source names below describe the intended integrations, not current connections.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((s) => (
          <Card key={s.t}>
            <div className="flex items-start justify-between gap-3"><s.i className="h-5 w-5 text-teal" /><span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Planned · simulated</span></div>
            <p className="mt-3 font-semibold">{s.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            <p className="mt-2 text-xs text-muted-foreground">{s.ex}</p>
          </Card>
        ))}
      </div>
      <Card title="Scoring pipeline" className="mt-6">
        <ol className="grid gap-3 text-sm md:grid-cols-4">
          {["Ingest & aggregate to district/day", "Normalise vs. seasonal baseline", "Weighted, explainable model (additive contributions)", "Threshold → graded alert + confidence from data completeness"].map((x, i) => <li key={x} className="rounded-lg bg-muted p-3"><span className="num text-xs text-teal">Step {i + 1}</span><p className="mt-1">{x}</p></li>)}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">Levels: Low 0–34 · Moderate 35–54 · High 55–74 · Critical 75–100. Confidence reflects data completeness, timeliness and agreement across sources.</p>
      </Card>
    </div>
  );
}
