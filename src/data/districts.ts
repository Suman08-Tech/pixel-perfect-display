// PROTOTYPE / SYNTHETIC DATA — not real surveillance figures.
export type Level = "Low" | "Moderate" | "High" | "Critical";
export type Layer =
  | "overall" | "human" | "animal" | "environment"
  | "vector" | "water" | "respiratory" | "zoonotic";

export const LAYERS: { id: Layer; label: string }[] = [
  { id: "overall", label: "Overall Risk" },
  { id: "human", label: "Human Health" },
  { id: "animal", label: "Animal Health" },
  { id: "environment", label: "Environment" },
  { id: "vector", label: "Vector-borne" },
  { id: "water", label: "Water-borne" },
  { id: "respiratory", label: "Respiratory" },
  { id: "zoonotic", label: "Zoonotic" },
];

export interface Contribution { factor: string; value: number }
export interface District {
  id: string; name: string; state: string; lat: number; lng: number;
  population: number; density: number;
  scores: Record<Layer, number>;
  confidence: number;
  why: Contribution[];
  human: { label: string; value: string; delta: number }[];
  animal: { label: string; value: string; delta: number }[];
  environment: { label: string; value: string; delta: number }[];
  weather: { temp: number; humidity: number; rain7d: number; forecast: string };
  satellite: { ndwi: number; floodExtent: number; ndvi: number; lst: number };
  events: string[];
  actions: string[];
}

export function level(score: number): Level {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

function seed(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000; }

const base: [string, string, string, number, number, number, number, number, number][] = [
  // id, name, state, lat, lng, pop(M), density, overall, confidence
  ["kolkata", "Kolkata", "West Bengal", 22.57, 88.36, 4.5, 24252, 82, 78],
  ["north-24-parganas", "North 24 Parganas", "West Bengal", 22.86, 88.54, 10.0, 2445, 74, 72],
  ["nadia", "Nadia", "West Bengal", 23.47, 88.55, 5.2, 1316, 63, 69],
  ["mumbai", "Mumbai", "Maharashtra", 19.08, 72.88, 12.4, 20694, 68, 81],
  ["delhi", "New Delhi", "Delhi", 28.61, 77.21, 16.8, 11320, 57, 84],
  ["guwahati", "Kamrup Metro (Guwahati)", "Assam", 26.14, 91.74, 1.3, 1313, 71, 66],
  ["ernakulam", "Ernakulam", "Kerala", 9.98, 76.30, 3.3, 1072, 66, 80],
  ["chennai", "Chennai", "Tamil Nadu", 13.08, 80.27, 7.1, 26903, 52, 79],
  ["bengaluru", "Bengaluru Urban", "Karnataka", 12.97, 77.59, 9.6, 4381, 38, 82],
  ["hyderabad", "Hyderabad", "Telangana", 17.39, 78.49, 6.8, 18172, 44, 77],
  ["patna", "Patna", "Bihar", 25.59, 85.14, 5.8, 1803, 61, 63],
  ["lucknow", "Lucknow", "Uttar Pradesh", 26.85, 80.95, 4.6, 1815, 47, 70],
  ["jaipur", "Jaipur", "Rajasthan", 26.91, 75.79, 6.6, 598, 29, 74],
  ["ahmedabad", "Ahmedabad", "Gujarat", 23.02, 72.57, 7.2, 890, 33, 76],
  ["bhubaneswar", "Khordha (Bhubaneswar)", "Odisha", 20.30, 85.82, 2.3, 800, 58, 68],
  ["pune", "Pune", "Maharashtra", 18.52, 73.86, 9.4, 603, 36, 78],
  ["srinagar", "Srinagar", "Jammu & Kashmir", 34.08, 74.80, 1.3, 703, 22, 65],
  ["imphal", "Imphal West", "Manipur", 24.82, 93.94, 0.5, 998, 49, 58],
];

const kolkataWhy: Contribution[] = [
  { factor: "Rainfall", value: 21 }, { factor: "Fever cluster", value: 19 },
  { factor: "Waterlogging", value: 17 }, { factor: "Historical similarity", value: 12 },
  { factor: "Population context", value: 9 }, { factor: "Animal signals", value: 8 },
  { factor: "Event context", value: 4 },
];

export const districts: District[] = base.map(([id, name, state, lat, lng, pop, density, overall, confidence]) => {
  const r = seed(id);
  const j = (spread: number) => Math.max(5, Math.min(98, Math.round(overall + (r() - 0.5) * spread)));
  const scale = overall / 82;
  const why = id === "kolkata" ? kolkataWhy : kolkataWhy.map((c) => ({ factor: c.factor, value: Math.max(1, Math.round(c.value * scale * (0.6 + r() * 0.8))) }));
  return {
    id, name, state, lat, lng, population: pop * 1e6, density, confidence,
    scores: { overall, human: j(20), animal: j(30), environment: j(20), vector: j(25), water: j(25), respiratory: j(35), zoonotic: j(35) },
    why,
    human: [
      { label: "Acute fever reports (7d)", value: `${Math.round(120 + overall * 9 * r())}`, delta: Math.round(overall / 3) },
      { label: "Diarrhoeal cases (7d)", value: `${Math.round(40 + overall * 3 * r())}`, delta: Math.round(overall / 5) },
      { label: "OPD respiratory visits", value: `${Math.round(300 + 600 * r())}`, delta: Math.round((r() - 0.3) * 20) },
      { label: "Lab-confirmed dengue", value: `${Math.round(overall * 0.6 * r())}`, delta: Math.round(overall / 6) },
    ],
    animal: [
      { label: "Livestock illness reports", value: `${Math.round(10 + 50 * r())}`, delta: Math.round((r() - 0.2) * 30) },
      { label: "Poultry mortality events", value: `${Math.round(5 * r())}`, delta: Math.round((r() - 0.5) * 10) },
      { label: "Stray dog bite reports", value: `${Math.round(20 + 80 * r())}`, delta: Math.round((r() - 0.4) * 15) },
    ],
    environment: [
      { label: "Stagnant water sites", value: `${Math.round(overall * 2.4)}`, delta: Math.round(overall / 4) },
      { label: "Water quality (coliform+)", value: `${Math.round(r() * 30)}% samples`, delta: Math.round(r() * 12) },
      { label: "AQI (PM2.5)", value: `${Math.round(60 + 140 * r())}`, delta: Math.round((r() - 0.5) * 20) },
    ],
    weather: { temp: Math.round(26 + 8 * r()), humidity: Math.round(60 + 35 * r()), rain7d: Math.round(overall * 2.6 * r() + 20), forecast: overall > 60 ? "Heavy rain likely next 72h" : "Partly cloudy, light showers" },
    satellite: { ndwi: +(0.1 + overall / 250).toFixed(2), floodExtent: +(overall / 12 * r()).toFixed(1), ndvi: +(0.2 + r() * 0.4).toFixed(2), lst: Math.round(30 + 8 * r()) },
    events: id === "kolkata" ? ["Durga Puja mass gatherings (Oct)", "Post-monsoon breeding season", "Pandal water storage"] : ["Post-monsoon season", r() > 0.5 ? "Regional festival gatherings" : "School term in session"],
    actions: [
      "Intensify vector source reduction in waterlogged wards",
      "Activate fever surveillance at primary health centres",
      "Issue public advisory on stagnant water & mosquito protection",
      "Coordinate veterinary checks in peri-urban livestock clusters",
      "Pre-position ORS, test kits and IV fluids at district hospitals",
    ].slice(0, overall > 60 ? 5 : 3),
  };
});

export const getDistrict = (id: string) => districts.find((d) => d.id === id);

export interface TimelinePoint { day: string; score: number; alert?: boolean; note?: string }
export function timeline(d: District): TimelinePoint[] {
  const r = seed(d.id + "t");
  const pts: TimelinePoint[] = [];
  const start = d.scores.overall - 30;
  for (let i = 0; i < 14; i++) {
    const date = new Date(2026, 9, 9 - 13 + i);
    const score = Math.round(start + (30 * i) / 13 + (r() - 0.5) * 6);
    pts.push({ day: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), score: i === 13 ? d.scores.overall : score });
  }
  const cross = pts.findIndex((p) => p.score >= 75);
  if (cross >= 0) { pts[cross].alert = true; pts[cross].note = "Threshold crossed — warning issued"; }
  pts[7]!.note = pts[7]!.note ?? "Rainfall spike detected";
  return pts;
}

