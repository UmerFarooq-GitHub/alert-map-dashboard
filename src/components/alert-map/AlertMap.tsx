"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { Map, MapLayerMouseEvent, Popup } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";
import { AlertRecord } from "@/types/alert";
import { isKarachiRegion } from "@/utils/alertFilters";
import { normalizeAlertType } from "@/utils/hotspotAnalysis";

type Props = {
  alerts: AlertRecord[];
};

function getAlertColor(alertType: string | null) {
  if (alertType === "Unusual Halt") return "#f97316";
  if (alertType === "Route Deviation") return "#ef4444";
  if (alertType === "Door Alerts") return "#eab308";
  if (alertType === "UnSync") return "#22c55e";
  if (alertType === "Deattached") return "#8b5cf6";

  return "#64748b";
}

export default function AlertMap({ alerts }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const isMapLoadedRef = useRef(false);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(isKarachiRegion)
      .map((alert) => ({
        ...alert,
        normalizedType: normalizeAlertType(alert.alertName),
      }))
      .filter((alert) => alert.normalizedType !== null);
  }, [alerts]);

  const geoJson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: filteredAlerts.map((alert) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [alert.longitude, alert.latitude],
        },
        properties: {
          id: alert.id,
          alertType: alert.normalizedType,
          originalAlertName: alert.alertName,
          timePkt: alert.timePkt,
          vehicle: alert.vehicleRegistrationNumber,
          containerId: alert.containerId,
          alertStatus: alert.alertStatus,
          color: getAlertColor(alert.normalizedType),
        },
      })),
    } as FeatureCollection<Point>;
  }, [filteredAlerts]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [67.065, 24.9],
      zoom: 10.7,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      isMapLoadedRef.current = true;
      map.addSource("alerts", {
  type: "geojson",
  data: geoJson,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 45,
  clusterProperties: {
    unusualHalt: ["+", ["case", ["==", ["get", "alertType"], "Unusual Halt"], 1, 0]],
    routeDeviation: ["+", ["case", ["==", ["get", "alertType"], "Route Deviation"], 1, 0]],
    doorAlerts: ["+", ["case", ["==", ["get", "alertType"], "Door Alerts"], 1, 0]],
    unsync: ["+", ["case", ["==", ["get", "alertType"], "UnSync"], 1, 0]],
    deattached: ["+", ["case", ["==", ["get", "alertType"], "Deattached"], 1, 0]],
  },
});

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "alerts",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
  "case",

  [
    ">=",
    ["get", "routeDeviation"],
    ["max", ["get", "unusualHalt"], ["get", "doorAlerts"], ["get", "unsync"], ["get", "deattached"]],
  ],
  "#ef4444",

  [
    ">=",
    ["get", "unusualHalt"],
    ["max", ["get", "routeDeviation"], ["get", "doorAlerts"], ["get", "unsync"], ["get", "deattached"]],
  ],
  "#f97316",

  [
    ">=",
    ["get", "doorAlerts"],
    ["max", ["get", "routeDeviation"], ["get", "unusualHalt"], ["get", "unsync"], ["get", "deattached"]],
  ],
  "#eab308",

  [
    ">=",
    ["get", "unsync"],
    ["max", ["get", "routeDeviation"], ["get", "unusualHalt"], ["get", "doorAlerts"], ["get", "deattached"]],
  ],
  "#22c55e",

  "#8b5cf6",
],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            100,
            25,
            500,
            35,
            1000,
            45,
          ],
          "circle-opacity": 0.88,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "alerts",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "alert-points",
        type: "circle",
        source: "alerts",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
  "match",
  ["get", "alertType"],
  "Unusual Halt",
  "#f97316",
  "Route Deviation",
  "#ef4444",
  "Door Alerts",
  "#eab308",
  "UnSync",
  "#22c55e",
  "Deattached",
  "#8b5cf6",
  "#64748b",
],
          "circle-radius": 7,
          "circle-opacity": 0.95,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    });

    map.on("click", "clusters", async (e: MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });

      const feature = features[0];
      if (!feature) return;

      const clusterId = feature.properties?.cluster_id;
      const source = map.getSource("alerts") as maplibregl.GeoJSONSource;
      const geometry = feature.geometry as Point;

      if (!source || clusterId === undefined) return;

      const zoom = await source.getClusterExpansionZoom(clusterId);

      map.easeTo({
        center: geometry.coordinates as [number, number],
        zoom,
      });
    });

    map.on("click", "alert-points", (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;

      const props = feature.properties as any;
      const coordinates = feature.geometry.coordinates as [number, number];

      if (popupRef.current) popupRef.current.remove();

      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "340px",
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="background:#111827;color:white;padding:14px;border-radius:12px;font-family:Arial">
            <div style="font-size:15px;font-weight:800;margin-bottom:8px;color:${props.color}">
              ${props.alertType}
            </div>
            <div style="font-size:12px;line-height:1.8;color:#e5e7eb">
              <b>Original Alert:</b> ${props.originalAlertName || "-"}<br/>
              <b>Time:</b> ${props.timePkt || "-"}<br/>
              <b>Vehicle:</b> ${props.vehicle || "-"}<br/>
              <b>Container:</b> ${props.containerId || "-"}<br/>
              <b>Status:</b> ${props.alertStatus || "-"}<br/>
              <b>Latitude:</b> ${coordinates[1]}<br/>
              <b>Longitude:</b> ${coordinates[0]}
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "alert-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "alert-points", () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const updateMapData = () => {
    const source = map.getSource("alerts") as maplibregl.GeoJSONSource | undefined;

    if (source) {
      source.setData(geoJson);
    }
  };

  if (isMapLoadedRef.current && map.getSource("alerts")) {
    updateMapData();
  } else {
    map.once("load", updateMapData);
  }
}, [geoJson]);

  return (
  <div className="relative h-full w-full">
    {filteredAlerts.length === 0 && (
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-black/80 px-4 py-3 text-sm text-yellow-300">
        Loading Karachi alert points...
      </div>
    )}

    <div ref={mapContainerRef} className="h-full w-full" />
  </div>
);
}