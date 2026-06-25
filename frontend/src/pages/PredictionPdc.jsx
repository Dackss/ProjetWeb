import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postPrediction } from "../services/api";

function extraireFeatures(pdc, type) {
  const typesPrise = (pdc.types_prise || "").toLowerCase();

  if (type === "implantation") {
    return {
      puissance: pdc.puissance,
      nb_pdc: pdc.nb_pdc,
      latitude: pdc.latitude,
      longitude: pdc.longitude,
      gratuit: pdc.gratuit === 1,
      deux_roues: pdc.deux_roues === 1,
      prise_ccs: typesPrise.includes("ccs"),
      prise_type2: typesPrise.includes("type 2"),
      prise_chademo: typesPrise.includes("chademo"),
      prise_ef: typesPrise.includes("ef"),
      paiement_acte: pdc.paiement_acte === 1,
      paiement_cb: pdc.paiement_cb === 1,
      paiement_autre: pdc.paiement_autre === 1,
      type_tarif: pdc.type_tarif || "inconnu",
    };
  }

  return {
    nb_pdc: pdc.nb_pdc,
    implantation: pdc.implantation,
    prise_ccs: typesPrise.includes("ccs"),
    prise_type2: typesPrise.includes("type 2"),
    prise_chademo: typesPrise.includes("chademo"),
    prise_ef: typesPrise.includes("ef"),
    reservation: pdc.reservation === 1,
    condition_acces: pdc.condition_acces,
    type_tarif: pdc.type_tarif || "inconnu",
    raccordement: pdc.raccordement || "inconnu",
    operateur: pdc.nom_operateur,
  };
}

function PredictionPdc() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const pdc = location.state?.pdc;
  const type = location.state?.type;

  useEffect(function () {
    if (!pdc || !type) {
      setErreur("Aucun point de charge sélectionné.");
      setLoading(false);
      return;
    }

    postPrediction({ type, features: extraireFeatures(pdc, type) })
      .then(function (reponse) {
        setResultat(reponse.data);
      })
      .catch(function (err) {
        setErreur(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Calcul des prédictions en cours...</div>;
  }

  if (erreur) {
    return <div className="py-20 text-center text-red-500">Erreur : {erreur}</div>;
  }

  let titre = "Prédiction de la puissance nominale";
  let champPredit = "puissance";
  let scoreKey = "cv_score_f1_macro";
  let f1Key = "f1_macro_test";
  if (type === "implantation") {
    titre = "Prédiction du type d'implantation";
    champPredit = "implantation";
    scoreKey = "cv_score";
    f1Key = "f1_macro";
  }

  const meilleurePrediction = resultat[champPredit];
  const comparatif = resultat.comparatif || [];

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{titre}</h1>
        <p className="text-gray-500 mt-1">{pdc.nom_station} — {pdc.id_pdc}</p>
        <p className="mt-2">Meilleure prédiction : <strong>{meilleurePrediction}</strong></p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Algorithme</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Prédiction</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Score CV</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Accuracy test</th>
              <th className="border border-gray-300 px-4 py-2 text-left">F1 macro</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Meilleur</th>
            </tr>
          </thead>
          <tbody>
            {comparatif.map(function (ligne) {
              let trClass = "";
              if (ligne.meilleur) trClass = "bg-green-50 font-semibold";

              let labelMeilleur = "—";
              if (ligne.meilleur) labelMeilleur = "Oui";

              return (
                <tr key={ligne.algorithme} className={trClass}>
                  <td className="border border-gray-300 px-4 py-2">{ligne.algorithme}</td>
                  <td className="border border-gray-300 px-4 py-2">{ligne.prediction}</td>
                  <td className="border border-gray-300 px-4 py-2">{(ligne[scoreKey] * 100).toFixed(1)} %</td>
                  <td className="border border-gray-300 px-4 py-2">{(ligne.accuracy_test * 100).toFixed(1)} %</td>
                  <td className="border border-gray-300 px-4 py-2">{(ligne[f1Key] * 100).toFixed(1)} %</td>
                  <td className="border border-gray-300 px-4 py-2">{labelMeilleur}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-400 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
        Retour
      </button>
    </div>
  );
}

export default PredictionPdc;