export function history(d: District) {
  const r = seed(d.id + "h");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({
    month: m,
    avg: Math.round(20 + 50 * Math.max(0, Math.sin((i - 4) / 3)) * (d.scores.overall / 82)),
    current: i <= 9 ? Math.round(20 + 55 * Math.max(0, Math.sin((i - 4) / 3)) * (d.scores.overall / 82) + (r() - 0.5) * 8) : undefined,
  }));
}

export const warnings = districts
  .filter((d) => d.scores.overall >= 55)
  .sort((a, b) => b.scores.overall - a.scores.overall)
  .map((d, i) => ({
    id: `W-2026-${1040 + i}`, district: d, level: level(d.scores.overall),
    detected: new Date(2026, 9, 9 - i).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    signals: [...d.why].sort((a, b) => b.value - a.value).slice(0, 3).map((w) => w.factor),
  }));

export const alertHistory = [
  { date: "09 Oct 2026", district: "Kolkata", type: "Vector-borne", level: "Critical" as Level, status: "Active" },
  { date: "08 Oct 2026", district: "North 24 Parganas", type: "Water-borne", level: "High" as Level, status: "Active" },
  { date: "06 Oct 2026", district: "Kamrup Metro (Guwahati)", type: "Vector-borne", level: "High" as Level, status: "Active" },
  { date: "02 Oct 2026", district: "Mumbai", type: "Leptospirosis (Zoonotic)", level: "High" as Level, status: "Monitoring" },
  { date: "27 Sep 2026", district: "Ernakulam", type: "Zoonotic", level: "High" as Level, status: "Monitoring" },
  { date: "19 Sep 2026", district: "Patna", type: "Water-borne", level: "Moderate" as Level, status: "Resolved" },
  { date: "11 Sep 2026", district: "New Delhi", type: "Respiratory", level: "Moderate" as Level, status: "Resolved" },
];
