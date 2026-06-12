"use client";

import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { AlertRecord } from "@/types/alert";

type Props = {
  onDataLoaded: (data: AlertRecord[]) => void;
};

export default function ExcelUploader({ onDataLoaded }: Props) {
  const [status, setStatus] = useState("Loading secured data...");

  async function loadStaticExcel() {
    const response = await fetch("/data/alerts-data.xlsx");
    const buffer = await response.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    const parsed: AlertRecord[] = rows
      .map((row, index) => ({
        id: String(row["Alert ID"] || index),
        timePkt: String(row["Time PKT"] || ""),
        tripId: String(row["Trip ID"] || ""),
        alertId: String(row["Alert ID"] || ""),
        alertName: String(row["Alert Name"] || ""),
        latitude: Number(row["Latitude"]),
        longitude: Number(row["Longitude"]),
        vehicleRegistrationNumber: String(row["VehicleRegistrationNumber"] || ""),
        containerId: String(row["Container ID"] || ""),
        alertStatus: String(row["Alert Status"] || ""),
      }))
      .filter(
        (row) =>
          Number.isFinite(row.latitude) &&
          Number.isFinite(row.longitude)
      );

    onDataLoaded(parsed);
    setStatus(`${parsed.length.toLocaleString()} secured records loaded`);
  }

  useEffect(() => {
    loadStaticExcel();
  }, []);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2">
      <p className="text-xs text-slate-400">Data Source</p>
      <p className="text-sm font-semibold text-green-400">{status}</p>
    </div>
  );
}