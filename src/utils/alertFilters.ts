import { AlertRecord } from "@/types/alert";

export function isKarachiRegion(alert: AlertRecord) {
  const lat = alert.latitude;
  const lon = alert.longitude;

  return (
    lat >= 24.70 &&
    lat <= 25.40 &&
    lon >= 66.70 &&
    lon <= 67.60
  );
}