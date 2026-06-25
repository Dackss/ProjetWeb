import { useState, useEffect } from "react";
import { getPointsDeCharge } from "../../services/api";

const ROWS_PER_PAGE = 20;

const COLONNES = ["", "N°", "Station", "Implantation", "Puissance", "Type de prise", "Accessibilité", "Tarif"];

export function Table({ selectedPdcId = null, onSelectPdc = () => {} }) {
  const [tableRows, setTableRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inputPage, setInputPage] = useState("1");

  useEffect(function () {
    setLoading(true);
    getPointsDeCharge({ page: currentPage, limit: ROWS_PER_PAGE })
      .then(function (result) {
        setTableRows(result.data);
        setTotal(result.total);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [currentPage]);

  let totalPages = Math.ceil(total / ROWS_PER_PAGE);
  if (totalPages < 1) totalPages = 1;

  function goToPage(page) {
    if (page < 1) return;
    if (page > totalPages) return;
    setCurrentPage(page);
    setInputPage(String(page));
  }

  function handleInputSubmit(e) {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (!isNaN(page)) goToPage(page);
  }

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Chargement des points de charge...</div>;
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <table className="w-full table-auto text-left">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            {COLONNES.map(function (col, i) {
              return (
                <th key={i} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableRows.map(function (row) {
            let puissance = "-";
            if (row.puissance) puissance = row.puissance + " kW";

            let types_prise = "Inconnu";
            if (row.types_prise) types_prise = row.types_prise;

            let accessibilite = "Non renseigné";
            if (row.accessibilite_pmr) accessibilite = row.accessibilite_pmr;

            let tarif = "Gratuit";
            if (row.prix_kwh_norm) tarif = row.prix_kwh_norm + " €/kWh";

            let trClass = "border-b border-gray-100 transition-colors hover:bg-gray-50";
            if (selectedPdcId === row.id_pdc) trClass = "border-b border-gray-100 transition-colors bg-blue-50 ring-1 ring-inset ring-blue-200";

            return (
              <tr key={row.id_pdc} className={trClass}>
                <td className="px-4 py-2 text-sm text-center">
                  <input
                    type="radio"
                    name="pdc-selection"
                    aria-label={`Sélectionner le point de charge ${row.id_pdc}`}
                    checked={selectedPdcId === row.id_pdc}
                    onChange={() => onSelectPdc(row)}
                    className="cursor-pointer accent-blue-600 w-4 h-4"
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-400">{row.id_station}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">{row.nom_station}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{row.implantation}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{puissance}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{types_prise}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{accessibilite}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{tarif}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">
          Page <strong className="text-gray-700">{currentPage}</strong> sur{" "}
          <strong className="text-gray-700">{totalPages}</strong> — {total} résultats
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={function () { goToPage(1); }} disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
            «
          </button>
          <button onClick={function () { goToPage(currentPage - 1); }} disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
            Précédent
          </button>
          <button onClick={function () { goToPage(currentPage + 1); }} disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
            Suivant
          </button>
          <button onClick={function () { goToPage(totalPages); }} disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
            »
          </button>

          <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
            <label className="text-sm text-gray-500">Aller à</label>
            <input
              type="number" min="1" max={totalPages}
              value={inputPage}
              onChange={function (e) { setInputPage(e.target.value); }}
              className="w-16 px-2 py-1 rounded border border-gray-300 text-sm text-center focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
              OK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
