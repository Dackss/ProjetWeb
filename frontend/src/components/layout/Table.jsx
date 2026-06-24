import { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";

const TABLE_HEAD = [
  "N°",
  "Puissance",
  "Implantation",
  "Station",
  "Type de prise",
  "Accessibilité",
  "Tarif",
];

// Après remplace ce tableau avec les données JSON de l'API
const TABLE_ROWS = [
  {
    numero: 1,
    puissance: "22 kW",
    implantation: "Voirie",
    station: "Place de la Mairie",
    typePrise: "Type 2",
    accessibilite: "24h/24",
    tarif: "0,40 €/kWh",
  },
  {
    numero: 2,
    puissance: "50 kW",
    implantation: "Parking",
    station: "Centre Commercial Nord",
    typePrise: "CCS",
    accessibilite: "8h-22h",
    tarif: "0,55 €/kWh",
  },
  {
    numero: 3,
    puissance: "150 kW",
    implantation: "Station-service",
    station: "Aire d'autoroute Sud",
    typePrise: "CCS",
    accessibilite: "24h/24",
    tarif: "0,60 €/kWh",
  },
  {
    numero: 4,
    puissance: "7 kW",
    implantation: "Voirie",
    station: "Rue des Lilas",
    typePrise: "Type 2",
    accessibilite: "24h/24",
    tarif: "0,30 €/kWh",
  },
  {
    numero: 5,
    puissance: "22 kW",
    implantation: "Parking",
    station: "Gare SNCF",
    typePrise: "Type 2",
    accessibilite: "6h-23h",
    tarif: "0,42 €/kWh",
  },
  {
    numero: 6,
    puissance: "100 kW",
    implantation: "Parking",
    station: "Zone Industrielle Est",
    typePrise: "CCS",
    accessibilite: "24h/24",
    tarif: "0,58 €/kWh",
  },
  {
    numero: 7,
    puissance: "50 kW",
    implantation: "Voirie",
    station: "Avenue Victor Hugo",
    typePrise: "CHAdeMO",
    accessibilite: "24h/24",
    tarif: "0,52 €/kWh",
  },
  {
    numero: 8,
    puissance: "22 kW",
    implantation: "Parking",
    station: "Médiathèque",
    typePrise: "Type 2",
    accessibilite: "9h-19h",
    tarif: "0,38 €/kWh",
  },
  {
    numero: 9,
    puissance: "150 kW",
    implantation: "Station-service",
    station: "Aire d'autoroute Nord",
    typePrise: "CCS",
    accessibilite: "24h/24",
    tarif: "0,60 €/kWh",
  },
  {
    numero: 10,
    puissance: "11 kW",
    implantation: "Voirie",
    station: "Place du Marché",
    typePrise: "Type 2",
    accessibilite: "24h/24",
    tarif: "0,35 €/kWh",
  },
  {
    numero: 11,
    puissance: "22 kW",
    implantation: "Parking",
    station: "Stade Municipal",
    typePrise: "Type 2",
    accessibilite: "7h-23h",
    tarif: "0,40 €/kWh",
  },
  {
    numero: 12,
    puissance: "50 kW",
    implantation: "Parking",
    station: "Hôpital",
    typePrise: "CCS",
    accessibilite: "24h/24",
    tarif: "0,55 €/kWh",
  },
];

const ROWS_PER_PAGE = 8;

export function Table() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(TABLE_ROWS.length / ROWS_PER_PAGE);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = TABLE_ROWS.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <section className="w-full bg-white">
      <Card className="h-full w-full overflow-scroll border border-gray-300 px-6">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-gray-300 pb-4 pt-10">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-bold leading-none"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map(
              (
                {
                  numero,
                  puissance,
                  implantation,
                  station,
                  typePrise,
                  accessibilite,
                  tarif,
                },
                index,
              ) => {
                const isLast = index === currentRows.length - 1;
                const classes = isLast
                  ? "py-4"
                  : "py-4 border-b border-gray-300";

                return (
                  <tr key={numero} className="hover:bg-gray-50">
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        {numero}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {puissance}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {implantation}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {station}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {typePrise}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {accessibilite}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {tarif}
                      </Typography>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-300 py-4">
          <Typography variant="small" color="gray" className="font-normal">
            Page {currentPage} sur {totalPages}
          </Typography>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
