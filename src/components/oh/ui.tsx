import type { ReactNode } from "react";
import { level, type Level, type Contribution } from "@/data/districts";
import { cn } from "@/lib/utils";

export const levelClass: Record<Level, string> = {
  Low: "bg-risk-low/15 text-risk-low border-risk-low/30",
  Moderate: "bg-risk-moderate/20 text-foreground border-risk-moderate/50",
  High: "bg-risk-high/15 text-risk-high border-risk-high/40",
  Critical: "bg-risk-critical/12 text-risk-critical border-risk-critical/40",
};
export const levelVar: Record<Level, string> = {
  Low: "var(--risk-low)", Moderate: "var(--risk-moderate)", High: "var(--risk-high)", Critical: "var(--risk-critical)",
};
export const scoreColor = (s: number) => levelVar[level(s)];

export function LevelBadge({ lvl, className }: { lvl: Level; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", levelClass[lvl], className)}>
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: levelVar[lvl] }} />{lvl}
  </span>;
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return <section className={cn("rounded-2xl border bg-card p-5 shadow-[0_1px_2px_oklch(0.3_0.05_250/0.04)]", className)}>
    {title && <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>{action}</div>}
    {children}
  </section>;
}

export function SyntheticTag() {
  return <span className="inline-flex items-center rounded-md border border-dashed border-teal/50 bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">Prototype / Synthetic Data</span>;
}

export function WhyBars({ items }: { items: Contribution[] }) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((i) => i.value));
  return <ul className="space-y-2.5">
    {sorted.map((c) => (
      <li key={c.factor} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3 text-sm">
        <span className="truncate text-muted-foreground">{c.factor}</span>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-teal to-primary" style={{ width: `${(c.value / max) * 100}%` }} /></div>
        <span className="num text-right font-semibold text-foreground">+{c.value}</span>
      </li>
    ))}
  </ul>;
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r;
  return <svg width={size} height={size} className="shrink-0">
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth="10" strokeLinecap="round"
      strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    <text x="50%" y="48%" textAnchor="middle" className="num" style={{ fontSize: size / 3.6, fontWeight: 600, fill: "var(--foreground)" }}>{score}</text>
    <text x="50%" y="66%" textAnchor="middle" style={{ fontSize: 11, fill: "var(--muted-foreground)" }}>/ 100</text>
  </svg>;
}

export function PageHeader({ eyebrow, title, desc, right }: { eyebrow: string; title: string; desc?: string; right?: ReactNode }) {
  return <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
      {desc && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
    </div>
    {right}
  </div>;
}
