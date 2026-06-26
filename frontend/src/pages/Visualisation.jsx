// IMPORTATIONS
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table } from "../components/layout/Table";
import { MapBornes } from "../components/layout/Mapleaflet";
import { ThemeProvider } from "@material-tailwind/react";

/**
 * COMPOSANT PRINCIPAL : Visualisation
 * Page centrale qui affiche la carte, le tableau, et permet de lancer les prédictions IA.
 */
function Visualisation() {
  // ÉTAT : Stocke l'objet complet du Point De Charge (PDC) sélectionné par l'utilisateur dans le tableau.
  // Initialisé à 'null' tant que l'utilisateur n'a pas cliqué sur une ligne du tableau.
  const [selectedPdc, setSelectedPdc] = useState(null);
  const navigate = useNavigate();

  /**
   * FONCTION : predict
   * Redirige l'utilisateur vers la page des résultats de l'IA en lui transmettant
   * les données de la borne sélectionnée ainsi que le type de prédiction demandé.
   * @param {string} type - Soit "implantation", soit "puissance"
   */
  function predict(type) {
    navigate("/prediction-pdc", {
      state: {
        pdc: selectedPdc,
        type,
      },
    });
  }

  // RENDU DE L'INTERFACE GRAPHIQUE
  return (
    // space-y-6 : Ajoute une marge automatique verticale de 24px entre chaque gros bloc enfant
    <div className="space-y-6 px-4">
      {/* SECTION 1 : La carte Leaflet */}
      <h2 className="text-2xl font-bold text-center">
        Carte des stations de charge
      </h2>
      <MapBornes />

      {/* SECTION 2 : Le tableau de données */}
      <h2 className="text-2xl font-bold text-center">Points de charge</h2>
      {/* Le ThemeProvider est obligatoire ici pour injecter le design de Material Tailwind dans <Table /> */}
      <ThemeProvider>
        {/* On passe l'identifiant sélectionné pour qu'il soit surbrillant, 
            et la fonction 'setSelectedPdc' pour intercepter le clic de l'utilisateur sur une ligne */}
        <Table
          selectedPdcId={selectedPdc?.id_pdc}
          onSelectPdc={setSelectedPdc}
        />
      </ThemeProvider>

      {/* Lien direct vers la prédiction globale des clusters */}
      <div className="flex justify-center">
        <Link
          to="/prediction-cluster"
          className="px-4 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer"
        >
          Prédire les clusters
        </Link>
      </div>

      {/* Zone d'action de l'IA sur la borne sélectionnée */}
      <div className="flex flex-col items-center gap-2 pb-6">
        <p className="text-sm text-gray-400">
          Sélectionnez un point de charge dans le tableau pour prédire.
        </p>

        <div className="flex gap-3">
          {/* Bouton de prédiction d'implantation */}
          <button
            onClick={() => predict("implantation")}
            disabled={!selectedPdc}
            className="px-4 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prédire l'implantation
          </button>

          {/* Bouton de prédiction de puissance */}
          <button
            onClick={() => predict("puissance")}
            disabled={!selectedPdc}
            className="px-4 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prédire la puissance nominale
          </button>
        </div>
      </div>
    </div>
  );
}

export default Visualisation;
