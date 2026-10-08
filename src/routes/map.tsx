import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { districts, getDistrict, LAYERS, level, type Layer } from "@/data/districts";
import { LazyMap } from "@/components/oh/LazyMap";
import { RiskBrief } from "@/components/oh/RiskBrief";
import { LevelBadge, levelVar, SyntheticTag } from "@/components/oh/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Public Risk Map — ONEHEALTH" },
      { name: "description", content: "Interactive district-level One Health risk map of India with filters for human, animal, environmental and disease-type risks." },
      { property: "og:title", content: "Public Risk Map — ONEHEALTH" },
      { property: "og:description", content: "Explore district-level health risk across India." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [layer, setLayer] = useState<Layer>("overall");
  const [sel, setSel] = useState("kolkata");
  const [q, setQ] = useState("");
  const matches = useMemo(() => q ? districts.filter((d) => (d.name + d.state).toLowerCase().includes(q.toLowerCase())) : [], [q]);
  const d = getDistrict(sel)!;
  return (
    <div className="grid lg:h-[calc(100vh-5.5rem)] lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="relative h-[60vh] lg:h-full">
        <LazyMap layer={layer} selected={sel} onSelect={setSel} height="100%" />
        <div className="absolute left-3 right-3 top-3 z-[500] space-y-2 md:right-auto md:w-[560px]">
          <div className="relative rounded-xl border bg-card shadow-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search district or city…" className="w-full rounded-xl bg-transparent py-2 pl-9 pr-3 text-sm outline-none" />
            {matches.length > 0 && <ul className="border-t">{matches.slice(0, 6).map((m) => (
              <li key={m.id}><button onClick={() => { setSel(m.id); setQ(""); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"><span>{m.name}, <span className="text-muted-foreground">{m.state}</span></span><LevelBadge lvl={level(m.scores[layer])} /></button></li>
            ))}</ul>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LAYERS.map((l) => <button key={l.id} onClick={() => setLayer(l.id)} className={cn("rounded-full border px-3 py-1 text-xs font-medium shadow-sm", layer === l.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{l.label}</button>)}
          </div>
        </div>
        <div className="absolute bottom-4 left-3 z-[500] rounded-xl border bg-card p-3 text-xs shadow-sm">
          <p className="mb-2 font-semibold">Risk level</p>
          {(["Low", "Moderate", "High", "Critical"] as const).map((l, i) => <p key={l} className="flex items-center gap-2 py-0.5"><span className="h-3 w-3 rounded-full" style={{ background: levelVar[l] }} />{l} <span className="num text-muted-foreground">{["0–34", "35–54", "55–74", "75–100"][i]}</span></p>)}
          <div className="mt-2"><SyntheticTag /></div>
        </div>
      </div>
      <aside className="overflow-y-auto border-l bg-background p-4">
        <p className="mb-3 text-xs text-muted-foreground">Selected layer: <strong className="text-foreground">{LAYERS.find((l) => l.id === layer)!.label}</strong> · <span className="num">{d.scores[layer]}</span>/100</p>
        <RiskBrief d={d} compact />
      </aside>
    </div>
  );
}
