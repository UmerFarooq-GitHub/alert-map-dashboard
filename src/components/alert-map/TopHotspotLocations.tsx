"use client";

import { AlertRecord } from "@/types/alert";
import {
  getTopHotspots,
  TARGET_ALERT_TYPES,
} from "@/utils/hotspotAnalysis";

type Props = {
  alerts: AlertRecord[];
};

function getBadgeColor(alertType: string) {
  if (alertType === "Unusual Halt") return "bg-orange-500";
  if (alertType === "Route Deviation") return "bg-red-500";
  if (alertType === "Door Alerts") return "bg-yellow-500";
  if (alertType === "UnSync") return "bg-green-500";
  if (alertType === "Deattached") return "bg-purple-500";

  return "bg-blue-500";
}

export default function TopHotspotLocations({ alerts }: Props) {
  const rows = getTopHotspots(alerts, 10);

  return (
    <section className="mt-4 rounded-2xl bg-[#111827] p-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Top Alert Generating Locations
        </h2>
        <p className="text-sm text-gray-400">
          Ranked hotspots by alert type for route correction and operations review
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {TARGET_ALERT_TYPES.map((type) => {
          const typeRows = rows.filter((row) => row.alertType === type);

          return (
            <div key={type} className="rounded-2xl bg-[#0b1220] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-white">
                  {type}
                </h3>

                <span className={`rounded-full ${getBadgeColor(type)} px-3 py-1 text-xs font-bold text-black`}>
                  Top 10
                </span>
              </div>

              <div className="space-y-2">
                {typeRows.length === 0 && (
                  <p className="text-sm text-gray-500">No hotspot found</p>
                )}

                {typeRows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl bg-[#1f2937] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        #{row.rank} Grid {row.areaKey}
                      </p>

                      <p className={`rounded-lg ${getBadgeColor(type)} px-2 py-1 text-xs font-bold text-black`}>
                        {row.count.toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Lat {row.latitude} | Lon {row.longitude} | {row.percentage}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}