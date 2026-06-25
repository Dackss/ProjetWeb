import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table } from "../components/layout/Table";
import { MapBornes } from "../components/layout/Mapleaflet";
import { ThemeProvider } from "@material-tailwind/react";

function Visualisation() {
  const [selectedPdc, setSelectedPdc] = useState(null);
  const navigate = useNavigate();

  function predict(type) {
    navigate("/prediction-pdc", { state: { pdc: selectedPdc, type } });
  }

  return (
    <div className="space-y-6 px-4">
      <h2 className="text-2xl font-bold text-center">Carte des stations de charge</h2>
      <MapBornes />
      <h2 className="text-2xl font-bold text-center">Points de charge</h2>
      <ThemeProvider>
        <Table selectedPdcId={selectedPdc?.id_pdc} onSelectPdc={setSelectedPdc} />
      </ThemeProvider>

      <div className="flex justify-center">
        <Link to="/prediction-cluster" className="px-4 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer">
          Prédire les clusters
        </Link>
      </div>

      <div className="flex flex-col items-center gap-2 pb-6">
        <p className="text-sm text-gray-400">Sélectionnez un point de charge dans le tableau pour prédire.</p>
        <div className="flex gap-3">
          <button
            onClick={() => predict("implantation")}
            disabled={!selectedPdc}
            className="px-4 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prédire l'implantation
          </button>
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
