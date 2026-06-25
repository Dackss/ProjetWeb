import { useState, useEffect } from "react";
import Cardstat from "../components/layout/Card";
import Select from "../components/layout/Select";
import { getDepartements, getStatistiques } from "../services/api";

function topAvecPct(liste) {
  if (!liste || liste.length === 0) return "—";
  const total = liste.reduce((sum, item) => sum + Number(item.nombre), 0);
  const top = liste[0];
  const pct = Math.round((Number(top.nombre) / total) * 100);
  return `${top.libelle} (${pct}%)`;
}

function Statistiques() {
  const [departements, setDepartements] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDepartements()
      .then((res) => setDepartements(res.data))
      .catch(() => {});
  }, []);

  async function handleChange(e) {
    const dept = e.target.value;
    setSelectedDept(dept);
    if (!dept) {
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getStatistiques(dept);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const options = departements.map((d) => ({
    value: d.code_departement,
    label: `${d.code_departement} – ${d.nom_departement}`,
  }));

  const pdcParStation = stats?.nb_stations > 0
    ? (stats.nb_pdc / stats.nb_stations).toFixed(1)
    : "—";
  const topImplantation = topAvecPct(stats?.repartition_implantation);
  const topAcces = topAvecPct(stats?.repartition_condition_acces);
  const nomDept = departements.find((d) => d.code_departement === selectedDept)?.nom_departement;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
        <p className="text-slate-500 mt-1">Choisissez un département pour voir ses données.</p>
      </div>

      <Select
        value={selectedDept}
        onChange={handleChange}
        options={options}
        placeholder="Département..."
      />

      {loading && <p className="text-slate-400">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {stats && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">{nomDept}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Cardstat head="Stations" texte={stats.nb_stations} />
            <Cardstat head="Points de charge" texte={stats.nb_pdc} />
            <Cardstat head="Puissance moy. (kW)" texte={stats.puissance_moyenne ?? "—"} />
            <Cardstat head="Implantation principale" texte={topImplantation} />
            <Cardstat head="Condition d'accès" texte={topAcces} />
            <Cardstat head="PDC par station" texte={pdcParStation} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistiques;
