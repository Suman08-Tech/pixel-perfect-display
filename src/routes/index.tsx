import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bird, CloudRain, ShieldAlert, Users, Cpu, Radio, Satellite } from "lucide-react";
import { districts, getDistrict, warnings } from "@/data/districts";
import { RiskBrief } from "@/components/oh/RiskBrief";
import { Card, SyntheticTag } from "@/components/oh/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ONEHEALTH — From fragmented signals to early action" },
      { name: "description", content: "India's One Health early warning platform: human, animal and environmental signals fused into explainable district risk intelligence." },
      { property: "og:title", content: "ONEHEALTH — From fragmented signals to early action" },
      { property: "og:description", content: "Explainable population-level health risk intelligence and early warnings for India." },
    ],
  }),
  component: Home,
});

function Home() {
  const k = getDistrict("kolkata")!;
  const stats = [
    { v: districts.length * 42, l: "Districts modelled", s: "of 766 nationally" },
    { v: "1.2M", l: "Signals ingested / week", s: "human · animal · environment" },
    { v: warnings.length, l: "Active early warnings", s: "High or Critical" },
    { v: "6.4 days", l: "Median lead time", s: "before case peak (backtest)" },
  ];
  const steps = [
    { i: Users, t: "Human signals", d: "Syndromic fever, diarrhoea and respiratory reports aggregated from health facilities." },
    { i: Bird, t: "Animal signals", d: "Livestock, poultry and zoonotic event reports from veterinary networks." },
    { i: CloudRain, t: "Environment", d: "Rainfall, waterlogging, air quality, satellite water & vegetation indices." },
    { i: Cpu, t: "AI risk intelligence", d: "Explainable model weights each signal against history, population and season." },
    { i: Radio, t: "Early warning", d: "Threshold crossings trigger graded alerts with recommended preparedness actions." },
  ];
  return (
    <div>
      <section className="border-b bg-gradient-to-b from-card to-background">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">National One-Health Early Warning & Risk Intelligence</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">From fragmented signals to early action.</h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">ONEHEALTH fuses human, animal and environmental signals into explainable, district-level risk scores — so health, veterinary and municipal authorities can prepare days before outbreaks peak.</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-medium">
              {["Human", "Animal", "Environment"].map((x) => <span key={x} className="rounded-full border bg-card px-3 py-1">{x}</span>)}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">AI Risk Intelligence</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">Early Warning</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/map" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Explore Risk Map <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted">Open Authority Dashboard</Link>
            </div>
          </div>
          <RiskBrief d={k} />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">National snapshot</h2><SyntheticTag /></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => <Card key={s.l}><p className="num text-3xl font-semibold text-foreground">{s.v}</p><p className="mt-1 text-sm font-medium">{s.l}</p><p className="text-xs text-muted-foreground">{s.s}</p></Card>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        <h2 className="mb-1 text-lg font-semibold">How it works</h2>
        <p className="mb-5 text-sm text-muted-foreground">Five stages from raw signal to graded, explainable warning.</p>
        <div className="grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <Card key={s.t} className="relative">
              <span className="num absolute right-4 top-4 text-xs text-muted-foreground">0{i + 1}</span>
              <s.i className="h-5 w-5 text-teal" />
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="flex gap-4 rounded-2xl border border-risk-moderate/50 bg-risk-moderate/10 p-6">
          <ShieldAlert className="h-6 w-6 shrink-0 text-foreground" />
          <div>
            <p className="font-semibold">Public safety disclaimer</p>
            <p className="mt-1 text-sm text-muted-foreground">ONEHEALTH does not diagnose individuals and is not a substitute for medical advice. Risk scores describe population-level conditions to support preparedness. If you feel unwell, consult a qualified health professional. All data shown in this prototype is synthetic. <Satellite className="inline h-3.5 w-3.5" /></p>
          </div>
        </div>
      </section>
    </div>
  );
}
