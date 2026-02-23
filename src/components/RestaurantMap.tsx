import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issue with Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

interface Restaurant {
  name: string;
  lat: number;
  lng: number;
}

import { useEffect, useRef } from 'react';
// import Routing from './Routing';
import userIcon from './userIcon';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center: { lat: number; lng: number };
  zoom?: number;
  userLocation?: { lat: number; lng: number };
  onUserLocationChange?: (loc: { lat: number; lng: number }) => void;
}

export default function RestaurantMap({ restaurants, center, zoom = 15, userLocation, onUserLocationChange }: RestaurantMapProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Helper to get map instance for Routing
  // function RoutingWrapper() {
  //   const map = useMap();
  //   // Routing logic removed
  //   return null;
  // }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '60vh', width: '100%', marginBottom: 24 }}
      scrollWheelZoom={true}
      whenReady={() => {
        if (!mapRef.current && document.querySelector('.leaflet-container')) {
          // @ts-ignore
          mapRef.current = document.querySelector('.leaflet-container')._leaflet_map;
        }
      }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <RoutingWrapper /> */}
      {restaurants.map((r, i) => (
        <Marker
          key={r.name + i}
          position={[r.lat, r.lng]}
          icon={DefaultIcon}
          draggable={false}
        >
          <Popup>
            <b>{r.name}</b>
          </Popup>
        </Marker>
      ))}
      {/* User draggable marker with red icon, always on top */}
      {userLocation && onUserLocationChange && (
        <Marker
          key="user-location"
          position={[userLocation.lat, userLocation.lng]}
          draggable={true}
          icon={userIcon}
          zIndexOffset={1000}
          eventHandlers={{
            dragend: (e: any) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              onUserLocationChange({ lat: pos.lat, lng: pos.lng });
            },
          }}
        >
          <Popup>
            <b>Your location (drag me!)</b>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
