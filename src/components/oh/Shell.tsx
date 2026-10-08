import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Activity, Menu, X } from "lucide-react";

const nav = [
  { to: "/map", label: "Risk Map" },
  { to: "/district/$id", label: "District", params: { id: "kolkata" } },
  { to: "/warnings", label: "Early Warnings" },
  { to: "/dashboard", label: "Authority Dashboard" },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About & Trust" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <div className="bg-navy py-1.5 text-center text-[11px] tracking-wide text-primary-foreground/85">
        Prototype platform · All figures are synthetic demonstration data · Not a medical diagnosis system
      </div>
      <header className="sticky top-0 z-[1000] border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Activity className="h-4 w-4" /></span>
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-bold tracking-[0.12em] text-foreground">ONEHEALTH</span>
              <span className="hidden truncate text-[10px] text-muted-foreground sm:block">National Early Warning & Risk Intelligence</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} params={"params" in n ? n.params : undefined as never}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-secondary font-medium !text-foreground" }}>{n.label}</Link>
            ))}
          </nav>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="grid border-t px-4 py-2 lg:hidden">
          {nav.map((n) => <Link key={n.label} to={n.to} params={"params" in n ? n.params : undefined as never} onClick={() => setOpen(false)} className="py-2 text-sm">{n.label}</Link>)}
        </nav>}
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t bg-card">
        <div className="mx-auto grid max-w-[1400px] gap-2 px-6 py-8 text-xs text-muted-foreground md:grid-cols-2">
          <p>ONEHEALTH — population-level risk intelligence for preparedness. Decision-support only; not individual medical advice.</p>
          <p className="md:text-right">Prototype build · Synthetic data · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
