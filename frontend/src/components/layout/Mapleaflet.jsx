import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Correction d'un bug classique de react-leaflet/webpack : les icônes par défaut
// ne se chargent pas correctement. On les redéfinit explicitement via CDN.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Remplace ce tableau avec les données JSON de l'API

const BORNES = [
  {
    id: 1,
    station: "Place de la Mairie",
    puissance: "22 kW",
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: 2,
    station: "Centre Commercial Nord",
    puissance: "50 kW",
    lat: 48.8666,
    lng: 2.3422,
  },
  {
    id: 3,
    station: "Aire d'autoroute Sud",
    puissance: "150 kW",
    lat: 48.8466,
    lng: 2.3622,
  },
  {
    id: 4,
    station: "Rue des Lilas",
    puissance: "7 kW",
    lat: 48.8566,
    lng: 2.3322,
  },
];

// Centre Paris par default
const DEFAULT_CENTER = [48.8566, 2.3522];
const DEFAULT_ZOOM = 13;

export function MapBornes() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-300">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/*// Information de la borne de charge*/}
        {BORNES.map((borne) => (
          <Marker key={borne.id} position={[borne.lat, borne.lng]}>
            <Popup>
              <strong>{borne.station}</strong>
              <br />
              Puissance : {borne.puissance}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
