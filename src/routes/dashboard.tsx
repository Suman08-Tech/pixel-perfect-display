import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { ArrowUpDown, TrendingUp } from "lucide-react";
import { alertHistory, districts, getDistrict, level, timeline, warnings, type Layer } from "@/data/districts";
import { LazyMap } from "@/components/oh/LazyMap";
import { RiskBrief } from "@/components/oh/RiskBrief";
import { Card, LevelBadge, PageHeader, scoreColor, SyntheticTag } from "@/components/oh/ui";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — ONEHEALTH" },
      { name: "description", content: "National One Health command view for public health, veterinary and municipal authorities: hotspots, alerts and response." },
      { property: "og:title", content: "Authority Dashboard — ONEHEALTH" },
      { property: "og:description", content: "India overview of district risk, emerging hotspots and active alerts." },
    ],
  }),
  component: Dashboard,
});

type SortKey = "overall" | "human" | "animal" | "environment" | "confidence";

function Dashboard() {
  const [sel, setSel] = useState("kolkata");
  const [sort, setSort] = useState<SortKey>("overall");
  const d = getDistrict(sel)!;
  const ranked = useMemo(() => [...districts].sort((a, b) => (sort === "confidence" ? b.confidence - a.confidence : b.scores[sort] - a.scores[sort])), [sort]);
  const hotspots = useMemo(() => districts.map((x) => { const t = timeline(x); return { x, rise: t[13].score - t[6].score }; }).sort((a, b) => b.rise - a.rise).slice(0, 5), []);
  const avg = (k: Layer) => Math.round(districts.reduce((s, x) => s + x.scores[k], 0) / districts.length);
  const high = districts.filter((x) => x.scores.overall >= 55).length;
  const kpis = [
    { l: "National mean risk", v: avg("overall") },
    { l: "Human health index", v: avg("human") },
    { l: "Animal health index", v: avg("animal") },
    { l: "Environment index", v: avg("environment") },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <PageHeader eyebrow="Authority dashboard · India overview" title="National One Health situation" desc="Select any district on the map or table to update the analysis panel." right={<SyntheticTag />} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {kpis.map((k) => <Card key={k.l}><p className="text-xs text-muted-foreground">{k.l}</p><p className="num mt-1 text-2xl font-semibold" style={{ color: scoreColor(k.v) }}>{k.v}</p></Card>)}
        <Card><p className="text-xs text-muted-foreground">High-risk districts</p><p className="num mt-1 text-2xl font-semibold">{high}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Active alerts</p><p className="num mt-1 text-2xl font-semibold text-risk-critical">{warnings.length}</p></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden p-0"><div className="h-[480px]"><LazyMap layer="overall" selected={sel} onSelect={setSel} height="480px" /></div></Card>
        <RiskBrief d={d} compact />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Risk ranking" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2">#</th><th className="py-2">District</th>
                {(["overall", "human", "animal", "environment", "confidence"] as SortKey[]).map((k) => <th key={k} className="py-2 text-right"><button onClick={() => setSort(k)} className={`inline-flex items-center gap-1 capitalize ${sort === k ? "text-foreground font-semibold" : ""}`}>{k}<ArrowUpDown className="h-3 w-3" /></button></th>)}
                <th className="py-2 pl-3 text-right">Level</th>
              </tr></thead>
              <tbody>{ranked.map((x, i) => (
                <tr key={x.id} onClick={() => setSel(x.id)} className={`cursor-pointer border-b last:border-0 hover:bg-muted ${sel === x.id ? "bg-accent" : ""}`}>
                  <td className="num py-2 pr-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-2"><p className="font-medium">{x.name}</p><p className="text-xs text-muted-foreground">{x.state}</p></td>
                  {(["overall", "human", "animal", "environment"] as Layer[]).map((k) => <td key={k} className="num py-2 text-right">{x.scores[k]}</td>)}
                  <td className="num py-2 text-right">{x.confidence}%</td>
                  <td className="py-2 pl-3 text-right"><LevelBadge lvl={level(x.scores.overall)} /></td>
                </tr>))}</tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-6">
          <Card title={<span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-teal" />Emerging hotspots (7-day rise)</span>}>
            <div className="h-48"><ResponsiveContainer><BarChart data={hotspots.map((h) => ({ name: h.x.name.split(" ")[0], rise: h.rise, s: h.x.scores.overall }))} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`+${v} pts`, "Rise"]} />
              <Bar dataKey="rise" radius={[0, 6, 6, 0]}>{hotspots.map((h) => <Cell key={h.x.id} fill={scoreColor(h.x.scores.overall)} />)}</Bar>
            </BarChart></ResponsiveContainer></div>
          </Card>
          <Card title="Response recommendations">
            <ul className="space-y-2 text-sm">
              {[["Public health", "Scale fever surveillance & dengue testing in 5 Critical/High districts."], ["Veterinary", "Leptospirosis screening in cattle sheds, Mumbai & Ernakulam."], ["Municipal / DM", "Drain clearance & larvicide in waterlogged Kolkata wards before Puja."]].map(([a, b]) => <li key={a} className="rounded-lg bg-muted p-3"><p className="text-xs font-semibold uppercase tracking-wider text-teal">{a}</p><p className="mt-0.5">{b}</p></li>)}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Alert history" className="mt-6">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Date</th><th>District</th><th>Type</th><th>Level</th><th className="text-right">Status</th></tr></thead>
          <tbody>{alertHistory.map((a) => <tr key={a.date + a.district} className="border-b last:border-0"><td className="num py-2">{a.date}</td><td>{a.district}</td><td className="text-muted-foreground">{a.type}</td><td><LevelBadge lvl={a.level} /></td><td className="text-right">{a.status}</td></tr>)}</tbody>
        </table></div>
      </Card>
    </div>
  );
}
