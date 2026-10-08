import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { districts, level, type Layer } from "@/data/districts";
import { levelVar } from "./ui";

export default function RiskMap({ layer, selected, onSelect, height = "100%", ids }: {
  layer: Layer; selected?: string; onSelect: (id: string) => void; height?: string; ids?: string[];
}) {
  const list = ids ? districts.filter((d) => ids.includes(d.id)) : districts;
  return (
    <MapContainer center={[22.5, 81]} zoom={5} minZoom={4} style={{ height, width: "100%" }} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {list.map((d) => {
        const s = d.scores[layer];
        const c = levelVar[level(s)];
        return (
          <CircleMarker key={d.id + layer} center={[d.lat, d.lng]} radius={8 + s / 7}
            pathOptions={{ color: selected === d.id ? "var(--navy)" : c, weight: selected === d.id ? 3 : 1.5, fillColor: c, fillOpacity: 0.55 }}
            eventHandlers={{ click: () => onSelect(d.id) }}>
            <Tooltip direction="top"><strong>{d.name}</strong> — {s}/100 ({level(s)})</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
