import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { level, type District } from "@/data/districts";
import { Card, LevelBadge, ScoreRing, SyntheticTag, WhyBars } from "./ui";

export function RiskBrief({ d, compact }: { d: District; compact?: boolean }) {
  const s = d.scores.overall;
  const triggered = s >= 75;
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
        <div className="min-w-0"><p className="text-xs text-muted-foreground">{d.state}</p><p className="truncate font-semibold">{d.name}</p></div>
        <SyntheticTag />
      </div>
      <div className={`grid gap-6 p-5 ${compact ? "" : "lg:grid-cols-[auto_minmax(0,1fr)]"}`}>
        <div className="flex items-center gap-5">
          <ScoreRing score={s} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Risk index</p>
            <LevelBadge lvl={level(s)} />
            <p className="text-sm"><span className="text-muted-foreground">Confidence </span><span className="num font-semibold">{d.confidence}%</span></p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why is the risk {level(s).toLowerCase()}?</p>
          <WhyBars items={d.why} />
        </div>
      </div>
      <div className={`grid gap-0 border-t ${compact ? "" : "md:grid-cols-2"}`}>
        <div className={`flex gap-3 p-5 ${triggered ? "bg-risk-critical/8" : "bg-muted/60"}`}>
          <AlertTriangle className={`h-5 w-5 shrink-0 ${triggered ? "text-risk-critical" : "text-muted-foreground"}`} />
          <div>
            <p className="font-semibold">{triggered ? "Early warning triggered" : "Below warning threshold (75)"}</p>
            <p className="text-sm text-muted-foreground">{triggered ? "Threshold of 75 crossed. Vector- and water-borne preparedness alert issued to district authorities." : "Continued monitoring; no alert issued."}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="mb-2 font-semibold">Recommended actions</p>
          <ul className="space-y-1.5">{d.actions.slice(0, compact ? 3 : 5).map((a) => <li key={a} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{a}</li>)}</ul>
          {compact && <Link to="/district/$id" params={{ id: d.id }} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Open full district view →</Link>}
        </div>
      </div>
    </Card>
  );
}
