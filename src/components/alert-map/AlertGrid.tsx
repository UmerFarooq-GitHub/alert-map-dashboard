"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { AlertRecord } from "../../types/alert";



ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  alerts: AlertRecord[];
};

export default function AlertGrid({ alerts }: Props) {
  const columnDefs = useMemo<ColDef<AlertRecord>[]>(
    () => [
      { field: "timePkt", headerName: "Time PKT", filter: true },
      { field: "alertName", headerName: "Alert Name", filter: true },
      { field: "vehicleRegistrationNumber", headerName: "Vehicle", filter: true },
      { field: "containerId", headerName: "Container", filter: true },
      { field: "alertStatus", headerName: "Status", filter: true },
      { field: "latitude", headerName: "Latitude" },
      { field: "longitude", headerName: "Longitude" },
    ],
    []
  );

  return (
    <div className="h-full w-full p-3">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Alert Records</h2>
        <p className="text-xs text-gray-400">
          Sort, filter, and inspect Excel records
        </p>
      </div>

      <div className="ag-theme-quartz h-[610px] w-full">
        <AgGridReact
          rowData={alerts}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={50}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true,
          }}
        />
      </div>
    </div>
  );
}