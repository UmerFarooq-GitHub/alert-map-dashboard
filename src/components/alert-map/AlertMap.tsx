"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { isKarachiRegion } from "@/utils/alertFilters";

import maplibregl, {
  GeoJSONSource,
  Map,
  MapLayerMouseEvent,
  Popup,
} from "maplibre-gl";

import type { FeatureCollection, Point } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import { AlertRecord } from "../../types/alert";

type Props = {
  alerts: AlertRecord[];
};

function getAlertColor(alertName: string) {
  const name = alertName.toLowerCase();

  if (name.includes("route")) return "#ef4444";
  if (name.includes("stoppage")) return "#f97316";
  if (name.includes("door")) return "#eab308";
  if (name.includes("detached")) return "#a855f7";

  return "#22c55e";
}

export default function AlertMap({ alerts }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const geoJson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: alerts.filter(isKarachiRegion).map((alert) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [alert.longitude, alert.latitude],
        },
        properties: {
          id: alert.id,
          timePkt: alert.timePkt,
          tripId: alert.tripId,
          alertId: alert.alertId,
          alertName: alert.alertName,
          vehicleRegistrationNumber: alert.vehicleRegistrationNumber,
          containerId: alert.containerId,
          alertStatus: alert.alertStatus,
          color: getAlertColor(alert.alertName),
        },
      })),
    } as FeatureCollection<Point>;
  }, [alerts]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [67.0011, 24.8607],
      zoom: 10.2,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      map.addSource("alerts", {
        type: "geojson",
        data: geoJson,
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 35,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "alerts",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#22c55e",
            100,
            "#eab308",
            500,
            "#f97316",
            1000,
            "#ef4444",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            100,
            25,
            500,
            32,
            1000,
            42,
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
          "text-font": ["Open Sans Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "alerts",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "heatmap",
        type: "heatmap",
        source: "alerts",
        maxzoom: 12,
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 3],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 12, 28],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.7, 12, 0],
        },
      });

      map.moveLayer("heatmap", "clusters");
    });

    map.on("click", "clusters", async (e: MapLayerMouseEvent) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["clusters"],
  });

  const feature = features[0];
  if (!feature) return;

  const clusterId = feature.properties?.cluster_id;
  const pointCount = feature.properties?.point_count;
  const source = map.getSource("alerts") as GeoJSONSource;
  const geometry = feature.geometry as Point;

  if (!source || clusterId === undefined) return;

  const zoom = await source.getClusterExpansionZoom(clusterId);

  if (zoom <= map.getZoom() + 0.5) {
    new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: "300px",
    })
      .setLngLat(geometry.coordinates as [number, number])
      .setHTML(`
        <div style="background:#111827;color:white;padding:12px;border-radius:10px;font-family:Arial">
          <b>${pointCount} alerts at this location</b><br/>
          <span style="font-size:12px;color:#cbd5e1">
            Multiple records share the same or nearby GPS coordinates.
          </span>
        </div>
      `)
      .addTo(map);

    return;
  }

  map.easeTo({
    center: geometry.coordinates as [number, number],
    zoom,
  });
});

    map.on("click", "unclustered-point", (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;

      const props = feature.properties as any;
      const coordinates = feature.geometry.coordinates as [number, number];

      if (popupRef.current) {
        popupRef.current.remove();
      }

      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "360px",
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="background:#111827;color:#fff;padding:12px;border-radius:10px;font-family:Arial">
            <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#93c5fd">
              ${props.alertName || "Alert Detail"}
            </div>
            <div style="font-size:12px;line-height:1.7">
              <b>Time PKT:</b> ${props.timePkt || "-"}<br/>
              <b>Trip ID:</b> ${props.tripId || "-"}<br/>
              <b>Alert ID:</b> ${props.alertId || "-"}<br/>
              <b>Vehicle:</b> ${props.vehicleRegistrationNumber || "-"}<br/>
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

    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "unclustered-point", () => {
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

    const updateSource = () => {
      const source = map.getSource("alerts") as GeoJSONSource | undefined;
      if (source) {
        source.setData(geoJson);
      }
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [geoJson]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10 rounded-xl border border-gray-700 bg-black/70 px-4 py-3 backdrop-blur">
        <p className="text-xs text-gray-400">Map Mode</p>
        <p className="text-sm font-semibold">Cluster + Heatmap + Click Details</p>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}