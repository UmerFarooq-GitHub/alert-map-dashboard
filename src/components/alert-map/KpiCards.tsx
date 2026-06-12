"use client";

import { AlertRecord } from "@/types/alert";
import { getHotspotSummary } from "@/utils/hotspotAnalysis";

type Props = {
  alerts: AlertRecord[];
};

function getCardColor(alertType: string) {
  if (alertType === "Unusual Halt") return "bg-[#f97316]";
  if (alertType === "Route Deviation") return "bg-[#ef4444]";
  if (alertType === "Door Alerts") return "bg-[#eab308]";
  if (alertType === "UnSync") return "bg-[#22c55e]";
  if (alertType === "Deattached") return "bg-[#8b5cf6]";

  return "bg-[#3b82f6]";
}

export default function KpiCards({ alerts }: Props) {
  const cards = getHotspotSummary(alerts);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {cards.map((card) => (
        <div
          key={card.alertType}
          className={`rounded-[28px] ${getCardColor(
            card.alertType
          )} p-6 shadow-xl`}
        >
          <p className="text-xs uppercase tracking-wider text-black/70 font-bold">
            {card.alertType}
          </p>

          <p className="mt-3 text-4xl font-extrabold text-black/90">
            {card.count.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}