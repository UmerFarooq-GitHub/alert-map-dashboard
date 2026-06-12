import { AlertRecord } from "@/types/alert";

export function isKarachiRegion(alert: AlertRecord) {
  const lat = alert.latitude;
  const lon = alert.longitude;

  return (
    lat >= 24.3 &&
    lat <= 25.6 &&
    lon >= 66.3 &&
    lon <= 68.3
  );
}