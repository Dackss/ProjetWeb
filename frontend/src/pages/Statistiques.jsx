import { useState, useEffect } from "react";
import Cardstat from "../components/layout/Card";
import Select from "../components/layout/Select";
import { getDepartements, getStatistiques } from "../services/api";


function BarresPourcentage({ titre, liste }) {
  if (!liste || liste.length === 0) return null;
  let total = 0;
  for (const item of liste) {
    total += Number(item.nombre);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500  tracking-wide mb-4">{titre}</h3>
      <div className="space-y-3">
        {liste.map((item) => {
          const pct = Math.round((Number(item.nombre) / total) * 100);
          return (
            <div key={item.libelle}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">{item.libelle}</span>
                <span className="text-slate-500 font-medium">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * COMPOSANT PRINCIPAL : Statistiques
 */
function Statistiques() {
  // ÉTATS (States) pour gérer les données et l'affichage
  const [departements, setDepartements] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // EFFET : Charge la liste des départements au tout premier affichage du composant
  useEffect(() => {
    getDepartements()
      .then((res) => setDepartements(res.data))
      .catch(() => {});
  }, []);

  /**
   * GESTIONNAIRE D'ÉVÉNEMENT : handleChange
   * Se déclenche dès que l'utilisateur sélectionne un autre département
   */
  async function handleChange(e) {
    const dept = e.target.value;
    setSelectedDept(dept);

    // Si l'utilisateur clique sur le choix vide (placeholder), on vide les stats et on s'arrête
    if (!dept) {
      setStats(null);
      return;
    }

    // Déclenchement du chargement
    setLoading(true);
    setError(null);

    try {
      // Récupération asynchrone des statistiques via le backend
      const data = await getStatistiques(dept);
      setStats(data); // Stockage des statistiques reçues
    } catch (err) {
      setError(err.message); // Capture de l'erreur
    } finally {
      setLoading(false); // Fin du chargement (réussi ou échoué)
    }
  }

  // PRÉPARATION DES DONNÉES POUR L'AFFICHAGE

  // Formate la liste des départements pour matcher la structure attendue par le composant <Select />
  const options = departements.map((d) => ({
    value: d.code_departement,
    label: `${d.code_departement} – ${d.nom_departement}`,
  }));

  // Calcule le nombre moyen de points de charge (PDC) par station (évite la division par zéro)
  const pdcParStation =
    stats?.nb_stations > 0
      ? (stats.nb_pdc / stats.nb_stations).toFixed(1) // Arrondi à 1 chiffre après la virgule
      : "—";

  // Recherche le nom complet du département sélectionné pour l'afficher en sous-titre
  const nomDept = departements.find(
    (d) => d.code_departement === selectedDept,
  )?.nom_departement;

  // RENDU DE L'INTERFACE
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
        <div className="w-full max-w-sm">
          <Select
            value={selectedDept}
            onChange={handleChange}
            options={options}
            placeholder="Département..."
          />
        </div>
        {loading && <p className="text-sm text-slate-400">Chargement...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {stats && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-700">{nomDept}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Cardstat head="Stations" texte={stats.nb_stations} />
            <Cardstat head="Points de charge" texte={stats.nb_pdc} />
            <Cardstat head="Puissance moy. (kW)" texte={stats.puissance_moyenne ?? "—"} />
            <Cardstat head="PDC par station" texte={pdcParStation} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarresPourcentage titre="Implantations" liste={stats.repartition_implantation} />
            <BarresPourcentage titre="Conditions d'accès" liste={stats.repartition_condition_acces} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistiques;
