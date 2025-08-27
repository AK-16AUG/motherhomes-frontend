import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";


import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PinItem {
  id: string | number;
  latitude: number;
  longitude: number;
  img: string;
  title: string;
  bedroom: number;
  price: number;
}

interface PinProps {
  item: PinItem;
}

const Pin: React.FC<PinProps> = ({ item }) => {
  return (
    <Marker position={[item.latitude, item.longitude]} icon={customIcon}>
      <Popup>
        <div className="flex gap-5">
          <img
            src={item.img}
            alt={`${item.latitude}`}
            className="w-8 h-8 object-cover rounded"
          />
          <div className="flex flex-col justify-between">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.bedroom} bedroom</span>
            <b>$ {item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default Pin;
