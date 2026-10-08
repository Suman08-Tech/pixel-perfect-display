import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin } from "lucide-react";
import { warnings } from "@/data/districts";
import { Card, LevelBadge, PageHeader, SyntheticTag } from "@/components/oh/ui";

export const Route = createFileRoute("/warnings")({
  head: () => ({
    meta: [
      { title: "Active Early Warnings — ONEHEALTH" },
      { name: "description", content: "Active One Health early warnings across Indian districts with contributing signals, confidence and preparedness actions." },
      { property: "og:title", content: "Active Early Warnings — ONEHEALTH" },
      { property: "og:description", content: "Graded preparedness alerts with explainable contributing signals." },
    ],
  }),
  component: Warnings,
});

function Warnings() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <PageHeader eyebrow="Early warning" title={`${warnings.length} active warnings`} desc="Issued when a district's risk index crosses its threshold. Each warning lists the signals that drove it." right={<SyntheticTag />} />
      <div className="grid gap-4 lg:grid-cols-2">
        {warnings.map((w) => (
          <Card key={w.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="num text-xs text-muted-foreground">{w.id} · detected {w.detected}</p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-lg font-semibold"><MapPin className="h-4 w-4 shrink-0 text-teal" />{w.district.name}<span className="font-normal text-muted-foreground">, {w.district.state}</span></p>
              </div>
              <div className="text-right"><LevelBadge lvl={w.level} /><p className="num mt-1 text-sm">{w.district.scores.overall}/100</p></div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contributing signals</p>
                <div className="flex flex-wrap gap-1.5">{w.signals.map((s) => <span key={s} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">{s}</span>)}</div>
                <p className="mt-3 text-xs text-muted-foreground">Confidence</p>
                <div className="mt-1 flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${w.district.confidence}%` }} /></div><span className="num text-xs font-semibold">{w.district.confidence}%</span></div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preparedness actions</p>
                <ul className="space-y-1">{w.district.actions.slice(0, 3).map((a) => <li key={a} className="flex gap-1.5 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />{a}</li>)}</ul>
              </div>
            </div>
            <Link to="/district/$id" params={{ id: w.district.id }} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">View district analysis →</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
