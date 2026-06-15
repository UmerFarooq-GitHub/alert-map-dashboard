"use client";

type Props = {
  selectedAlerts: string[];
  setSelectedAlerts: React.Dispatch<React.SetStateAction<string[]>>;
};

const alertTypes = [
  { label: "Unusual Halt", color: "#f97316" },
  { label: "Route Deviation", color: "#ef4444" },
  { label: "Door Alerts", color: "#eab308" },
  { label: "UnSync", color: "#22c55e" },
  { label: "Deattached", color: "#a855f7" },
];

export default function AlertFilters({
  selectedAlerts,
  setSelectedAlerts,
}: Props) {
  function toggleAlert(label: string) {
    setSelectedAlerts((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {alertTypes.map((alert) => {
        const checked = selectedAlerts.includes(alert.label);

        return (
          <label
            key={alert.label}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleAlert(alert.label)}
              className="h-4 w-4 accent-white"
            />

            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: alert.color }}
            />

            <span>{alert.label}</span>
          </label>
        );
      })}
    </div>
  );
}