import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";
import L, { LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface MapItem {
  id: string | number;
  latitude: number;
  longitude: number;
  img: string;
  title: string;
  bedroom: number;
  price: number;
  [key: string]: unknown;
}

interface MapProps {
  items?: MapItem[];
}

const Map: React.FC<MapProps> = ({ items = [] }) => {
  // Calculate center based on items if available, otherwise use default India center
  const center: LatLngExpression =
    items.length > 0
      ? ([
          items.reduce((sum, item) => sum + item.latitude, 0) / items.length,
          items.reduce((sum, item) => sum + item.longitude, 0) / items.length,
        ] as [number, number])
      : [28.6139, 77.209]; // Delhi, India coordinates

  return (
    <MapContainer
      center={center}
      zoom={items.length > 0 ? 10 : 7}
      scrollWheelZoom={false}
      className="w-full h-full rounded-none"
      style={{ overflow: "hidden" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
    </MapContainer>
  );
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default Map;
