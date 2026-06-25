/**
 * Composant Select personnalisé et réutilisable.
 * * @param {string|number} value - La valeur actuellement sélectionnée (composant contrôlé).
 * @param {function} onChange - La fonction appelée lorsque l'utilisateur change d'option.
 * @param {Array} options - Un tableau d'objets représentant les options [{ value: '...', label: '...' }].
 * @param {string} placeholder - Texte optionnel affiché en première position (ex: "Choisir une option").
 */
export default function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      //  GESTION DE L'ÉTAT
      value={value} // Lie la valeur affichée à la variable d'état (state) du composant parent.
      onChange={onChange} // Déclenche la fonction du parent pour mettre à jour l'état quand l'utilisateur clique sur une option.
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      {/* RENDU CONDITIONNEL DU PLACEHOLDER
       */}
      {placeholder && <option value="">{placeholder}</option>}

      {/* GÉNÉRATION DYNAMIQUE DES OPTIONS*/}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}{" "}
          {/* Le texte propre et lisible qui s'affiche à l'écran pour l'utilisateur */}
        </option>
      ))}
    </select>
  );
}
