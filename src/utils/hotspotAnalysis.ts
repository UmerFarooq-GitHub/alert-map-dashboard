import { AlertRecord } from "@/types/alert";
import { isKarachiRegion } from "@/utils/alertFilters";

export type HotspotAlertType =
  | "Unusual Halt"
  | "Route Deviation"
  | "Door Alerts"
  | "UnSync"
  | "Deattached";

export type HotspotRow = {
  id: string;
  rank: number;
  alertType: HotspotAlertType;
  areaKey: string;
  count: number;
  latitude: number;
  longitude: number;
  percentage: number;
};

export const TARGET_ALERT_TYPES: HotspotAlertType[] = [
  "Unusual Halt",
  "Route Deviation",
  "Door Alerts",
  "UnSync",
  "Deattached",
];

export function normalizeAlertType(alertName: string): HotspotAlertType | null {
  const name = alertName.toLowerCase().trim();

  if (
    name.includes("unusual halt") ||
    name.includes("unusual_halt") ||
    name.includes("unusual stoppage") ||
    name.includes("stoppage") ||
    name.includes("halt")
  ) {
    return "Unusual Halt";
  }

  if (
    name.includes("route deviation") ||
    name.includes("route_deviation") ||
    name.includes("route")
  ) {
    return "Route Deviation";
  }

  if (
    name.includes("door")
  ) {
    return "Door Alerts";
  }

  if (
    name.includes("unsync") ||
    name.includes("un sync") ||
    name.includes("un_sync")
  ) {
    return "UnSync";
  }

  if (
    name.includes("detached") ||
    name.includes("deattached") ||
    name.includes("detach") ||
    name.includes("device detached")
  ) {
    return "Deattached";
  }

  return null;
}

/**
 * Rounds coordinates to group nearby alerts.
 * 0.002 degrees is roughly 200 meters.
 * Increase to 0.003 or 0.005 if you want wider hotspot zones.
 */
function getAreaKey(lat: number, lon: number) {
  const gridSize = 0.002;

  const gridLat = Math.round(lat / gridSize) * gridSize;
  const gridLon = Math.round(lon / gridSize) * gridSize;

  return `${gridLat.toFixed(4)}, ${gridLon.toFixed(4)}`;
}

export function getFilteredOperationalAlerts(alerts: AlertRecord[]) {
  return alerts
    .filter(isKarachiRegion)
    .map((alert) => ({
      ...alert,
      normalizedType: normalizeAlertType(alert.alertName),
    }))
    .filter((alert) => alert.normalizedType !== null);
}

export function getTopHotspots(alerts: AlertRecord[], topLimit = 10) {
  const operationalAlerts = getFilteredOperationalAlerts(alerts);

  const grouped = new Map<
    string,
    {
      alertType: HotspotAlertType;
      areaKey: string;
      count: number;
      latitudeSum: number;
      longitudeSum: number;
    }
  >();

  for (const alert of operationalAlerts) {
    const areaKey = getAreaKey(alert.latitude, alert.longitude);
    const alertType = alert.normalizedType as HotspotAlertType;
    const key = `${alertType}-${areaKey}`;

    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.latitudeSum += alert.latitude;
      existing.longitudeSum += alert.longitude;
    } else {
      grouped.set(key, {
        alertType,
        areaKey,
        count: 1,
        latitudeSum: alert.latitude,
        longitudeSum: alert.longitude,
      });
    }
  }

  const allRows = Array.from(grouped.values()).map((item) => ({
    alertType: item.alertType,
    areaKey: item.areaKey,
    count: item.count,
    latitude: Number((item.latitudeSum / item.count).toFixed(6)),
    longitude: Number((item.longitudeSum / item.count).toFixed(6)),
  }));

  const totalByType = new Map<HotspotAlertType, number>();

  for (const type of TARGET_ALERT_TYPES) {
    const total = allRows
      .filter((row) => row.alertType === type)
      .reduce((sum, row) => sum + row.count, 0);

    totalByType.set(type, total);
  }

  return TARGET_ALERT_TYPES.flatMap((type) =>
    allRows
      .filter((row) => row.alertType === type)
      .sort((a, b) => b.count - a.count)
      .slice(0, topLimit)
      .map((row, index) => ({
        id: `${row.alertType}-${row.areaKey}`,
        rank: index + 1,
        ...row,
        percentage: Number(
          ((row.count / (totalByType.get(type) || 1)) * 100).toFixed(2)
        ),
      }))
  );
}

export function getHotspotSummary(alerts: AlertRecord[]) {
  const operationalAlerts = getFilteredOperationalAlerts(alerts);

  return TARGET_ALERT_TYPES.map((type) => {
    const count = operationalAlerts.filter(
      (alert) => alert.normalizedType === type
    ).length;

    return {
      alertType: type,
      count,
    };
  });
}