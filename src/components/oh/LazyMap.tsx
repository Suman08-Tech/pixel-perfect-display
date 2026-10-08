import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { Layer } from "@/data/districts";

const RiskMap = lazy(() => import("./RiskMap"));

export function LazyMap(props: { layer: Layer; selected?: string; onSelect: (id: string) => void; height?: string }) {
  const fallback = <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground" style={{ height: props.height }}>Loading map…</div>;
  return <ClientOnly fallback={fallback}><Suspense fallback={fallback}><RiskMap {...props} /></Suspense></ClientOnly>;
}
