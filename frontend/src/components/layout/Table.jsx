import { useState, useEffect } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { getStations } from "../../services/api";

const TABLE_HEAD = [
  "N°",
  "Station",
  "Implantation",
  "Puissance",
  "Type de prise",
  "Accessibilité",
  "Tarif",
];

const ROWS_PER_PAGE = 5;

export function Table() {
  const [tableRows, setTableRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStations();
        if (response && response.data) {
          setTableRows(response.data);
        } else if (Array.isArray(response)) {
          setTableRows(response);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des stations :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
 // Calcule de la pagination
  const totalPages = Math.ceil(tableRows.length / ROWS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = tableRows.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // PAGINATION CONSTANTE 
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      // S'il y a peu de pages, on les affiche toutes
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Si on est au début (pages 1 à 4)
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      }
      // Si on est à la fin (parmi les 4 dernières pages)
      else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      }
      // Si on est au milieu
      else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Typography className="text-gray-600 font-medium">
          Chargement des stations...
        </Typography>
      </div>
    );
  }

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
                  id_pdc,
                  id_station,
                  nom_station,
                  implantation,
                  puissance,
                  types_prise,
                  accessibilite_pmr,
                  prix_kwh_norm,
                },
                index,
              ) => {
                const isLast = index === currentRows.length - 1;
                const classes = isLast
                  ? "py-4"
                  : "py-4 border-b border-gray-300";

                return (
                  <tr key={id_pdc} className="hover:bg-gray-50">
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        {id_station}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {nom_station}
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
                        {puissance ? `${puissance} kW` : "-"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {types_prise || "Inconnu"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {accessibilite_pmr || "Non renseigné"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        className="font-normal text-gray-600"
                      >
                        {prix_kwh_norm ? `${prix_kwh_norm} €/kWh` : "Gratuit"}
                      </Typography>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>

        {/* Barre de Pagination optimisée */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-300 py-4 gap-4">
          <Typography
            variant="small"
            color="gray"
            className="font-normal whitespace-nowrap"
          >
            Page <strong className="text-gray-900">{currentPage}</strong> sur{" "}
            <strong className="text-gray-900">{totalPages}</strong>
          </Typography>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Bouton Précédent */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Précédent
            </button>

            {/* Liste dynamique des pages */}
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-gray-400 font-bold select-none"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    page === currentPage
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Bouton Suivant */}
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
