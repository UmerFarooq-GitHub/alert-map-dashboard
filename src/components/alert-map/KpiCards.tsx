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
    bg: "bg-[#10b981]",
    text: "text-white",
  },
  {
    label: "Route Deviation",
    value: routeDeviation,
    bg: "bg-[#ef4444]",
    text: "text-white",
  },
  {
    label: "Unusual Stoppage",
    value: stoppage,
    bg: "bg-[#f59e0b]",
    text: "text-white",
  },
  {
    label: "Device Detached",
    value: detached,
    bg: "bg-[#8b5cf6]",
    text: "text-white",
  },
  {
    label: "Door Alerts",
    value: door,
    bg: "bg-[#eab308]",
    text: "text-white",
  },
];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {cards.map((card) => (
        <div
  key={card.label}
  className={`rounded-[28px] ${card.bg} p-6 shadow-xl`}
>
  <p className="text-xs uppercase tracking-wider text-black/70 font-semibold">
    {card.label}
  </p>

  <p className="mt-3 text-4xl font-extrabold text-white">
    {card.value.toLocaleString()}
  </p>
</div>
      ))}
    </div>
  );
}