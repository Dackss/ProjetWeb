import { Table } from "../components/layout/Table";
import { MapBornes } from "../components/layout/Mapleaflet";
import { ThemeProvider } from "@material-tailwind/react";
function Visualisation() {
  return (
    <div class="text-center space-y-6">
      <h2 className="text-2xl font-bold"> Borne de Charge </h2>
      <ThemeProvider>
        <Table />
      </ThemeProvider>
      <h2 className="text-2xl font-bold"> Carte des bornes de charge </h2>
      <MapBornes />
    </div>
  );
}

export default Visualisation;
