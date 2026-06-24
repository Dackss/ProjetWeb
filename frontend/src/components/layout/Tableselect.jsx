import { useState } from "react";
import { Card, Typography, Radio } from "@material-tailwind/react";

const TABLE_HEAD = [
  "N°",
  "Puissance",
  "Station",
  "Type de prise",
  "Tarif",
  "Sélection",
];

const TABLE_ROWS = [
  {
    numero: 3,
    puissance: "150 kW",
    station: "Aire d'autoroute Sud",
    typePrise: "CCS",
    tarif: "0,60 €/kWh",
  },
  {
    numero: 4,
    puissance: "7 kW",
    station: "Rue des Lilas",
    typePrise: "Type 2",
    tarif: "0,30 €/kWh",
  },
  {
    numero: 5,
    puissance: "22 kW",
    station: "Gare SNCF",
    typePrise: "Type 2",
    tarif: "0,42 €/kWh",
  },
  {
    numero: 6,
    puissance: "100 kW",
    station: "Zone Industrielle Est",
    typePrise: "CCS",
    tarif: "0,58 €/kWh",
  },
  {
    numero: 7,
    puissance: "50 kW",
    station: "Avenue Victor Hugo",
    typePrise: "CHAdeMO",
    tarif: "0,52 €/kWh",
  },
  {
    numero: 8,
    puissance: "22 kW",
    station: "Médiathèque",
    typePrise: "Type 2",
    tarif: "0,38 €/kWh",
  },
  {
    numero: 9,
    puissance: "150 kW",
    station: "Aire d'autoroute Nord",
    typePrise: "CCS",
    tarif: "0,60 €/kWh",
  },
  {
    numero: 10,
    puissance: "11 kW",
    station: "Place du Marché",
    typePrise: "Type 2",
    tarif: "0,35 €/kWh",
  },
  {
    numero: 11,
    puissance: "22 kW",
    station: "Stade Municipal",
    typePrise: "Type 2",
    tarif: "0,40 €/kWh",
  },
  {
    numero: 12,
    puissance: "50 kW",
    station: "Hôpital",
    typePrise: "CCS",
    tarif: "0,55 €/kWh",
  },
];

const ROWS_PER_PAGE = 8;

export function TabSelect() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBorne, setSelectedBorne] = useState(null); // État pour la borne sélectionnée

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
                { numero, puissance, implantation, station, typePrise, tarif },
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
                        {tarif}
                      </Typography>
                    </td>
                    {/* Colonne du Radio Bouton */}
                    <td className={classes}>
                      <Radio
                        name="borne-selection"
                        ripple={false}
                        icon={
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                        }
                        className="hover:before:opacity-0"
                        containerProps={{
                          className: "p-0",
                        }}
                        checked={selectedBorne === numero}
                        onChange={() => setSelectedBorne(numero)}
                      />
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
