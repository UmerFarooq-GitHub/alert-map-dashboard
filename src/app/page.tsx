"use client";

import Image from "next/image";
import { useState } from "react";
import { AlertRecord } from "@/types/alert";
import ExcelUploader from "@/components/alert-map/ExcelUploader";
import AlertMap from "@/components/alert-map/AlertMap";

export default function Home() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  return (
    <main className="min-h-screen bg-[#080b10] text-white p-4">
      <ExcelUploader onDataLoaded={setAlerts} />

      <div className="mb-4 rounded-2xl border border-slate-800 bg-[#111827] px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative h-14 w-40">
              <Image
                src="/nlcss-logo-white-transparent.png"
                alt="NLC Smart Solutions"
                fill
                className="object-contain object-left"
                priority
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Karachi Alert Hotspot Map
              </h1>
              <p className="text-sm text-slate-400">
                Focused operational view for high-alert locations
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 text-xs font-semibold">
            <Legend color="bg-orange-500" label="Unusual Halt" />
            <Legend color="bg-red-500" label="Route Deviation" />
            <Legend color="bg-yellow-400" label="Door Alerts" />
            <Legend color="bg-green-500" label="UnSync" />
            <Legend color="bg-purple-500" label="Deattached" />
          </div>
        </div>
      </div>
<div className="mb-4 rounded-xl border border-slate-700 bg-[#111827] px-4 py-3">
  <p className="text-xs text-slate-400">Data Source</p>
  <p className="text-sm font-bold text-emerald-400">
    Data Loaded Successfully
  </p>
</div>
      <section className="h-[calc(100vh-135px)] rounded-2xl border border-gray-800 bg-[#111827] overflow-hidden">
        <AlertMap alerts={alerts} />
      </section>
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-slate-300">{label}</span>
    </div>
  );
}