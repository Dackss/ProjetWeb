import { useState, useEffect } from "react";
import Cardstat from "../components/layout/Card";
import Select from "../components/layout/Select";
import { getDepartements, getStatistiques } from "../services/api";

/**
 * FONCTION UTILITAIRE : topAvecPct
 * Calcule l'élément majoritaire (le "top") d'une liste triée et son pourcentage par rapport au total.
 * @param {Array} liste - Exemple : [{ libelle: "Parking", nombre: 120 }, { libelle: "Voirie", nombre: 30 }]
 * @returns {string} - Exemple : "Parking (80%)"
 */
function topAvecPct(liste) {
  // Sécurité si la liste est vide ou indéfinie
  if (!liste || liste.length === 0) return "—";

  // Calcule la somme totale des bornes dans cette catégorie
  const total = liste.reduce((sum, item) => sum + Number(item.nombre), 0);

  // Récupère le premier élément (l'API renvoie normalement les données déjà triées du plus grand au plus petit)
  const top = liste[0];

  // Calcule le pourcentage arrondi à l'entier le plus proche
  const pct = Math.round((Number(top.nombre) / total) * 100);

  // Retourne la chaîne formatée
  return `${top.libelle} (${pct}%)`;
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

  // Extraction des valeurs principales textuelles grâce à la fonction utilitaire du haut
  const topImplantation = topAvecPct(stats?.repartition_implantation);
  const topAcces = topAvecPct(stats?.repartition_condition_acces);

  // Recherche le nom complet du département sélectionné pour l'afficher en sous-titre
  const nomDept = departements.find(
    (d) => d.code_departement === selectedDept,
  )?.nom_departement;

  // RENDU DE L'INTERFACE
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* En-tête de la page */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
        <p className="text-slate-500 mt-1">
          Choisissez un département pour voir ses données.
        </p>
      </div>

      {/* Menu déroulant personnalisé */}
      <Select
        value={selectedDept}
        onChange={handleChange}
        options={options}
        placeholder="Département..."
      />

      {/* Retours visuels de chargement ou d'erreur */}
      {loading && <p className="text-slate-400">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Affichage des blocs statistiques uniquement si les données sont disponibles */}
      {stats && (
        <div>
          {/* Titre avec le nom du département sélectionné */}
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            {nomDept}
          </h2>

          {/* Grille responsive : 2 colonnes sur mobile, 3 sur écran moyen/large */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Cardstat head="Stations" texte={stats.nb_stations} />
            <Cardstat head="Points de charge" texte={stats.nb_pdc} />
            {/* Si puissance_moyenne est null ou undefined, affiche "—" */}
            <Cardstat
              head="Puissance moy. (kW)"
              texte={stats.puissance_moyenne ?? "—"}
            />
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
