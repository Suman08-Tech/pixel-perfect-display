import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { CalendarDays, CloudRain, Droplets, Satellite, Thermometer, Users } from "lucide-react";
import { districts, getDistrict, history, timeline, type District } from "@/data/districts";
import { RiskBrief } from "@/components/oh/RiskBrief";
import { Card, PageHeader } from "@/components/oh/ui";

export const Route = createFileRoute("/district/$id")({
  loader: ({ params }) => { const d = getDistrict(params.id); if (!d) throw notFound(); return { name: d.name, state: d.state, score: d.scores.overall }; },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "District not found — ONEHEALTH" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.name} risk profile — ONEHEALTH`;
    const desc = `${loaderData.name}, ${loaderData.state}: risk index ${loaderData.score}/100 with signal breakdown, 14-day timeline and recommended actions.`;
    return { meta: [{ title: t }, { name: "description", content: desc }, { property: "og:title", content: t }, { property: "og:description", content: desc }] };
  },
  component: DistrictPage,
});

function SignalList({ title, items }: { title: string; items: District["human"] }) {
  return <Card title={title}><ul className="divide-y">{items.map((i) => (
    <li key={i.label} className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{i.label}</span>
      <span className="flex items-center gap-2"><span className="num font-semibold">{i.value}</span>
        <span className={`num text-xs ${i.delta > 0 ? "text-risk-critical" : "text-risk-low"}`}>{i.delta > 0 ? "▲" : "▼"}{Math.abs(i.delta)}%</span></span>
    </li>))}</ul></Card>;
}

function DistrictPage() {
  const { id } = Route.useParams();
  const d = getDistrict(id)!;
  const nav = useNavigate();
  const tl = timeline(d);
  const hist = history(d);
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <PageHeader eyebrow={`District profile · ${d.state}`} title={d.name} desc="Explainable risk intelligence combining human, animal and environmental signals."
        right={<select value={id} onChange={(e) => nav({ to: "/district/$id", params: { id: e.target.value } })} className="rounded-lg border bg-card px-3 py-2 text-sm">
          {districts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>} />
      <RiskBrief d={d} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Risk timeline — last 14 days" className="lg:col-span-2" action={<span className="text-xs text-muted-foreground">Warning threshold 75</span>}>
          <div className="h-64"><ResponsiveContainer><AreaChart data={tl} margin={{ left: -20, right: 10 }}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--teal)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--teal)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip formatter={(v) => [`${v}/100`, "Risk"]} labelFormatter={(l, p) => `${l}${p?.[0]?.payload?.note ? " — " + p[0].payload.note : ""}`} />
            <ReferenceLine y={75} stroke="var(--risk-critical)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" />
            {tl.filter((p) => p.alert).map((p) => <ReferenceDot key={p.day} x={p.day} y={p.score} r={6} fill="var(--risk-critical)" stroke="var(--card)" />)}
          </AreaChart></ResponsiveContainer></div>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">{tl.filter((p) => p.note).map((p) => <li key={p.day}><span className="num font-semibold text-foreground">{p.day}</span> · {p.note}</li>)}</ul>
        </Card>
        <Card title="Weather conditions">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><Thermometer className="h-4 w-4 text-teal" /><p className="num mt-1 text-xl font-semibold">{d.weather.temp}°C</p><p className="text-xs text-muted-foreground">Temperature</p></div>
            <div><Droplets className="h-4 w-4 text-teal" /><p className="num mt-1 text-xl font-semibold">{d.weather.humidity}%</p><p className="text-xs text-muted-foreground">Humidity</p></div>
            <div><CloudRain className="h-4 w-4 text-teal" /><p className="num mt-1 text-xl font-semibold">{d.weather.rain7d} mm</p><p className="text-xs text-muted-foreground">Rainfall (7d)</p></div>
            <div><Users className="h-4 w-4 text-teal" /><p className="num mt-1 text-xl font-semibold">{d.density.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">People / km²</p></div>
          </div>
          <p className="mt-4 rounded-lg bg-muted p-3 text-sm">{d.weather.forecast}</p>
          <p className="mt-2 text-xs text-muted-foreground">Population: <span className="num">{(d.population / 1e6).toFixed(1)}M</span></p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <SignalList title="Human signals" items={d.human} />
        <SignalList title="Animal signals" items={d.animal} />
        <SignalList title="Environmental signals" items={d.environment} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Historical disease trend (seasonal index)" className="lg:col-span-2">
          <div className="h-56"><ResponsiveContainer><LineChart data={hist} margin={{ left: -20, right: 10 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" /><YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="avg" name="5-yr average" stroke="var(--chart-5)" strokeDasharray="4 3" dot={false} strokeWidth={2} />
            <Line dataKey="current" name="2026" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart></ResponsiveContainer></div>
        </Card>
        <div className="space-y-6">
          <Card title={<span className="flex items-center gap-2"><Satellite className="h-4 w-4 text-teal" />Satellite indicators</span>}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[["NDWI (surface water)", d.satellite.ndwi], ["Flood extent", `${d.satellite.floodExtent}%`], ["NDVI (vegetation)", d.satellite.ndvi], ["Land surface temp", `${d.satellite.lst}°C`]].map(([k, v]) => <div key={k as string}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num font-semibold">{v}</dd></div>)}
            </dl>
          </Card>
          <Card title={<span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal" />Seasonal & event context</span>}>
            <ul className="space-y-1.5 text-sm">{d.events.map((e) => <li key={e} className="rounded-lg bg-muted px-3 py-1.5">{e}</li>)}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
