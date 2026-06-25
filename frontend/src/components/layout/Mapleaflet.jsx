import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getStations } from "../../services/api";

const DEFAULT_CENTER = [48.8566, 2.3522];
const DEFAULT_ZOOM = 13;

export function MapBornes() {
  const [bornes, setBornes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBornes() {
      try {
        const result = await getStations();
        console.log("Résultat getStations:", result); 
        const data = result?.data ?? (Array.isArray(result) ? result : []);

        if (!Array.isArray(data)) {
          throw new Error("Le format de données reçu n'est pas un tableau");
        }

        if (isMounted) {
          setBornes(data);
        }
      } catch (err) {
        console.error("Erreur fetchBornes:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBornes();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600 font-medium">
        Chargement de la carte...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-500 font-medium">
        Erreur lors du chargement des bornes : {error.message}
      </div>
    );

  if (bornes.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        Aucune borne à afficher.
      </div>
    );

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-300">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        preferCanvas={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bornes.map((borne, index) => {
          const lat = parseFloat(borne.latitude);
          const lng = parseFloat(borne.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          const uniqueKey = borne.id_pdc || borne.id || `borne-marker-${index}`;

          return (
            <CircleMarker
              key={uniqueKey}
              center={[lat, lng]}
              radius={4}
              pathOptions={{
                color: "#1e3a8a",
                fillColor: "#3b82f6",
                fillOpacity: 0.8,
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{borne.nom_station || "Station sans nom"}</strong>
                  <br />
                  Puissance :{" "}
                  {borne.puissance ? `${borne.puissance} kW` : "Inconnue"}
                  <br />
                  Horaire : {borne.horaires || "Non renseigné"}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
