import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { Card } from "@/components/oh/ui";
import { dbAssessmentsQuery, dbDistrictsQuery, dbObservationsQuery } from "@/lib/onehealth-db";

function State({ q, empty, children }: { q: { isPending: boolean; isError: boolean; error: unknown; data?: unknown[] }; empty: string; children: React.ReactNode }) {
  if (q.isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.isError) return <p className="text-sm text-risk-critical">Couldn't load: {(q.error as Error)?.message ?? "unknown error"}</p>;
  if (!q.data?.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <>{children}</>;
}

const SynthFlag = ({ synthetic }: { synthetic: boolean }) =>
  synthetic ? <span className="ml-2 rounded border border-dashed border-teal/50 bg-accent px-1.5 text-[10px] uppercase tracking-wider text-accent-foreground">Prototype / Synthetic Data</span> : null;

/** Records read live from the connected database. Shows only what is stored — nothing is generated here. */
export function DbRecords({ districtId }: { districtId?: string }) {
  const dq = useQuery(dbDistrictsQuery());
  const oq = useQuery(dbObservationsQuery(districtId));
  const aq = useQuery(dbAssessmentsQuery(districtId));
  const districts = districtId ? dq.data?.filter((d) => d.id === districtId) : dq.data;

  return (
    <Card title={<span className="flex items-center gap-2"><Database className="h-4 w-4 text-teal" />Database records</span>}
      action={<span className="text-xs text-muted-foreground">Live from database</span>}>
      <div className="grid gap-5 md:grid-cols-3 text-sm">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Districts</p>
          <State q={{ ...dq, data: districts }} empty={districtId ? "This district is not in the database yet." : "No districts in the database."}>
            <ul className="space-y-1">{districts?.map((d) => <li key={d.id}><span className="font-medium">{d.name}</span> <span className="text-muted-foreground">· {d.state}</span></li>)}</ul>
          </State>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Environmental observations</p>
          <State q={oq} empty="No observations recorded yet.">
            <ul className="space-y-1.5">{oq.data?.slice(0, 5).map((o) => (
              <li key={o.id}><span className="num">{new Date(o.observed_at).toLocaleDateString("en-IN")}</span> · {o.district_id} — {o.temperature_c ?? "–"}°C, {o.rainfall_mm ?? "–"} mm, {o.humidity_pct ?? "–"}%<SynthFlag synthetic={o.is_synthetic} /></li>
            ))}</ul>
          </State>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk assessments</p>
          <State q={aq} empty="No risk assessments recorded yet.">
            <ul className="space-y-1.5">{aq.data?.slice(0, 5).map((a) => (
              <li key={a.id}><span className="num">{new Date(a.calculated_at).toLocaleDateString("en-IN")}</span> · {a.district_id} — <span className="num font-semibold">{a.risk_score}</span> ({a.risk_level})<SynthFlag synthetic={a.is_synthetic} /></li>
            ))}</ul>
          </State>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Scores, charts and warnings elsewhere on this page are Prototype / Synthetic Data, not real measurements.</p>
    </Card>
  );
}
