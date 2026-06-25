import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { getStations } from "../../services/api";

function ClusteredMarkers({ stations }) {
  const map = useMap();

  useEffect(function () {
    const cluster = L.markerClusterGroup({ chunkedLoading: true });

    for (const station of stations) {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);

      if (isNaN(lat)) continue;
      if (isNaN(lng)) continue;

      let nom = station.nom_station;
      if (nom === null || nom === undefined || nom === "") {
        nom = "Station sans nom";
      }

      let adresse = station.adresse;
      if (adresse === null || adresse === undefined || adresse === "") {
        adresse = "-";
      }

      let commune = station.nom_commune;
      if (commune === null || commune === undefined || commune === "") {
        commune = "-";
      }

      let implantation = station.implantation;
      if (implantation === null || implantation === undefined || implantation === "") {
        implantation = "-";
      }

      let acces = station.condition_acces;
      if (acces === null || acces === undefined || acces === "") {
        acces = "-";
      }

      let operateur = station.nom_operateur;
      if (operateur === null || operateur === undefined || operateur === "") {
        operateur = "-";
      }

      const popup =
        "<div style='font-size:13px;line-height:1.6'>" +
        "<strong>" + nom + "</strong><br/>" +
        "<b>Adresse :</b> " + adresse + "<br/>" +
        "<b>Commune :</b> " + commune + "<br/>" +
        "<b>Implantation :</b> " + implantation + "<br/>" +
        "<b>Accès :</b> " + acces + "<br/>" +
        "<b>Opérateur :</b> " + operateur +
        "</div>";

      const marker = L.marker([lat, lng]);
      marker.bindPopup(popup);
      marker.addTo(cluster);
    }

    map.addLayer(cluster);

    return function () {
      map.removeLayer(cluster);
    };
  }, [stations, map]);

  return null;
}

export function MapBornes() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getStations()
      .then(function (result) {
        setStations(result.data);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  let markersComponent = null;
  if (stations.length > 0) {
    markersComponent = <ClusteredMarkers stations={stations} />;
  }

  let loadingOverlay = null;
  if (loading) {
    loadingOverlay = (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000] pointer-events-none">
        <span className="text-gray-600 font-medium">Chargement des stations...</span>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-300 relative">
      {loadingOverlay}
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markersComponent}
      </MapContainer>
    </div>
  );
}
