# ONEHEALTH — National One-Health Early Warning Platform (v1, frontend only)

All data is mock and labeled "Prototype / Synthetic Data". No login, no backend.

## Pages
1. **Home (/)** — hero "From fragmented signals to early action.", Human + Animal + Environment → AI Risk Intelligence → Early Warning flow, stat cards, how it works, safety disclaimer, CTAs to Risk Map and Authority Dashboard. Includes the showcase panel: Risk 82/100, Confidence 78%, "Why" bars (Rainfall +21, Fever cluster +19, Waterlogging +17, Historical +12, Population +9, Animal +8), "Early warning triggered", recommended actions.
2. **Risk Map (/map)** — full-width India map with district markers/circles colored by risk, search, filter chips (Overall, Human, Animal, Environment, Vector, Water, Respiratory, Zoonotic), legend Low/Moderate/High/Critical, click opens side panel linking to district page.
3. **District Detail (/district/$id, default Kolkata)** — risk index, category, confidence, trend chart, human/animal/environment signals, weather, population density, historical disease trend, satellite indicators, seasonal events, "Why is the risk high?" bars, 14-day timeline with threshold line and alert markers.
4. **Early Warnings (/warnings)** — active warning cards: level, location, date, signals, confidence, actions.
5. **Authority Dashboard (/dashboard)** — national overview, KPI cards, hotspots, active alerts, map, sortable ranking table; selecting a district updates panels; recommendations and alert history.
6. **Methodology (/methodology)** — each data source, what is live vs synthetic.
7. **About & Trust (/about)** — One Health concept, privacy, no diagnosis, aggregated outputs, decision-support only.

## Sample districts
Kolkata, North 24 Parganas, Nadia, Mumbai, Delhi, Guwahati, Ernakulam (Kerala), plus ~10 more for map density.

## Design
Light theme, restrained navy/teal, rounded cards, IBM Plex Sans + IBM Plex Mono for figures, dense gov-tech layout, persistent top nav with "Prototype data" badge.

## Technical
- Map: Leaflet + react-leaflet with OpenStreetMap/Carto light tiles, client-only lazy loaded; districts as circle markers (no heavy GeoJSON).
- Charts: Recharts.
- Mock data in `src/data/` typed modules; shared state via route params/search.
- Each route has its own head() metadata.
