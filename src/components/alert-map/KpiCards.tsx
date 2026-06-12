"use client";

import { AlertRecord } from "../../types/alert";

type Props = {
  alerts: AlertRecord[];
};

export default function KpiCards({ alerts }: Props) {
  const total = alerts.length;

  const routeDeviation = alerts.filter((a) =>
    a.alertName.toLowerCase().includes("route")
  ).length;

  const stoppage = alerts.filter((a) =>
    a.alertName.toLowerCase().includes("stoppage")
  ).length;

  const detached = alerts.filter((a) =>
    a.alertName.toLowerCase().includes("detached")
  ).length;

  const door = alerts.filter((a) =>
    a.alertName.toLowerCase().includes("door")
  ).length;

  const cards = [
    { label: "Total Alerts", value: total },
    { label: "Route Deviation", value: routeDeviation },
    { label: "Unusual Stoppage", value: stoppage },
    { label: "Device Detached", value: detached },
    { label: "Door Alerts", value: door },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-800 bg-[#111827] p-4"
        >
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}