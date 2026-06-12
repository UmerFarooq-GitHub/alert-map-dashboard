import { AlertRecord } from "@/types/alert";

export function isKarachiRegion(alert: AlertRecord) {
  const lat = alert.latitude;
  const lon = alert.longitude;

  const inKarachiArea =
    lat >= 24.72 &&
    lat <= 25.20 &&
    lon >= 66.80 &&
    lon <= 67.55;

  const isArabianSeaSide =
    lat < 24.78 && lon < 67.05;

  const isOpenSeaWest =
    lon < 66.95 && lat < 24.90;

  return inKarachiArea && !isArabianSeaSide && !isOpenSeaWest;
}