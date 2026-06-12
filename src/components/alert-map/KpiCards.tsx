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

  const unusualHaltCleared = karachiAlerts.filter((a) =>
  a.alertName.toLowerCase().includes("unusual_halt_cleared") ||
  a.alertName.toLowerCase().includes("halt cleared")
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
    bg: "bg-[#3b82f6]",
  },
  {
    label: "Route Deviation",
    value: routeDeviation,
    bg: "bg-[#ef4444]",
  },
  {
    label: "Unusual Stoppage",
    value: stoppage,
    bg: "bg-[#f59e0b]",
  },
  {
    label: "Unusual Halt Cleared",
    value: unusualHaltCleared,
    bg: "bg-[#22c55e]",
  },
  {
    label: "Device Detached",
    value: detached,
    bg: "bg-[#8b5cf6]",
  },
  {
    label: "Door Alerts",
    value: door,
    bg: "bg-[#eab308]",
  },
];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
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