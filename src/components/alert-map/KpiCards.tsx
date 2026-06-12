"use client";

import { AlertRecord } from "@/types/alert";
import { isKarachiRegion } from "@/utils/alertFilters";

type Props = {
  alerts: AlertRecord[];
};

export default function KpiCards({ alerts }: Props) {
  const karachiAlerts = alerts.filter(isKarachiRegion);

  const total = karachiAlerts.length;

  const routeDeviation = karachiAlerts.filter((a) =>
    a.alertName.toLowerCase().includes("route")
  ).length;

  const stoppage = karachiAlerts.filter((a) =>
    a.alertName.toLowerCase().includes("stoppage")
  ).length;

  const detached = karachiAlerts.filter((a) =>
    a.alertName.toLowerCase().includes("detached")
  ).length;

  const door = karachiAlerts.filter((a) =>
    a.alertName.toLowerCase().includes("door")
  ).length;

const cards = [
  {
    label: "Karachi Region Alerts",
    value: total,
    border: "border-emerald-500/60",
    bg: "bg-emerald-950/30",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-400",
  },
  {
    label: "Route Deviation",
    value: routeDeviation,
    border: "border-red-500/60",
    bg: "bg-red-950/30",
    glow: "shadow-red-500/20",
    text: "text-red-400",
  },
  {
    label: "Unusual Stoppage",
    value: stoppage,
    border: "border-orange-500/60",
    bg: "bg-orange-950/30",
    glow: "shadow-orange-500/20",
    text: "text-orange-400",
  },
  {
    label: "Device Detached",
    value: detached,
    border: "border-purple-500/60",
    bg: "bg-purple-950/30",
    glow: "shadow-purple-500/20",
    text: "text-purple-400",
  },
  {
    label: "Door Alerts",
    value: door,
    border: "border-yellow-500/60",
    bg: "bg-yellow-950/30",
    glow: "shadow-yellow-500/20",
    text: "text-yellow-400",
  },
];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border ${card.border} ${card.bg} p-4 shadow-lg ${card.glow}`}
        >
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {card.label}
          </p>

          <p className={`mt-2 text-2xl font-semibold ${card.text}`}>
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}