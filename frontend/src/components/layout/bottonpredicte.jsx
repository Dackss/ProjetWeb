import { Link } from "react-router-dom";

export function ButtonsNavigation() {
  return (
    <div className="flex gap-4 p-4 justify-center">
      <Link
        to="/prediction-pdc"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none"
      >
        Prédiction puissance
      </Link>

      <Link
        to="/prediction-pdc"
        className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none"
      >
        Prédiction implantation
      </Link>
    </div>
  );
}