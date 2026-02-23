import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
// @ts-ignore
const RoutingControl = (L as any).Routing?.control;

interface RoutingProps {
  map: any;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}

export default function Routing({ map, from, to }: RoutingProps) {
  useEffect(() => {
    if (!map) return;
    let control = RoutingControl({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      router: new (window as any).L.Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot',
      })
    }).addTo(map);
    return () => {
      // Use control.remove() which is safer for leaflet-routing-machine
      if (control && typeof control.remove === 'function') {
        try {
          control.remove();
        } catch (e) {
          // Swallow error if already removed
        }
      } else if (control && map && map.removeControl) {
        try {
          map.removeControl(control);
        } catch (e) {
          // Swallow error if already removed
        }
      }
    };
  }, [map, from, to]);
  return null;
}
