import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

// Importation des styles obligatoires pour Leaflet et le système de cluster
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Service de récupération des données de l'API
import { getStations } from "../../services/api";

/**
 * ----------------------------------------------------------------------------
 * 1 : CARTE DES STATIONS CLASSIQUES (AVEC REGROUPEMENT / CLUSTERING)
 * ----------------------------------------------------------------------------
 */

/**
 * Composant de gestion des marqueurs regroupés (Marker Clustering).
 * Ce composant ne retourne rien visuellement (null) mais agit directement sur l'instance de la carte.
 */
function ClusteredMarkers({ stations }) {
  const map = useMap();

  useEffect(
    function () {
      const groupe = L.markerClusterGroup({ chunkedLoading: true });
      map.addLayer(groupe);

      const markers = [];
      for (const station of stations) {
        const lat = parseFloat(station.latitude);
        const lng = parseFloat(station.longitude);
        if (isNaN(lat) || isNaN(lng)) continue;

        const nom = station.nom_station || "Station sans nom";
        const adresse = station.adresse || "-";
        const commune = station.nom_commune || "-";
        const implantation = station.implantation || "-";
        const acces = station.condition_acces || "-";
        const operateur = station.nom_operateur || "-";

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
        markers.push(marker);
      }

      // addLayers (batch) au lieu de addLayer dans une boucle — laisse markercluster gérer le chunking
      groupe.addLayers(markers);

      return function () {
        map.removeLayer(groupe);
      };
    },
    [stations, map],
  );

  return null;
}

/**
 * Composant principal contenant le conteneur de la carte des Bornes.
 */
export function MapBornes() {
  const [stations, setStations] = useState([]); // Stockage des données des stations
  const [loading, setLoading] = useState(true); // État de chargement de l'API

  useEffect(function () {
    let mounted = true;
    getStations()
      .then(function (result) {
        if (mounted) setStations(result.data);
      })
      .catch(function (err) {
        if (mounted) console.error(err);
      })
      .finally(function () {
        if (mounted) setLoading(false);
      });
    return function () { mounted = false; };
  }, []);

  // Gestion de l'affichage conditionnel du composant de clustering
  let markersComponent = null;
  if (stations.length > 0) {
    markersComponent = <ClusteredMarkers stations={stations} />;
  }

  // Création de l'overlay (calque) de chargement avec Tailwind CSS
  let loadingOverlay = null;
  if (loading) {
    loadingOverlay = (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000] pointer-events-none">
        <span className="text-gray-600 font-medium">
          Chargement des stations...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-300 relative">
      {/* Affichage du loader par-dessus la carte si le chargement est en cours */}
      {loadingOverlay}

      {/* Conteneur principal Leaflet centré par défaut sur la France */}
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Fond de carte OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Rendu des marqueurs */}
        {markersComponent}
      </MapContainer>
    </div>
  );
}

/**
 * ----------------------------------------------------------------------------
 * PARTIE 2 : CARTE DES CLUSTERS DE MACHINE LEARNING (VISUALISATION PAR CANVAS)
 * ----------------------------------------------------------------------------
 */

// Palette de 10 couleurs prédéfinies pour différencier visuellement les groupes (clusters ML)
const COULEURS_CLUSTER = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#34495e",
  "#e91e63",
  "#00bcd4",
];

/**
 * Composant de rendu des stations sous forme de cercles de couleur via un Canvas HTML5.
 * Idéal pour afficher des milliers de points de segmentation Machine Learning sans ralentir le navigateur.
 */
function ClusterCircles({ stations }) {
  const map = useMap();

  useEffect(
    function () {
      // Utilisation du mode de rendu Canvas de Leaflet pour des performances optimales
      const renderer = L.canvas({ padding: 0.5 });
      const groupe = L.layerGroup().addTo(map);

      for (const station of stations) {
        const lat = parseFloat(station.latitude);
        const lng = parseFloat(station.longitude);
        if (isNaN(lat) || isNaN(lng)) continue;

        // Attribution d'une couleur basée sur l'ID du cluster
        const couleur =
          COULEURS_CLUSTER[station.cluster % COULEURS_CLUSTER.length];

        // Création d'un marqueur circulaire vectoriel léger
        const cercle = L.circleMarker([lat, lng], {
          renderer: renderer, // Rendu via le canvas créé plus haut
          radius: 5,
          color: couleur,
          fillColor: couleur,
          fillOpacity: 0.8,
          weight: 1,
        });

        // Ajout d'une popup minimaliste indiquant le nom et l'ID du groupe assigné par le modèle ML
        const nom = station.nom_station || "Station sans nom";
        cercle.bindPopup(
          "<strong>" + nom + "</strong><br/>Cluster : " + station.cluster,
        );
        cercle.addTo(groupe);
      }

      // Nettoyage : Retire la couche de cercles lors de la mise à jour ou de la destruction du composant
      return function () {
        map.removeLayer(groupe);
      };
    },
    [stations, map],
  );

  return null;
}

/**
 * Composant principal affichant la carte des clusters ML ainsi qu'une légende dynamique.
 */
export function ClusterMap({ stations }) {
  // --- GÉNÉRATION DE LA LÉGENDE ---
  //  Extraction de tous les numéros de clusters présents dans les données
  const tousLesClusters = stations.map(function (station) {
    return station.cluster;
  });
  //  Filtrage pour ne garder que les valeurs uniques
  const clustersUniques = [...new Set(tousLesClusters)];
  //  Tri numérique croissant (ex: Cluster 0, Cluster 1, Cluster 2...)
  clustersUniques.sort(function (a, b) {
    return a - b;
  });

  return (
    <div className="space-y-4">
      {/* Section Légende : Génère dynamiquement une pastille de couleur pour chaque cluster identifié */}
      <div className="flex flex-wrap gap-3 justify-center">
        {clustersUniques.map(function (cluster) {
          const couleur = COULEURS_CLUSTER[cluster % COULEURS_CLUSTER.length];
          return (
            <div
              key={cluster}
              className="flex items-center gap-1.5 text-sm text-gray-700"
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: couleur }}
              />
              Cluster {cluster}
            </div>
          );
        })}
      </div>

      {/* Conteneur de la carte des clusters ML */}
      <div className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-300">
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
          {/* Rendu des cercles colorés */}
          <ClusterCircles stations={stations} />
        </MapContainer>
      </div>
    </div>
  );
}
