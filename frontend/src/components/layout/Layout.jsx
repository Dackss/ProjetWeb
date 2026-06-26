//Importation d'Outlet depuis react-router-dom.
// Outlet sert de "place des enfants" : c'est ici que s'afficheront les composants des sous-routes.
import { Outlet } from "react-router-dom";

//Importation des composants fixes de la structure de l'application (le haut et le bas de page).
import Header from "./Header";
import Footer from "./Footer";

/**
 * Composant Layout
 * Il sert de squelette global pour toutes les pages de l'application.
 */
function Layout() {
  return (
    // Conteneur principal en Flexbox vertical (flex-col) prenant au moins toute la hauteur de l'écran (min-h-screen)
    <div className="flex min-h-screen flex-col">
      {/* En-tête de l'application, affiché sur toutes les pages */}
      <Header />
      <main className="flex-1 p-6">
        {/* C'est ici que React Router va injecter le composant correspondant à l'URL actuelle (ex: Accueil, etc.) */}
        <Outlet />
      </main>

      {/* Pied de page de l'application, affiché sur toutes les pages */}
      <Footer />
    </div>
  );
}

// Exportation du composant pour pouvoir l'utiliser dans la configuration des routes
export default Layout;
