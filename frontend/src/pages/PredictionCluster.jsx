import { useState, useEffect } from "react";
import { postPrediction } from "../services/api";
import { ClusterMap } from "../components/layout/Mapleaflet";

function PredictionCluster() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(function () {
    postPrediction({ type: "cluster" })
      .then(function (result) {
        setStations(result.data);
      })
      .catch(function (err) {
        setErreur(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Calcul des clusters en cours...
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="py-20 text-center text-red-500">
        Erreur : {erreur}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">Clusters des points de charge</h1>
      <ClusterMap stations={stations} />
    </div>
  );
}

export default PredictionCluster;
