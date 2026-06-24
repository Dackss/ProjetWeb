import Cardstat from "../components/layout/Card";
import { ThemeProvider } from "@material-tailwind/react";
import { Selectdepartement } from "../components/layout/Selecte";

function Statistiques() {
  return (
    <ThemeProvider>
      {/* Conteneur principal avec du padding et une largeur max */}
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* SECTION TITRE */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl text-center font-extrabold text-gray-800">
            Statistiques
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Consultez les données et filtrez par département.
          </p>
        </div>
        <Selectdepartement />
        {/* SECTION des cards */}
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          <Cardstat head="Nombre de Station" texte="20 Stations possibles" />
          <Cardstat head="Moyenne des bornes" texte="50" />
          <Cardstat head="Type de Prise" texte="CSS" />
          <Cardstat head="Prix_Moyenne" texte="0.35 €/kw" />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Statistiques;
