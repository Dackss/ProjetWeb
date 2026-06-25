import { Link } from "react-router-dom";
import { Table } from "../components/layout/Table";
import { MapBornes } from "../components/layout/Mapleaflet";
import { ThemeProvider } from "@material-tailwind/react";

function Visualisation() {
  return (
    <div className="space-y-6 px-4">
      <h2 className="text-2xl font-bold text-center">Carte des stations de charge</h2>
      <MapBornes />
      <h2 className="text-2xl font-bold text-center">Points de charge</h2>
      <ThemeProvider>
        <Table />
      </ThemeProvider>
      <div className="flex justify-center pb-6">
        <Link
          to="/prediction-cluster"
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Prédire les clusters
        </Link>
      </div>
    </div>
  );
}

export default Visualisation;
