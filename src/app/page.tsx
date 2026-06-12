"use client";

import { useState } from "react";
import { AlertRecord } from "@/types/alert";
import ExcelUploader from "@/components/alert-map/ExcelUploader";
import KpiCards from "@/components/alert-map/KpiCards";
import AlertMap from "@/components/alert-map/AlertMap";
import AlertGrid from "@/components/alert-map/AlertGrid";
import Image from "next/image";

export default function Home() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
console.log("ALERTS STATE:", alerts.length);
  return (
    <main className="min-h-screen bg-[#080b10] text-white p-4">
      <div className="mb-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0b1220] via-[#111827] to-[#0b1220] shadow-xl">
  <div className="flex items-center justify-between px-6 py-4">

    <div className="flex items-center gap-4">

      <div className="relative h-14 w-52">
        <Image
          src="/nlcss-logo-white-transparent.png"
          alt="NLC Smart Solutions"
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">
          Alert Map
        </h1>

        <p className="text-sm text-slate-400">
          Route Deviation • Unusual Stoppage • Door Alerts • Device Detached
        </p>
      </div>

    </div>

    <ExcelUploader onDataLoaded={setAlerts} />

  </div>
</div>
      <ExcelUploader onDataLoaded={setAlerts} />
      <KpiCards alerts={alerts} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <section className="xl:col-span-2 h-[680px] rounded-2xl border border-gray-800 bg-[#111827] overflow-hidden">
          <AlertMap alerts={alerts} />
        </section>

        <section className="h-[680px] rounded-2xl border border-gray-800 bg-[#111827] overflow-hidden">
          <AlertGrid alerts={alerts} />
        </section>
        
      </div>
    </main>
  );
}