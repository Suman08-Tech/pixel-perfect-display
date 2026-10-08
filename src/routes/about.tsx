import { createFileRoute } from "@tanstack/react-router";
import { Bird, Leaf, Lock, ShieldCheck, Stethoscope, Users, Scale } from "lucide-react";
import { Card, PageHeader } from "@/components/oh/ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Trust — ONEHEALTH" },
      { name: "description", content: "The One Health concept, data privacy, and why ONEHEALTH provides decision-support — never individual medical diagnosis." },
      { property: "og:title", content: "About & Trust — ONEHEALTH" },
      { property: "og:description", content: "Privacy-preserving, population-level, decision-support intelligence." },
    ],
  }),
  component: About,
});

function About() {
  const items = [
    { i: Lock, t: "Data privacy", d: "Only aggregated, de-identified counts are processed. No personal health records are stored or displayed." },
    { i: Stethoscope, t: "No individual diagnosis", d: "The platform never assesses or diagnoses individuals. If you are unwell, see a qualified clinician." },
    { i: Users, t: "Aggregated public outputs", d: "Public views show district-level risk only, with small-number suppression to prevent re-identification." },
    { i: Scale, t: "Decision-support, not decisions", d: "AI outputs inform human experts. Public health, veterinary and municipal officers make all response decisions." },
  ];
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      <PageHeader eyebrow="About & trust" title="One Health, made actionable" desc="Most emerging infections cross between people, animals and the environment. ONEHEALTH watches all three together." />
      <Card>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <p className="text-sm leading-relaxed text-muted-foreground">The <strong className="text-foreground">One Health</strong> approach recognises that human health is tied to animal health and our shared environment. Floods spread water-borne disease; stagnant water breeds mosquitoes; sick livestock can signal zoonotic spillover. Reading these signals together gives earlier, more reliable warnings than any single system alone.</p>
          <div className="flex justify-center gap-3">
            {[[Stethoscope, "Human"], [Bird, "Animal"], [Leaf, "Environment"]].map(([I, l]) => { const Icon = I as typeof Leaf; return <div key={l as string} className="grid h-20 w-20 place-items-center rounded-full bg-accent text-center text-xs font-medium text-accent-foreground"><span><Icon className="mx-auto mb-1 h-5 w-5" />{l as string}</span></div>; })}
          </div>
        </div>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((x) => <Card key={x.t}><x.i className="h-5 w-5 text-teal" /><p className="mt-3 font-semibold">{x.t}</p><p className="mt-1 text-sm text-muted-foreground">{x.d}</p></Card>)}
      </div>
      <div className="mt-6 flex gap-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-teal" />This is a prototype. All figures are synthetic and should not be used for real-world decisions.</div>
    </div>
  );
}
