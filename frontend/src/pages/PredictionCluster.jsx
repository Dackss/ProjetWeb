// 1. IMPORTATIONS
import { useState, useEffect } from "react";
import { postPrediction } from "../services/api";
import { ClusterMap } from "../components/layout/Mapleaflet";

/**
 * COMPOSANT PRINCIPAL : PredictionCluster
 * Gère la récupération des données de clustering de l'IA et leur affichage cartographique.
 */
function PredictionCluster() {
  // ÉTATS (States) pour contrôler le cycle de vie des données
  const [stations, setStations] = useState([]); // Stocke le tableau des stations avec leur cluster assigné
  const [loading, setLoading] = useState(true); // Gère l'affichage du message de chargement/calcul
  const [erreur, setErreur] = useState(null); // Stocke un éventuel message d'erreur réseau ou serveur

  // EFFET : Se déclenche une seule fois lors de l'affichage initial du composant
  useEffect(function () {
    // Appel de l'API en spécifiant le type "cluster"
    // Cela déclenche généralement un algorithme de clustering côté backend (ex: K-Means)
    postPrediction({ type: "cluster" })
      .then(function (result) {
        // En cas de succès, on enregistre la liste des stations (qui contiennent maintenant une propriété cluster)
        setStations(result.data);
      })
      .catch(function (err) {
        // En cas d'échec (serveur éteint, crash Python, etc.), on capture le message d'erreur
        setErreur(err.message);
      })
      .finally(function () {
        // Qu'il y ait une erreur ou un succès, on désactive l'état de chargement
        setLoading(false);
      });
  }, []); // Le tableau de dépendances vide [] garantit que l'effet ne s'exécute qu'au montage

  //  RENDUS CONDITIONNELS

  // Écran d'attente pendant que l'algorithme de Machine Learning calcule les groupes côté backend
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Calcul des clusters en cours...
      </div>
    );
  }

  // Écran d'affichage de l'erreur si la requête a échoué
  if (erreur) {
    return (
      <div className="py-20 text-center text-red-500">Erreur : {erreur}</div>
    );
  }

  // RENDU DE L'INTERFACE (Si les données sont prêtes et sans erreur)
  return (
    // space-y-6 : Ajoute une marge de 24px entre le titre et la carte
    // px-4 : Ajoute un padding horizontal de 16px sur les côtés pour ne pas coller aux bords de l'écran
    <div className="space-y-6 px-4">
      {/* Titre centré de la page */}
      <h1 className="text-2xl font-bold text-center">
        Clusters des points de charge
      </h1>

      {/* Affichage de la carte Leaflet à laquelle on passe le tableau des stations reçues de l'API.
          Le composant ClusterMap va se charger de colorier les marqueurs en fonction de leur numéro de groupe. */}
      <ClusterMap stations={stations} />
    </div>
  );
}

// Exportation pour pouvoir l'intégrer dans le fichier de routage
export default PredictionCluster;
