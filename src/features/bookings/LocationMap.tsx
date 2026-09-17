'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

export type LatLng = { lat: number; lng: number };

// A flat duka block with an ink stem: no default Leaflet PNGs to bundle.
const pin = L.divIcon({
  className: '',
  html: '<span style="display:block;width:22px;height:22px;background:#1b6b4c;border:3px solid #f6f7f3;outline:1.5px solid #12211c;border-radius:4px"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickToMove({ onMove }: { onMove: (point: LatLng) => void }) {
  useMapEvents({
    click: (event) => onMove({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

function FollowPoint({ point }: { point: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().pad(-0.2).contains(point)) map.panTo(point);
  }, [map, point]);
  return null;
}

/** Tap or drag to put the pin on the job. Rendered client-side only. */
export default function LocationMap({
  point,
  onMove,
  serviceArea,
}: {
  point: LatLng;
  onMove: (point: LatLng) => void;
  serviceArea?: { center: LatLng; radiusM: number } | null;
}) {
  return (
    <MapContainer
      center={point}
      zoom={15}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-sm hairline sm:h-80"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {serviceArea && (
        <Circle
          center={serviceArea.center}
          radius={serviceArea.radiusM}
          pathOptions={{ color: '#1b6b4c', weight: 1.5, fillOpacity: 0.05, dashArray: '6 6' }}
        />
      )}
      <Marker
        position={point}
        icon={pin}
        draggable
        keyboard={false}
        eventHandlers={{
          dragend: (event) => {
            const { lat, lng } = (event.target as L.Marker).getLatLng();
            onMove({ lat, lng });
          },
        }}
      />
      <ClickToMove onMove={onMove} />
      <FollowPoint point={point} />
    </MapContainer>
  );
}
