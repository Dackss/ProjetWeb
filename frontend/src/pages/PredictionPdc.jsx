import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postPrediction } from "../services/api";

/**
 * FONCTION UTILITAIRE : extraireFeatures
 * Prépare et nettoie les données brutes de la borne (pdc) avant de les envoyer à l'IA.
 * Le formatage dépend du type de prédiction demandé
 */
function extraireFeatures(pdc, type) {
  // Sécurise la chaîne des types de prise en la passant en minuscules pour éviter les erreurs de casse.
  const typesPrise = (pdc.types_prise || "").toLowerCase();

  if (type === "implantation") {
    // donnée prediction implantation
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
  // Donnée prediction puissance
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

/**
 * COMPOSANT PRINCIPAL : PredictionPdc
 */
function PredictionPdc() {
  const location = useLocation();
  const navigate = useNavigate();

  // ÉTATS (States) du composant
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Récupération sécurisée des variables transmises via le Link ou le Navigate de la page précédente
  const pdc = location.state?.pdc;
  const type = location.state?.type;

  useEffect(function () {
    if (!pdc || !type) {
      setErreur("Aucun point de charge sélectionné.");
      setLoading(false);
      return;
    }

    // Appel à l'API en envoyant le type et les données nettoyées
    postPrediction({ type, features: extraireFeatures(pdc, type) })
      .then(function (reponse) {
        setResultat(reponse.data); // Enregistre le dictionnaire de résultats reçu
      })
      .catch(function (err) {
        setErreur(err.message); // Enregistre l'erreur si le serveur crash ou ne répond pas
      })
      .finally(function () {
        setLoading(false); // Désactive l'écran de chargement dans tous les cas
      });
  }, []);

  // 3. RENDUS CONDITIONNELS (Chargement ou Erreur)
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Calcul des prédictions en cours...
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="py-20 text-center text-red-500">Erreur : {erreur}</div>
    );
  }

  //  CONFIGURATION DYNAMIQUE DE L'AFFICHAGE
  // Configuration par défaut pour la prédiction de la PUISSANCE
  let titre = "Prédiction de la puissance nominale";
  let champPredit = "puissance";
  let scoreKey = "cv_score_f1_macro";
  let f1Key = "f1_macro_test";

  // Ajustement des variables si on est sur une prédiction d'IMPLANTATION
  if (type === "implantation") {
    titre = "Prédiction du type d'implantation";
    champPredit = "implantation";
    scoreKey = "cv_score";
    f1Key = "f1_macro";
  }

  // Extraction de la meilleure prédiction globale et du tableau comparatif des modèles
  const meilleurePrediction = resultat[champPredit];
  const comparatif = resultat.comparatif || [];

  // 5. RENDU DE L'INTERFACE GRAPHIQUE
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* En-tête des résultats */}
      <div>
        <h1 className="text-2xl font-bold">{titre}</h1>
        <p className="text-gray-500 mt-1">
          {pdc.nom_station} — {pdc.id_pdc}
        </p>
        <p className="mt-2">
          Meilleure prédiction : <strong>{meilleurePrediction}</strong>
        </p>
      </div>

      {/* Tableau comparatif des algorithmes de ML (RandomForest, XGBoost, etc.) */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Algorithme
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Prédiction
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Score CV
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Accuracy test
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                F1 macro
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Meilleur
              </th>
            </tr>
          </thead>
          <tbody>
            {comparatif.map(function (ligne) {
              // Style conditionnel : si le modèle est le meilleur, on colore sa ligne en vert clair
              let trClass = "";
              if (ligne.meilleur) trClass = "bg-green-50 font-semibold";

              // Affichage propre pour le booléen "meilleur"
              let labelMeilleur = "—";
              if (ligne.meilleur) labelMeilleur = "Oui";

              return (
                <tr key={ligne.algorithme} className={trClass}>
                  <td className="border border-gray-300 px-4 py-2">
                    {ligne.algorithme}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {ligne.prediction}
                  </td>
                  {/* Affichage des métriques converties en % et arrondies à 1 décimale */}
                  <td className="border border-gray-300 px-4 py-2">
                    {(ligne[scoreKey] * 100).toFixed(1)} %
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {(ligne.accuracy_test * 100).toFixed(1)} %
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {(ligne[f1Key] * 100).toFixed(1)} %
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {labelMeilleur}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bouton pour retourner à l'écran précédent */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 text-sm border border-gray-400 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
      >
        Retour
      </button>
    </div>
  );
}

export default PredictionPdc;
