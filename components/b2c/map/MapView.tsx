"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BusinessWithDistance } from "@/lib/types/map";

interface MapProps {
  businesses: BusinessWithDistance[];
  userLocation: { lat: number; lng: number } | null;
  selectedBusinessId: string | null;
  onBusinessSelect: (business: BusinessWithDistance) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  salon: "#f97316", // orange
  spa: "#ec4899", // pink
  dental: "#3b82f6", // blue
  yoga: "#22c55e", // green
  other: "#6b7280", // gray
};

const CATEGORY_ICONS: Record<string, string> = {
  salon: "✂️",
  spa: "🌸",
  dental: "🦷",
  yoga: "🧘",
  other: "📍",
};

const DEFAULT_CENTER = { lat: 47.8864, lng: 106.9057 }; // Ulaanbaatar

function createCustomMarker(category: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    border: 3px solid white;
    transition: transform 0.2s;
  `;
  el.innerHTML = CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
  
  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.2)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
  });
  
  return el;
}

function createUserLocationMarker(): HTMLElement {
  const el = document.createElement("div");
  el.className = "user-location-marker";
  el.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    border: 3px solid white;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    animation: pulse 2s infinite;
    cursor: default;
  `;
  
  // Add pulse animation style
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
  `;
  document.head.appendChild(style);
  
  return el;
}

export default function MapboxMap({ businesses, userLocation, selectedBusinessId, onBusinessSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popups = useRef<mapboxgl.Popup[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (userMarker.current) {
      userMarker.current.remove();
    }

    if (userLocation) {
      const el = createUserLocationMarker();
      userMarker.current = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      // Center map on user location
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [userLocation, mapLoaded]);

  // Update business markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    popups.current.forEach((popup) => popup.remove());
    markers.current = [];
    popups.current = [];

    // Add new markers
    const mapInstance = map.current;
    businesses.forEach((business) => {
      const el = createCustomMarker(business.category);
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: "280px",
      }).setHTML(`
        <div style="font-family: system-ui, sans-serif;">
          <div style="position: relative; height: 120px; overflow: hidden; border-radius: 8px 8px 0 0;">
            ${business.coverUrl 
              ? `<img src="${business.coverUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">${CATEGORY_ICONS[business.category] || "📍"}</span>
                </div>`
            }
          </div>
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${business.name}</h3>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="color: #fbbf24;">${"★".repeat(Math.round(business.avgRating))}${"☆".repeat(5 - Math.round(business.avgRating))}</span>
              <span style="font-size: 12px; color: #6b7280;">${business.avgRating.toFixed(1)} (${business.reviewCount})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280; margin-bottom: 8px;">
              <span>📍</span>
              <span>${business.address}</span>
            </div>
            ${business.isOpen 
              ? `<span style="display: inline-block; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 11px; font-weight: 500;">Нээлттэй</span>`
              : `<span style="display: inline-block; padding: 2px 8px; background: #fee2e2; color: #991b1b; border-radius: 999px; font-size: 11px; font-weight: 500;">Хаалттай</span>`
            }
            <a href="/business/${business.slug}" 
               style="display: block; margin-top: 12px; padding: 8px 16px; background: #3b82f6; color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;"
            >
              Цаг авах
            </a>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([business.location.lng, business.location.lat])
        .setPopup(popup)
        .addTo(mapInstance);

      marker.getElement().addEventListener("click", () => {
        onBusinessSelect(business);
      });

      markers.current.push(marker);
      popups.current.push(popup);
    });
  }, [businesses, mapLoaded, onBusinessSelect]);

  // Highlight selected business
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedBusinessId) return;

    const business = businesses.find((b) => b.id === selectedBusinessId);
    if (!business) return;

    map.current.flyTo({
      center: [business.location.lng, business.location.lat],
      zoom: 15,
      duration: 800,
    });

    // Open popup for selected business
    const index = businesses.findIndex((b) => b.id === selectedBusinessId);
    if (index >= 0 && markers.current[index]) {
      markers.current[index].togglePopup();
    }
  }, [selectedBusinessId, businesses, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Газрын зураг ачаалж байна...</p>
          </div>
        </div>
      )}
    </div>
  );
}
